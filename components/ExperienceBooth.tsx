import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
}

type ConversationMode = {
  mode: 'speaking' | 'listening' | 'thinking' | string;
};

type ToolState = Record<string, unknown> & {
  message?: string | null;
  currentEffect?: string;
  currentScreen?: string;
};

type ClientTools = {
  show_message: (params: { message: string; duration?: number }) => Promise<string>;
  trigger_effect: (params: { effect: string }) => Promise<string>;
  update_data: (params: { key: string; value: unknown }) => Promise<string>;
  navigate: (params: { screen: string }) => Promise<string>;
  end_conversation: () => Promise<string>;
  finish_interview: (params: Record<string, unknown>) => Promise<string>;
  show_selected_drink: (params: { name?: string; drink_name?: string; name_product?: string }) => Promise<string>;
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
  const config = useMemo(() => getBoothConfiguration(boothId), [boothId]);
  const hasInitializedPlaybackRef = useRef(false);
  const [endRequested, setEndRequested] = useState(false);

  const { isLoading: videosLoading, progress: videoProgress } = useVideoPreloader(config.videos);

  const [conversation, setConversation] = useState<ConversationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendationState, setRecommendationState] = useState<{ id: string; label: 'recommended' | 'selected' } | null>(null);
  const [toolState, setToolState] = useState<ToolState>({});
  const startRipple = useRipple();

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

      if (key === 'recommendation' || key === 'menu_item') {
        if (typeof value === 'string') {
          applyRecommendation(value, 'recommended');
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
  }), [applyRecommendation, playToolVideo, recommendationState?.id, config.id]);

  const handleStartConversation = useCallback(async () => {
    setStartingConversation(true);
    setErrorMessage(null);

    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required for the conversation.');
        setStartingConversation(false);
        return;
      }

      const { Conversation } = await import('@11labs/client');

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
        },
        onError: (error: unknown) => {
          console.error('Conversation error:', error);
          setErrorMessage('Conversation ended due to a technical issue.');
          setStartingConversation(false);
          setConversation(null);
          setConversationActive(false);
          setIsSpeaking(false);
          setIsListening(false);
          resetToIdle();
          setRecommendationState(null);
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

  const previewVideo =
    typeof config.videos.preview === 'string' ? (config.videos.preview as string) : undefined;
  const isPreview = Boolean(previewVideo && !conversationActive);
  const videoSource = isPreview ? previewVideo! : currentVideoUrl;
  const shouldLoop = isPreview || currentState === 'talking' || currentState === 'thinking';
  const recommendationMap = config.recommendations ?? {};
  const currentRecommendation = recommendationState ? recommendationMap[recommendationState.id] ?? null : null;

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
                  key={previewVideo && !conversationActive ? 'preview' : `${currentState}-${currentVideoUrl}`}
                  className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/10 shadow-[0_18px_65px_-35px_rgba(0,0,0,0.75)] shadow-black/30 backdrop-blur-sm"
                  initial={{ opacity: 0.85, scale: 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.85, scale: 0.995 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <VideoPlayer
                    key={videoSource}
                    videoUrl={videoSource}
                    loop={shouldLoop}
                    objectFit="cover"
                    onEnded={handleVideoEnded}
                  />
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
                  <span className="tracking-normal sm:text-[18px]">Starting...</span>
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
        {errorMessage && (
          <motion.div
            key="error-toast"
            className="absolute top-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: `${config.theme.primary}f0` }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
  );
}

