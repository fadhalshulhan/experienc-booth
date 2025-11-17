import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback, useRef, type CSSProperties, type ReactNode } from 'react';
import { Pointer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRipple } from '@/hooks/useRipple';
import { getBoothConfig, BoothConfig } from '@/config/booths';
import { useVideoManager } from '@/hooks/useVideoManager';
import { useVideoPreloader } from '@/hooks/useVideoPreloader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingScreen from '@/components/LoadingScreen';
import RecommendationCard from '@/components/RecommendationCard';

declare global {
  interface Window {
    conversationActive?: boolean;
  }
}

interface ExperienceBoothProps {
  boothId?: string;
}

interface ConversationSession {
  endSession: () => Promise<void>;
  sendUserMessage?: (text: string) => void;
  sendUserActivity?: () => void;
}

type ConversationMode = {
  mode: 'speaking' | 'listening' | 'thinking' | string;
};

type ToolState = Record<string, unknown> & {
  message?: string | null;
  currentEffect?: string;
  currentScreen?: string;
};

interface PhoneNumberToolPayload {
  prompt?: string;
  placeholder?: string;
  defaultValue?: string;
  title?: string;
}

interface PhoneCaptureState {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  isSubmitting: boolean;
  error?: string;
}

interface ConsultationData {
  age?: string;
  snack_menu?: string;
  bmi?: string;
  ideal_weight?: string;
  medical_history?: string;
  bmi_status?: string;
  exercise?: string;
  goal?: string;
  name?: string;
  height?: string;
  breakfast_menu?: string;
  recommendation?: string;
  lunch_menu?: string;
  gender?: string;
  calorie_recommendation?: string;
  dinner_menu?: string;
  weight?: string;
}

type ClientTools = {
  show_message: (params: { message: string; duration?: number }) => Promise<string>;
  trigger_effect: (params: { effect: string }) => Promise<string>;
  update_data: (params: { key: string; value: unknown }) => Promise<string>;
  navigate: (params: { screen: string }) => Promise<string>;
  end_conversation: () => Promise<string>;
  finish_interview: (params: Record<string, unknown>) => Promise<string>;
  show_selected_drink: (params: { name?: string; drink_name?: string; name_product?: string }) => Promise<string>;
  create_report?: (params: ConsultationData) => Promise<string>;
  request_phone_number?: (params?: PhoneNumberToolPayload) => Promise<string>;
};

const DEFAULT_TOOL_DURATION = 5000;

const startButtonVariants = {
  idle: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.04, 1],
    transition: {
      duration: 3,
      ease: [0.42, 0, 0.58, 1] as const,
      repeat: Infinity,
    },
  },
  starting: {
    scale: [1, 0.98, 1],
    opacity: [1, 0.85, 1],
    transition: {
      duration: 1,
      ease: [0.42, 0, 0.58, 1] as const,
      repeat: Infinity,
    },
  },
};

const getBoothConfiguration = (boothId?: string): BoothConfig =>
  getBoothConfig(boothId);

