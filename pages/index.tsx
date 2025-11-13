import { useEffect, useState, useCallback } from 'react';
import { getBoothConfig } from '@/config/booths';
import { useVideoManager } from '@/hooks/useVideoManager';
import { useVideoPreloader } from '@/hooks/useVideoPreloader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingScreen from '@/components/LoadingScreen';
import { Play } from 'lucide-react';

// ElevenLabs Conversation type
interface Conversation {
  endSession: () => Promise<void>;
}

// Extend Window interface
declare global {
  interface Window {
    conversationActive?: boolean;
  }
}

export default function ExperienceBoothPage() {
  // Get booth configuration
  const config = getBoothConfig();
  
  // Video preloading
  const { isLoading: videosLoading, progress: videoProgress } = useVideoPreloader(config.videos);
  
  // ElevenLabs conversation states
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Client tools state (for UI manipulation)
  const [toolState, setToolState] = useState<any>({});
  
  // Video manager
  const videoManager = useVideoManager({
    videos: config.videos,
    onVideoChange: (url, state) => {
      console.log('Video changed:', state, url);
    },
  });

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  /**
   * Client Tools Framework
   * These functions can be called by the ElevenLabs agent to manipulate the UI
   */
  const clientTools = {
    // Example: Show a message on screen
    show_message: async ({ message, duration = 5000 }: { message: string; duration?: number }) => {
      setToolState((prev: any) => ({ ...prev, message }));
      
      // Play tool video if available
      videoManager.playToolVideo('show_message');
      
      // Auto-hide after duration
      setTimeout(() => {
        setToolState((prev: any) => ({ ...prev, message: null }));
      }, duration);
      
      return `Message displayed: ${message}`;
    },

    // Example: Trigger a specific animation or visual effect
    trigger_effect: async ({ effect }: { effect: string }) => {
      console.log('Triggering effect:', effect);
      setToolState((prev: any) => ({ ...prev, currentEffect: effect }));
      
      // Play tool-specific video
      videoManager.playToolVideo(effect);
      
      return `Effect triggered: ${effect}`;
    },

    // Example: Update UI data
    update_data: async ({ key, value }: { key: string; value: any }) => {
      setToolState((prev: any) => ({ ...prev, [key]: value }));
      return `Data updated: ${key} = ${value}`;
    },

    // Example: Navigation or screen change
    navigate: async ({ screen }: { screen: string }) => {
      console.log('Navigate to:', screen);
      setToolState((prev: any) => ({ ...prev, currentScreen: screen }));
      return `Navigated to: ${screen}`;
    },
  };

  // Start conversation with ElevenLabs
  const startConversation = async () => {
    setStartingConversation(true);
    
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required for the conversation.');
        setStartingConversation(false);
        return;
      }

      // Import ElevenLabs client dynamically
      const { Conversation } = await import('@11labs/client');

      // Get signed URL from API
      const signedUrlResponse = await fetch('/api/signed-url');
      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get signed URL');
      }
      const signedUrlData = await signedUrlResponse.json();

      // Start conversation
      const newConversation = await Conversation.startSession({
        signedUrl: signedUrlData.signedUrl,
        
        // Client tools - these can be called by the agent
        clientTools,

        // Connection callbacks
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setIsConnected(true);
          setConversationActive(true);
          setStartingConversation(false);
          window.conversationActive = true;
          
          // Start with idle video
          videoManager.playIdleVideo();
        },

        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setIsConnected(false);
          setConversationActive(false);
          setIsSpeaking(false);
          setIsListening(false);
          window.conversationActive = false;
          
          // Reset video to idle
          videoManager.resetToIdle();
        },

        onError: (error: any) => {
          console.error('Conversation error:', error);
          alert('An error occurred during the conversation.');
          setStartingConversation(false);
        },

        // Mode change (speaking, listening, thinking)
        onModeChange: (mode: any) => {
          console.log('Mode changed:', mode);
          const speaking = mode.mode === 'speaking';
          const listening = mode.mode === 'listening';
          
          setIsSpeaking(speaking);
          setIsListening(listening);
          
          // Update video based on mode
          if (speaking) {
            videoManager.playTalkingVideo();
          } else if (listening) {
            videoManager.playThinkingVideo();
          } else {
            videoManager.playIdleVideo();
          }
        },

        // Optional: Audio level for visualization
        onVolumeChange: (volume: number) => {
          // You can use this for voice indicator animations
          console.log('Volume:', volume);
        },
      });

      setConversation(newConversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please check your configuration.');
      setStartingConversation(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setConversationActive(false);
      setIsSpeaking(false);
      setIsListening(false);
      window.conversationActive = false;
      
      // Reset video
      videoManager.resetToIdle();
    }
  };

  // Restart conversation
  const restartConversation = async () => {
    await endConversation();
    setTimeout(() => {
      startConversation();
    }, 500);
  };

  // Auto-start video on mount
  useEffect(() => {
    videoManager.playIdleVideo();
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Loading Screen */}
      {videosLoading && (
        <LoadingScreen 
          config={config}
          progress={videoProgress.percentage}
          message="Loading experience..."
        />
      )}

      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <VideoPlayer
          videoUrl={videoManager.currentVideoUrl}
          loop={videoManager.currentState === 'talking'}
          onEnded={videoManager.handleVideoEnded}
        />
      </div>

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Header */}
      <Header config={config} />

      {/* Footer with controls */}
      <Footer
        config={config}
        isActive={conversationActive}
        isSpeaking={isSpeaking || isListening}
        onRestart={restartConversation}
        onEnd={endConversation}
      />

      {/* Start Button (shown when conversation is not active) */}
      {!conversationActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <button
            onClick={startConversation}
            disabled={startingConversation}
            className="group flex items-center gap-4 px-12 py-6 rounded-full font-bold text-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-60 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
            style={{
              backgroundColor: config.theme.primary,
              color: 'white',
            }}
          >
            {startingConversation ? (
              <>
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play size={40} className="group-hover:scale-110 transition-transform" />
                <span>Start Experience</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tool State Display (Example UI manipulation from client tools) */}
      {toolState.message && (
        <div 
          className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl animate-pulse"
          style={{
            backgroundColor: `${config.theme.primary}dd`,
            color: 'white',
          }}
        >
          <p className="text-2xl font-bold">{toolState.message}</p>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-32 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm">
          <div>Booth: {config.name}</div>
          <div>Connected: {isConnected ? '✅' : '❌'}</div>
          <div>Active: {conversationActive ? '✅' : '❌'}</div>
          <div>Speaking: {isSpeaking ? '✅' : '❌'}</div>
          <div>Listening: {isListening ? '✅' : '❌'}</div>
          <div>Video State: {videoManager.currentState}</div>
          <div className="mt-2 text-xs">Tool State:</div>
          <pre className="text-xs">{JSON.stringify(toolState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

