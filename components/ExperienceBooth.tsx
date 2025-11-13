import Head from 'next/head';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Play } from 'lucide-react';
import { getBoothConfig, BoothConfig } from '@/config/booths';
import { useVideoManager } from '@/hooks/useVideoManager';
import { useVideoPreloader } from '@/hooks/useVideoPreloader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingScreen from '@/components/LoadingScreen';

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
};

const DEFAULT_TOOL_DURATION = 5000;

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
  const [toolState, setToolState] = useState<ToolState>({});

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

  const clientTools: ClientTools = useMemo(() => ({
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
  }), [playToolVideo]);

  const handleStartConversation = useCallback(async () => {
    setStartingConversation(true);

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
        },
        onError: (error: unknown) => {
          console.error('Conversation error:', error);
          alert('An error occurred during the conversation.');
          setStartingConversation(false);
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
      alert('Failed to start conversation. Please check your configuration.');
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
  }, [conversation, resetToIdle]);

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
    if (hasInitializedPlaybackRef.current) {
      return;
    }
    hasInitializedPlaybackRef.current = true;
    playIdleVideo();
  }, [playIdleVideo]);

  const previewVideo =
    typeof config.videos.preview === 'string' ? (config.videos.preview as string) : undefined;

  return (
    <>
      <Head>
        <title>{config.name} | Experience Booth</title>
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
        <div
          className="absolute inset-0 flex items-center justify-center px-3 sm:px-6"
        >
          <div className="w-full max-w-[min(100%,_100vh*9/16)]">
            <div className="relative w-full pt-[56.25%]">
              <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_18px_65px_-35px_rgba(0,0,0,0.75)] shadow-black/30 backdrop-blur-sm">
                {previewVideo && !conversationActive ? (
                  <VideoPlayer key="preview" videoUrl={previewVideo} loop objectFit="cover" />
                ) : (
                  <VideoPlayer
                    key={currentVideoUrl}
                    videoUrl={currentVideoUrl}
                    loop={currentState === 'talking' || currentState === 'thinking'}
                    objectFit="cover"
                    onEnded={handleVideoEnded}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      <Header config={config} />

      <Footer
        config={config}
        isActive={conversationActive}
        isSpeaking={isSpeaking || isListening}
        onRestart={handleRestartConversation}
        onEnd={handleEndConversation}
        volumeLevel={volumeLevel}
      />

      {!conversationActive && (
        <div className="absolute top-1/2 left-1/2 z-40 w-[min(85%,320px)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(70%,360px)]">
          <button
            onClick={handleStartConversation}
            disabled={startingConversation}
            className="group flex w-full items-center justify-center gap-3 rounded-[26px] px-6 py-4 text-lg font-semibold uppercase tracking-[0.25em] text-white shadow-[0_20px_45px_-25px_rgba(0,0,0,0.75)] transition-all duration-300 hover:shadow-[0_26px_60px_-25px_rgba(0,0,0,0.85)] disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.015] active:scale-95 sm:px-7 sm:py-5 sm:text-xl sm:tracking-[0.3em]"
            style={{ backgroundColor: config.theme.primary }}
          >
            {startingConversation ? (
              <>
                <div className="h-6 w-6 rounded-full border-[3px] border-white border-t-transparent animate-spin sm:h-7 sm:w-7 sm:border-[3px]" />
                <span className="tracking-normal sm:text-[20px]">Starting...</span>
              </>
            ) : (
              <>
                <Play size={26} className="transition-transform duration-200 group-hover:scale-110 sm:size-32" />
                <span>Start Experience</span>
              </>
            )}
          </button>
        </div>
      )}

      {toolState.message && (
        <div
          className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl animate-pulse"
          style={{
            backgroundColor: `${config.theme.primary}dd`,
            color: config.theme.onPrimary,
          }}
        >
          <p className="text-2xl font-bold">{toolState.message}</p>
        </div>
      )}

        {process.env.NODE_ENV === 'development' && (
          <div
            className="absolute top-32 right-4 z-50 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: `${config.theme.dark}cc`,
              color: config.theme.onPrimary,
            }}
          >
            <div>Booth: {config.name}</div>
            <div>Connected: {isConnected ? '✅' : '❌'}</div>
            <div>Active: {conversationActive ? '✅' : '❌'}</div>
            <div>Speaking: {isSpeaking ? '✅' : '❌'}</div>
            <div>Listening: {isListening ? '✅' : '❌'}</div>
            <div>Video State: {currentState}</div>
            <div className="mt-2 text-xs">Tool State:</div>
            <pre className="text-xs">{JSON.stringify(toolState, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
}