export default function ExperienceBooth({ boothId }: ExperienceBoothProps) {
  const config = useMemo<BoothConfig>(() => getBoothConfiguration(boothId), [boothId]);
  const hasInitializedPlaybackRef = useRef<boolean>(false);
  const [endRequested, setEndRequested] = useState<boolean>(false);

  const { isLoading: videosLoading, progress: videoProgress } = useVideoPreloader(config.videos);

  const [conversation, setConversation] = useState<ConversationSession | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [conversationActive, setConversationActive] = useState<boolean>(false);
  const [startingConversation, setStartingConversation] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('idle');
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [recommendationState, setRecommendationState] = useState<{ id: string; label: 'recommended' | 'selected' } | null>(null);
  const [toolState, setToolState] = useState<ToolState>({});
  const [consultationData, setConsultationData] = useState<ConsultationData>({});
  const [printUrl, setPrintUrl] = useState<string | null>(null);
  const [reportCreated, setReportCreated] = useState<boolean>(false);
  const [phoneCaptureState, setPhoneCaptureState] = useState<PhoneCaptureState | null>(null);
  const startRipple = useRipple();
  const phoneCapturePromiseRef = useRef<{ resolve: (value: string) => void; reject: (reason?: string) => void } | null>(null);

  const applyRecommendation = useCallback((id: string | null, label: 'recommended' | 'selected' = 'recommended') => {
    if (!id) {
      setRecommendationState(null);
      return;
    }
    setRecommendationState({ id, label });
  }, []);

  const {
    currentState,
    currentVideoUrl,
    playIdleVideo,
    playTalkingVideo,
    playThinkingVideo,
    playToolVideo,
    resetToIdle,
    handleVideoEnded,
  } = useVideoManager({
    videos: config.videos,
    onVideoChange: (url, state) => {
      console.debug('Video changed:', state, url);
    },
  });

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }, []);

  // Function to create report for HealthyGo
  const createReport = useCallback(async (data: ConsultationData): Promise<string> => {
    try {
      const reportData = {
        age: data.age || '',
        snack_menu: data.snack_menu || '',
        bmi: data.bmi || '',
        ideal_weight: data.ideal_weight || '',
        medical_history: data.medical_history || '',
        bmi_status: data.bmi_status || '',
        exercise: data.exercise || '',
        goal: data.goal || '',
        name: data.name || '',
        height: data.height || '',
        breakfast_menu: data.breakfast_menu || '',
        recommendation: data.recommendation || recommendationState?.id || '',
        lunch_menu: data.lunch_menu || '',
        gender: data.gender || '',
        calorie_recommendation: data.calorie_recommendation || '',
        dinner_menu: data.dinner_menu || '',
        weight: data.weight || '',
      };

      // Step 1: Generate PDF first
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          boothId: config.id,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error(`PDF generation failed: ${pdfResponse.status}`);
      }

      // Get PDF blob
      const pdfBlob = await pdfResponse.blob();

      // Step 2: Convert PDF to base64 for webhook
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64 = base64String.split(',')[1] || base64String;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      // Step 3: Send report data + PDF to webhook
      const webhookResponse = await fetch('https://workflows.cekat.ai/webhook/healthy-go/innov', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportData,
          pdf_base64: pdfBase64,
          pdf_filename: `healthygo-report-${data.name || 'customer'}-${Date.now()}.pdf`,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook request failed: ${webhookResponse.status}`);
      }

      // Step 4: Send PDF to print endpoint as file
      try {
        const printFormData = new FormData();
        const pdfFileName = `healthygo-report-${data.name || 'customer'}-${Date.now()}.pdf`;
        printFormData.append('file', pdfBlob, pdfFileName);

        const printResponse = await fetch('https://nontestable-odelia-isomerically.ngrok-free.dev/print', {
          method: 'POST',
          body: printFormData,
        });

        if (!printResponse.ok) {
          console.warn('Print request failed, but report was created:', printResponse.status);
        } else {
          console.debug('PDF sent to printer successfully');
        }
      } catch (printError) {
        // Print error is not critical, just log it
        console.warn('Failed to send PDF to printer:', printError);
      }

      // Store print URL (PDF is generated on-demand, not stored permanently)
      setPrintUrl('https://nontestable-odelia-isomerically.ngrok-free.dev/print');
      setReportCreated(true);

      // Clean up: PDF is not stored permanently, only generated on-demand
      // The blob will be garbage collected after use
      // PDF has been sent to:
      // 1. Webhook (as base64 in JSON)
      // 2. Print endpoint (as file in FormData)
      
      console.debug('Report created successfully with PDF. PDF sent to webhook and print endpoint.');
      return 'Report created successfully. PDF is ready for printing.';
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error(`Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [recommendationState, config.id]);

  const resetPhoneCapture = useCallback(() => {
    setPhoneCaptureState(null);
    phoneCapturePromiseRef.current = null;
  }, []);

  const resolvePhoneCapture = useCallback((value: string) => {
    phoneCapturePromiseRef.current?.resolve(value);
    resetPhoneCapture();
  }, [resetPhoneCapture]);

  const rejectPhoneCapture = useCallback((reason?: string) => {
    phoneCapturePromiseRef.current?.reject(reason ?? 'Phone capture dismissed');
    resetPhoneCapture();
  }, [resetPhoneCapture]);

  const openPhoneCapture = useCallback((params: PhoneNumberToolPayload = {}) => {
    return new Promise<string>((resolve, reject) => {
      phoneCapturePromiseRef.current = { resolve, reject };
      setPhoneCaptureState({
        title: params.title ?? 'Konfirmasi Nomor Telepon',
        description: params.prompt ?? 'Silakan pastikan nomor telepon Anda sudah benar sebelum melanjutkan.',
        placeholder: params.placeholder ?? '08xxxxxxxxxx',
        value: params.defaultValue ?? '',
        isSubmitting: false,
      });
    });
  }, []);

  const handlePhoneInputChange = useCallback(
    (nextValue: string) => {
      setPhoneCaptureState((prev) => (prev ? { ...prev, value: nextValue, error: undefined } : prev));
      try {
        conversation?.sendUserActivity?.();
      } catch (error) {
        console.debug('sendUserActivity failed:', error);
      }
    },
    [conversation],
  );

  const handlePhoneSubmit = useCallback(() => {
    if (!phoneCaptureState) {
      return;
    }
    const trimmed = phoneCaptureState.value.trim();
    if (!trimmed) {
      setPhoneCaptureState({ ...phoneCaptureState, error: 'Nomor telepon belum diisi.' });
      return;
    }
    if (!conversation) {
      setErrorMessage('Percakapan belum siap menerima input.');
      return;
    }
    if (!conversation.sendUserMessage) {
      setErrorMessage('Agent belum siap menerima nomor telepon.');
      return;
    }

    try {
      setPhoneCaptureState((prev) => (prev ? { ...prev, isSubmitting: true, error: undefined } : prev));
      conversation.sendUserMessage(trimmed);
      resolvePhoneCapture(trimmed);
    } catch (error) {
      console.error('Failed to send user message:', error);
      setPhoneCaptureState((prev) => (prev ? { ...prev, isSubmitting: false, error: 'Gagal mengirim nomor, coba lagi.' } : prev));
    }
  }, [conversation, phoneCaptureState, resolvePhoneCapture]);

  const handlePhoneCancel = useCallback(() => {
    rejectPhoneCapture('User cancelled phone confirmation');
  }, [rejectPhoneCapture]);

  useEffect(() => {
    if (!conversation && phoneCaptureState) {
      rejectPhoneCapture('Conversation ended before confirmation');
    }
  }, [conversation, phoneCaptureState, rejectPhoneCapture]);

  const clientTools: ClientTools & { end_conversation: () => Promise<string> } = useMemo(() => ({
    show_message: async ({ message, duration = DEFAULT_TOOL_DURATION }: { message: string; duration?: number }) => {
      setToolState((prev) => ({ ...prev, message }));

      playToolVideo('show_message');

      window.setTimeout(() => {
        setToolState((prev) => ({ ...prev, message: null }));
      }, duration);

      return `Message displayed: ${message}`;
    },

    trigger_effect: async ({ effect }: { effect: string }) => {
      console.debug('Triggering effect:', effect);
      setToolState((prev) => ({ ...prev, currentEffect: effect }));
      playToolVideo(effect);
      return `Effect triggered: ${effect}`;
    },

    update_data: async ({ key, value }: { key: string; value: unknown }) => {
      setToolState((prev) => ({ ...prev, [key]: value }));

      // Store consultation data for HealthyGo
      if (config.id === 'healthygo') {
        const consultationKeys: (keyof ConsultationData)[] = [
          'age', 'snack_menu', 'bmi', 'ideal_weight', 'medical_history',
          'bmi_status', 'exercise', 'goal', 'name', 'height',
          'breakfast_menu', 'recommendation', 'lunch_menu', 'gender',
          'calorie_recommendation', 'dinner_menu', 'weight',
        ];

        if (consultationKeys.includes(key as keyof ConsultationData)) {
          setConsultationData((prev) => ({
            ...prev,
            [key]: typeof value === 'string' ? value : String(value || ''),
          }));
        }
      }

      if (key === 'recommendation' || key === 'menu_item') {
        if (typeof value === 'string') {
          applyRecommendation(value, 'recommended');
          // Update consultation data with recommendation
          if (config.id === 'healthygo') {
            setConsultationData((prev) => ({
              ...prev,
              recommendation: value,
            }));
          }
        } else if (value === null) {
          applyRecommendation(null);
        }
      }

      if (key === 'clear_recommendation') {
        applyRecommendation(null);
      }

      if (key === 'show_selected_drink') {
        if (typeof value === 'string') {
          applyRecommendation(value, 'selected');
        } else if (value === null) {
          applyRecommendation(null);
        }
      }

      return `Data updated: ${key}`;
    },

    navigate: async ({ screen }: { screen: string }) => {
      console.debug('Navigate to:', screen);
      setToolState((prev) => ({ ...prev, currentScreen: screen }));
      return `Navigated to: ${screen}`;
    },
    end_conversation: async () => {
      setEndRequested(true);
      return 'Conversation ending requested.';
    },
    show_selected_drink: async ({ name, drink_name, name_product }) => {
      const candidate = name ?? drink_name ?? name_product;

      if (!candidate || typeof candidate !== 'string') {
        return 'No drink name provided.';
      }

      applyRecommendation(candidate, 'selected');
      return `Selected drink shown: ${candidate}`;
    },
    finish_interview: async (payload) => {
      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.NEXT_PUBLIC_REPORT_SECRET
              ? { 'x-report-secret': process.env.NEXT_PUBLIC_REPORT_SECRET }
              : {}),
          },
          body: JSON.stringify({
            ...payload,
            boothId: config.id,
            recommendation: recommendationState?.id ?? null,
          }),
        });

        if (!response.ok) {
          throw new Error(`Report request failed: ${response.status}`);
        }

        setToolState((prev) => ({
          ...prev,
          reportStatus: 'sent',
        }));

        setErrorMessage('Interview summary sent to printer.');
      } catch (error) {
        console.error('finish_interview error:', error);
        setErrorMessage('Failed to send report, please retry.');
      }

      return 'Interview summary dispatched.';
    },
    ...(config.id === 'cekat'
      ? {
          request_phone_number: async (params?: PhoneNumberToolPayload) => {
            const confirmedNumber = await openPhoneCapture(params);
            return `Phone number confirmed: ${confirmedNumber}`;
          },
        }
      : {}),
    // create_report tool for HealthyGo only
    // This is a CLIENT TOOL, not a webhook tool
    // Tool must be configured in ElevenLabs as "Client Tool" not "Webhook Tool"
    // Tool accepts all consultation data parameters and generates PDF automatically
    ...(config.id === 'healthygo' ? {
      create_report: async (params: ConsultationData) => {
        try {
          // Merge params from ElevenLabs agent with existing consultation data
          // All fields from schema are optional, we merge with existing data
          const reportData: ConsultationData = {
            // Existing consultation data (from update_data calls)
            ...consultationData,
            // Override with params from agent (agent can pass all or some fields)
            ...params,
            // Ensure recommendation is set (priority: params > consultationData > recommendationState)
            recommendation: params.recommendation || consultationData.recommendation || recommendationState?.id || '',
            // Ensure all required fields have values (empty string if not provided)
            age: params.age || consultationData.age || '',
            snack_menu: params.snack_menu || consultationData.snack_menu || '',
            bmi: params.bmi || consultationData.bmi || '',
            ideal_weight: params.ideal_weight || consultationData.ideal_weight || '',
            medical_history: params.medical_history || consultationData.medical_history || '',
            bmi_status: params.bmi_status || consultationData.bmi_status || '',
            exercise: params.exercise || consultationData.exercise || '',
            goal: params.goal || consultationData.goal || '',
            name: params.name || consultationData.name || '',
            height: params.height || consultationData.height || '',
            breakfast_menu: params.breakfast_menu || consultationData.breakfast_menu || '',
            lunch_menu: params.lunch_menu || consultationData.lunch_menu || '',
            gender: params.gender || consultationData.gender || '',
            calorie_recommendation: params.calorie_recommendation || consultationData.calorie_recommendation || '',
            dinner_menu: params.dinner_menu || consultationData.dinner_menu || '',
            weight: params.weight || consultationData.weight || '',
          };

          // Generate PDF and send to webhook + print endpoint
          const result = await createReport(reportData);
          return result;
        } catch (error) {
          console.error('create_report error:', error);
          return `Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      },
    } : {}),
  }), [applyRecommendation, playToolVideo, recommendationState?.id, config.id, consultationData, createReport, openPhoneCapture]);

  const handleStartConversation = useCallback(async () => {
    setStartingConversation(true);
    setErrorMessage(null);
    setConnectionStatus('connecting');
    setConnectionNotice('Connecting to AI...');

    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required for the conversation.');
        setStartingConversation(false);
        return;
      }

      const { Conversation } = await import('@elevenlabs/client');

      const signedUrlResponse = await fetch(
        boothId ? `/api/signed-url?boothId=${encodeURIComponent(boothId)}` : '/api/signed-url',
      );
      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get signed URL');
      }
      const signedUrlData: { signedUrl: string } = await signedUrlResponse.json();

      const newConversation = await Conversation.startSession({
        signedUrl: signedUrlData.signedUrl,
        clientTools,
        onConnect: () => {
          console.debug('Connected to ElevenLabs');
          setIsConnected(true);
          setConversationActive(true);
          setStartingConversation(false);
          window.conversationActive = true;
          playIdleVideo();
          setConnectionStatus('ready');
          setConnectionNotice(null);
        },
        onDisconnect: () => {
          console.debug('Disconnected from ElevenLabs');
          setIsConnected(false);
          setConversationActive(false);
          setIsSpeaking(false);
          setIsListening(false);
          window.conversationActive = false;
          resetToIdle();
          setRecommendationState(null);
          setConnectionStatus('disconnected');
          setConnectionNotice('Koneksi terputus. Tekan Restart untuk mencoba lagi.');
        },
        onError: (error: unknown) => {
          console.error('Conversation error:', error);
          setErrorMessage('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.');
          setStartingConversation(false);
          setConversation(null);
          setConversationActive(false);
          setIsSpeaking(false);
          setIsListening(false);
          resetToIdle();
          setRecommendationState(null);
          setConnectionStatus('error');
          setConnectionNotice('Terjadi gangguan jaringan. Silakan mulai ulang.');
        },
        onModeChange: (mode: ConversationMode) => {
          console.debug('Mode changed:', mode);
          const speaking = mode.mode === 'speaking';
          const listening = mode.mode === 'listening';

          setIsSpeaking(speaking);
          setIsListening(listening);

          if (speaking) {
            playTalkingVideo();
          } else if (listening) {
            playThinkingVideo();
          } else {
            playIdleVideo();
          }
        },
        onVolumeChange: (volume: number) => {
          setVolumeLevel(volume);
        },
        onStatusChange: (status: string) => {
          setConnectionStatus(status);
          if (status === 'connecting' && conversationActive) {
            setConnectionNotice('Menghubungkan ulang ke AI...');
          } else if (status === 'ready') {
            setConnectionNotice(null);
          }
        },
      });

      setConversation(newConversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setErrorMessage('Failed to start conversation. Please try again.');
      setStartingConversation(false);
    }
  }, [boothId, clientTools, playIdleVideo, playTalkingVideo, playThinkingVideo, requestMicrophonePermission, resetToIdle]);

  const handleEndConversation = useCallback(async () => {
    if (!conversation) {
      return;
    }

    await conversation.endSession();
    setConversation(null);
    setConversationActive(false);
    setIsSpeaking(false);
    setIsListening(false);
    window.conversationActive = false;
    resetToIdle();
    setRecommendationState(null);
  }, [conversation, resetToIdle]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (conversationActive) {
        try {
          void handleEndConversation();
        } catch (error) {
          console.warn('Error ending conversation before unload:', error);
        }
      }
    };

    const handlePopState = () => {
      if (conversationActive) {
        void handleEndConversation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [conversationActive, handleEndConversation]);

  const handleRestartConversation = useCallback(async () => {
    await handleEndConversation();
    window.setTimeout(() => {
      void handleStartConversation();
    }, 500);
  }, [handleEndConversation, handleStartConversation]);

  useEffect(() => {
    if (!endRequested) {
      return;
    }
    setEndRequested(false);
    void handleEndConversation();
  }, [endRequested, handleEndConversation]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }
    const timeout = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(timeout);
  }, [errorMessage]);

  useEffect(() => {
    if (hasInitializedPlaybackRef.current) {
      return;
    }
    hasInitializedPlaybackRef.current = true;
    playIdleVideo();
  }, [playIdleVideo]);

  useEffect(() => {
    if (!conversationActive) {
      setConnectionNotice(null);
      setConnectionStatus('idle');
    }
  }, [conversationActive]);

  const previewSource =
    typeof config.videos.preview === 'string' ? (config.videos.preview as string) : undefined;
  const previewIsImage = Boolean(
    previewSource && /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(previewSource.split('?')[0] ?? ''),
  );
  const showImagePreview = Boolean(previewIsImage && previewSource && !conversationActive);
  const shouldUsePreviewVideo = Boolean(previewSource && !previewIsImage && !conversationActive);
  const videoSource = shouldUsePreviewVideo ? previewSource! : currentVideoUrl;
  const shouldLoop = shouldUsePreviewVideo || currentState === 'talking' || currentState === 'thinking';
  const recommendationMap = config.recommendations ?? {};
  const currentRecommendation = recommendationState ? recommendationMap[recommendationState.id] ?? null : null;

  useEffect(() => {
    if (recommendationState?.label === 'recommended') {
      playToolVideo('writing_report');
    }
  }, [recommendationState, playToolVideo]);

  useEffect(() => {
    if (!recommendationState) {
      return;
    }
    if (!recommendationMap[recommendationState.id]) {
      setErrorMessage('Recommendation unavailable for this booth.');
      setRecommendationState(null);
      return;
    }

    const count = recommendationState.label === 'selected' ? 160 : 80;
    const spread = recommendationState.label === 'selected' ? 80 : 55;
    void confetti({
      particleCount: count,
      spread,
      angle: 90,
      origin: { x: 0.5, y: 0.85 },
      ticks: 200,
      colors: [config.theme.primary, config.theme.accent, '#ffffff'],
      disableForReducedMotion: true,
    });
  }, [recommendationState, recommendationMap]);

  return (
    <>
      <Head>
        <title>{`${config.name} | Experience Booth`}</title>
        <link rel="icon" href={config.favicon ?? config.logo} />
      </Head>
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{
          backgroundColor: config.theme.background,
          color: config.theme.text,
        }}
      >
      {videosLoading && (
        <LoadingScreen
          config={config}
          progress={videoProgress.percentage}
          message="Loading experience..."
        />
      )}

      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full" style={{ maxWidth: 'min(100%, 60vh)' }}>
            <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={
                    showImagePreview
                      ? 'preview-image'
                      : shouldUsePreviewVideo
                        ? 'preview-video'
                        : `${currentState}-${currentVideoUrl}`
                  }
                  className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/10 shadow-[0_18px_65px_-35px_rgba(0,0,0,0.75)] shadow-black/30 backdrop-blur-sm"
                  initial={{ opacity: 0.85, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.85, scale: 0.995 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {showImagePreview && previewSource ? (
                    <Image
                      src={previewSource}
                      alt={`${config.name} preview`}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 60vh"
                      className="object-cover"
                    />
                  ) : (
                    <VideoPlayer
                      key={videoSource}
                      videoUrl={videoSource}
                      loop={shouldLoop}
                      objectFit="cover"
                      onEnded={shouldUsePreviewVideo ? undefined : handleVideoEnded}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      <AnimatePresence>
        {!conversationActive && (
          <motion.div
            key="start-button"
            className="absolute inset-x-0 z-20 flex justify-center px-6"
            style={{ bottom: 'calc(120px + env(safe-area-inset-bottom))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.button
              onClick={handleStartConversation}
              disabled={startingConversation}
              className="pointer-events-auto relative flex max-w-[420px] items-center justify-center gap-3 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_16px_35px_-20px_rgba(0,0,0,0.85)] backdrop-blur-lg transition-all duration-200 sm:px-10 sm:py-4 sm:text-base"
              whileHover={startingConversation ? undefined : { scale: 1.03 }}
              whileTap={startingConversation ? undefined : { scale: 0.97 }}
              onPointerDown={startRipple.createRipple}
              variants={startButtonVariants}
              animate={startingConversation ? 'starting' : 'pulse'}
              style={{ backgroundColor: startingConversation ? `${config.theme.primary}cc` : `${config.theme.primary}b5` }}
            >
              {startingConversation ? (
                <>
                  <div className="h-5 w-5 rounded-full border-[3px] border-white border-t-transparent animate-spin sm:h-6 sm:w-6 sm:border-[3px]" />
                  <span className="tracking-normal sm:text-[18px]">Connecting...</span>
                </>
              ) : (
                <>
                  <Pointer size={24} className="transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-center">Start Conversation</span>
                </>
              )}

              <AnimatePresence>
                {startRipple.ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    className="pointer-events-none absolute rounded-full bg-white/45 blur-[2px]"
                    style={{
                      top: ripple.y,
                      left: ripple.x,
                      width: ripple.size,
                      height: ripple.size,
                    }}
                    initial={{ opacity: 0.4, scale: 0 }}
                    animate={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    onAnimationComplete={() => startRipple.removeRipple(ripple.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <Header config={config} isCompact={conversationActive} />

      <Footer
        config={config}
        isActive={conversationActive}
        isSpeaking={isSpeaking || isListening}
        onRestart={handleRestartConversation}
        onEnd={handleEndConversation}
        volumeLevel={volumeLevel}
        showControls={conversationActive}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(220px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error-toast"
                className="w-auto max-w-full rounded-2xl bg-red-700/95 px-5 py-2 text-center text-xs font-semibold text-white shadow-xl backdrop-blur"
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toolState.message && (
          <motion.div
            className="absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-8 py-4 shadow-2xl"
            style={{
              backgroundColor: `${config.theme.primary}dd`,
              color: config.theme.onPrimary,
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-2xl font-bold">{toolState.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentRecommendation && (
          <RecommendationCard
            key={currentRecommendation.id}
            item={currentRecommendation}
            theme={config.theme}
            label={recommendationState?.label === 'selected' ? 'Selected Drink' : 'Recommended'}
            onClose={() => setRecommendationState(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phoneCaptureState && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-white/95 p-6 text-slate-900 shadow-2xl backdrop-blur-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Konfirmasi
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900">{phoneCaptureState.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{phoneCaptureState.description}</p>
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Nomor Telepon
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+ ]*"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-semibold tracking-wide text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder={phoneCaptureState.placeholder}
                    value={phoneCaptureState.value}
                    onChange={(event) => handlePhoneInputChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handlePhoneSubmit();
                      }
                    }}
                  />
                </label>

                {phoneCaptureState.error && (
                  <p className="text-sm font-semibold text-red-500">{phoneCaptureState.error}</p>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                    onClick={handlePhoneCancel}
                    disabled={phoneCaptureState.isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handlePhoneSubmit}
                    disabled={phoneCaptureState.isSubmitting || !phoneCaptureState.value.trim()}
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
  );
}

