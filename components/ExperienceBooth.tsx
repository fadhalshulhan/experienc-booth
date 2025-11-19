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

interface ConsultationResult {
  main_goal: string;
  industry: string;
  business_name: string;
  main_channels: string[];
  role: string;
}

interface ShowReportParams {
  number?: string;
  result_consultation?: ConsultationResult;
  name?: string;
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
  show_report?: (params: ShowReportParams) => Promise<string>;
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
  const isJagoBooth = config.id === 'jago';
  const hasInitializedPlaybackRef = useRef<boolean>(false);
  const [endRequested, setEndRequested] = useState<boolean>(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number>(0);

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

  const startButtonStyle = useMemo<CSSProperties>(
    () =>
      isJagoBooth
        ? {
            backgroundColor: config.theme.primary, // Red background for Jago
            boxShadow: 'none',
            // Border-radius handled by CSS class via data attribute for responsive 4K support
          }
        : {
            backgroundColor: startingConversation ? `${config.theme.primary}cc` : `${config.theme.primary}b5`,
            borderRadius: '9999px', // rounded-full
          },
    [config.theme.primary, isJagoBooth, startingConversation],
  );

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
    // Tools for Cekat booth only
    ...(config.id === 'cekat'
      ? {
          request_phone_number: async (params?: PhoneNumberToolPayload) => {
            const confirmedNumber = await openPhoneCapture(params);
            return `Phone number confirmed: ${confirmedNumber}`;
          },
          show_report: async (params: ShowReportParams) => {
            try {
              // Validate required fields
              if (!params.name || params.name.trim() === '') {
                throw new Error('Nama customer harus diisi');
              }

              if (!params.result_consultation) {
                throw new Error('Data konsultasi harus diisi');
              }

              const consultation = params.result_consultation;
              if (!consultation.main_goal || !consultation.industry || !consultation.business_name || !consultation.role) {
                throw new Error('Data konsultasi tidak lengkap');
              }

              // Show phone capture popup with pre-filled number if provided
              const phoneNumber = await openPhoneCapture({
                title: 'Konfirmasi Nomor Telepon',
                prompt: 'Silakan pastikan nomor telepon Anda sudah benar sebelum melanjutkan.',
                placeholder: '08xxxxxxxxxx',
                defaultValue: params.number || '',
              });

              // Update tool state to show report summary (optional, for UI feedback)
              setToolState((prev) => ({
                ...prev,
                reportStatus: 'shown',
                reportData: {
                  name: params.name,
                  phoneNumber: phoneNumber,
                  consultation: consultation,
                },
              }));

              playToolVideo('show_report');

              return `Report summary ditampilkan untuk ${params.name}`;
            } catch (error) {
              console.error('show_report error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              setErrorMessage(`Gagal menampilkan report: ${errorMessage}`);
              return `Failed to show report: ${errorMessage}`;
            }
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

  const previewVideos = useMemo<string[]>(() => {
    const preview = config.videos.preview;
    if (typeof preview === 'string') {
      return [preview];
    }
    if (Array.isArray(preview) && preview.length > 0) {
      return preview;
    }
    return [];
  }, [config.videos.preview]);

  const previewSource = previewVideos.length > 0 ? previewVideos[currentPreviewIndex] : undefined;

  const handlePreviewVideoEnded = useCallback(() => {
    if (previewVideos.length > 1) {
      // Move to next video in the array, loop back to 0 if at the end
      setCurrentPreviewIndex((prev) => (prev + 1) % previewVideos.length);
    }
  }, [previewVideos.length]);

  // Reset preview index when conversation starts
  useEffect(() => {
    if (conversationActive) {
      setCurrentPreviewIndex(0);
    }
  }, [conversationActive]);

  const previewIsImage = Boolean(
    previewSource && /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(previewSource.split('?')[0] ?? ''),
  );
  const showImagePreview = Boolean(previewIsImage && previewSource && !conversationActive);
  const shouldUsePreviewVideo = Boolean(previewSource && !previewIsImage && !conversationActive);
  const videoSource = shouldUsePreviewVideo ? previewSource! : currentVideoUrl;
  const shouldLoop = (shouldUsePreviewVideo && previewVideos.length <= 1) || currentState === 'talking' || currentState === 'thinking';
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[56.25vh]" style={{ aspectRatio: '9/16' }}>
            <div className="relative w-full h-full">
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={
                    showImagePreview
                      ? 'preview-image'
                      : shouldUsePreviewVideo
                        ? `preview-video-${currentPreviewIndex}`
                        : `${currentState}-${currentVideoUrl}`
                  }
                  className="absolute inset-0 overflow-hidden"
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
                      sizes="(max-width: 640px) 100vw, 56.25vh"
                      className="object-cover"
                    />
                  ) : (
                    <VideoPlayer
                      key={videoSource}
                      videoUrl={videoSource}
                      loop={shouldLoop}
                      objectFit="cover"
                      onEnded={shouldUsePreviewVideo ? handlePreviewVideoEnded : handleVideoEnded}
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
            className="absolute inset-x-0 z-20 flex justify-center px-3 xs:px-4"
            style={{ bottom: 'calc(120px + env(safe-area-inset-bottom))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.button
              onClick={handleStartConversation}
              disabled={startingConversation}
              data-jago-button={isJagoBooth ? 'true' : undefined}
              className={`pointer-events-auto relative flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 shadow-[0_16px_35px_-20px_rgba(0,0,0,0.85)] ${
                isJagoBooth
                  ? 'max-w-[96%] px-6 py-3 text-sm xs:max-w-[95%] xs:px-8 xs:py-4 xs:text-base xs:tracking-[0.2em] sm:max-w-[92%] sm:px-12 sm:py-5 sm:text-lg md:max-w-[88%] md:px-10 md:py-4 md:text-base lg:max-w-[84%] lg:px-28 lg:py-12 lg:text-4xl xl:max-w-[82%] xl:px-12 xl:py-5 xl:text-lg 4k:max-w-[1700px] 4k:px-[220px] 4k:py-24 4k:text-7xl xs:gap-2.5 sm:gap-3 md:gap-2.5 lg:gap-6 xl:gap-3 4k:gap-16'
                  : 'max-w-[96%] px-6 py-3 text-sm backdrop-blur-lg xs:max-w-[95%] xs:px-8 xs:py-4 xs:text-base xs:tracking-[0.2em] sm:max-w-[92%] sm:px-12 sm:py-5 sm:text-lg md:max-w-[88%] md:px-10 md:py-4 md:text-base lg:max-w-[84%] lg:px-28 lg:py-12 lg:text-4xl xl:max-w-[82%] xl:px-12 xl:py-5 xl:text-lg 4k:max-w-[1700px] 4k:px-[220px] 4k:py-24 4k:text-7xl xs:gap-2.5 sm:gap-3 md:gap-2.5 lg:gap-6 xl:gap-3 4k:gap-16'
              }`}
              whileHover={startingConversation ? undefined : { scale: 1.03 }}
              whileTap={startingConversation ? undefined : { scale: 0.97 }}
              onPointerDown={startRipple.createRipple}
              variants={startButtonVariants}
              animate={startingConversation ? 'starting' : 'pulse'}
              style={startButtonStyle}
            >
              {startingConversation ? (
                <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-8 xl:gap-3.5">
                  <motion.div
                    className="rounded-full border-[2px] border-white border-t-transparent h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 sm:border-[3px] md:h-6 md:w-6 md:border-[3px] lg:h-14 lg:w-14 lg:border-[5px] xl:h-7 xl:w-7 xl:border-[3px] 4k:h-20 4k:w-20 4k:border-[7px]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  />
                  <span className="text-center font-bold text-sm xs:text-base sm:text-lg md:text-base lg:text-4xl xl:text-lg 4k:text-6xl">Connecting...</span>
                </div>
              ) : (
                <>
                  {!isJagoBooth && <Pointer className="transition-transform duration-200 group-hover:scale-110 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 lg:w-10 lg:h-10 xl:w-7 xl:h-7 4k:w-16 4k:h-16" />}
                  <span className="text-center font-bold text-sm xs:text-base sm:text-lg md:text-base lg:text-4xl xl:text-lg 4k:text-6xl">{isJagoBooth ? 'MULAI PESAN KOPI' : 'Start Conversation'}</span>
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

      <Header config={config} isCompact={conversationActive} isConnected={conversationActive} />

      <Footer
        config={config}
        isActive={conversationActive}
        isSpeaking={isSpeaking || isListening}
        onRestart={handleRestartConversation}
        onEnd={handleEndConversation}
        volumeLevel={volumeLevel}
        showControls={conversationActive}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(220px+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 sm:px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error-toast"
                className="w-auto max-w-full rounded-xl sm:rounded-2xl bg-red-700/95 px-4 py-2 sm:px-5 sm:py-2.5 text-center text-xs sm:text-sm font-semibold text-white shadow-xl backdrop-blur"
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
            className="absolute top-24 sm:top-32 left-1/2 z-50 -translate-x-1/2 rounded-xl sm:rounded-2xl px-5 py-3 sm:px-8 sm:py-4 shadow-2xl max-w-[90%] sm:max-w-none"
            style={{
              backgroundColor: `${config.theme.primary}dd`,
              color: config.theme.onPrimary,
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-center">{toolState.message}</p>
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-3 sm:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white/95 p-5 sm:p-6 text-slate-900 shadow-2xl backdrop-blur-lg md:max-w-2xl lg:max-w-4xl xl:max-w-3xl 4k:max-w-7xl md:p-8 lg:p-14 4k:p-28 lg:rounded-[2.5rem] 4k:rounded-[5rem]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 4k:space-y-16">
                <div>
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 md:text-base lg:text-2xl 4k:text-5xl lg:tracking-[0.3em]">
                    Konfirmasi
                  </p>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 md:text-3xl lg:text-5xl 4k:text-9xl lg:mt-2 4k:mt-4">{phoneCaptureState.title}</h3>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 md:text-base lg:text-2xl 4k:text-5xl lg:mt-3 4k:mt-6">{phoneCaptureState.description}</p>
                </div>

                <label className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 md:gap-3 lg:gap-4 4k:gap-8 md:text-base lg:text-2xl 4k:text-5xl">
                  Nomor Telepon
                  <input
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+ ]*"
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold tracking-wide text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:px-5 md:py-4 md:text-lg lg:px-8 lg:py-7 lg:text-3xl lg:rounded-3xl 4k:px-16 4k:py-14 4k:text-7xl 4k:rounded-[3rem] 4k:border-4 lg:border-2"
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
                  <p className="text-xs sm:text-sm font-semibold text-red-500 md:text-base lg:text-2xl 4k:text-5xl">{phoneCaptureState.error}</p>
                )}

                <div className="flex flex-col gap-2.5 sm:gap-3 pt-1.5 sm:pt-2 sm:flex-row md:gap-4 lg:gap-6 4k:gap-12 md:pt-3 lg:pt-5 4k:pt-10">
                  <button
                    type="button"
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold text-slate-700 transition hover:bg-slate-100 md:px-6 md:py-4 md:text-lg lg:px-10 lg:py-7 lg:text-3xl lg:rounded-3xl 4k:px-20 4k:py-14 4k:text-7xl 4k:rounded-[3rem] 4k:border-4 lg:border-2"
                    onClick={handlePhoneCancel}
                    disabled={phoneCaptureState.isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl sm:rounded-2xl bg-blue-600 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 md:px-6 md:py-4 md:text-lg lg:px-10 lg:py-7 lg:text-3xl lg:rounded-3xl 4k:px-20 4k:py-14 4k:text-7xl 4k:rounded-[3rem]"
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

