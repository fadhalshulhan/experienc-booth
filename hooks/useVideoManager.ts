import { useState, useEffect, useRef, useCallback } from 'react';
import { VideoSet } from '@/config/booths';

export type VideoState = 'idle' | 'talking' | 'thinking' | 'tool';

export interface VideoManagerOptions {
  videos: VideoSet;
  onVideoChange?: (videoUrl: string, state: VideoState) => void;
}

/**
 * Video Manager Hook
 * Handles video switching logic based on conversation state and events
 */
export function useVideoManager({ videos, onVideoChange }: VideoManagerOptions) {
  const [currentState, setCurrentState] = useState<VideoState>('idle');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(videos.idle[0]);
  const [idleVideoIndex, setIdleVideoIndex] = useState(0);
  const [toolVideo, setToolVideo] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const actionVideoKey = useRef(0);

  // Function to play a specific video
  const playVideo = useCallback((url: string, state: VideoState) => {
    setCurrentVideoUrl(url);
    setCurrentState(state);
    onVideoChange?.(url, state);
  }, [onVideoChange]);

  // Play idle video (cycles through idle videos)
  const playIdleVideo = useCallback(() => {
    if (currentState === 'tool') return; // Don't interrupt tool videos
    
    const idleVideos = videos.idle;
    const nextIndex = idleVideoIndex % idleVideos.length;
    playVideo(idleVideos[nextIndex], 'idle');
    setIdleVideoIndex(nextIndex + 1);
  }, [videos.idle, idleVideoIndex, playVideo, currentState]);

  // Play talking video
  const playTalkingVideo = useCallback(() => {
    if (currentState === 'tool') return; // Don't interrupt tool videos
    playVideo(videos.talking, 'talking');
  }, [videos.talking, playVideo, currentState]);

  // Play thinking video
  const playThinkingVideo = useCallback(() => {
    if (currentState === 'tool') return; // Don't interrupt tool videos
    if (videos.thinking) {
      playVideo(videos.thinking, 'thinking');
    }
  }, [videos.thinking, playVideo, currentState]);

  // Play tool-specific video
  const playToolVideo = useCallback((toolName: string) => {
    const toolVideoUrl = videos[`tool_${toolName}`];
    if (typeof toolVideoUrl === 'string') {
      setToolVideo(toolVideoUrl);
      playVideo(toolVideoUrl, 'tool');
      actionVideoKey.current += 1;
    }
  }, [videos, playVideo]);

  // Handle when a video ends
  const handleVideoEnded = useCallback(() => {
    if (currentState === 'tool') {
      // Tool video finished, return to idle
      setToolVideo(null);
      playIdleVideo();
    } else if (currentState === 'idle') {
      // Idle video finished, play next idle video
      playIdleVideo();
    }
    // Talking and thinking videos should loop
  }, [currentState, playIdleVideo]);

  // Handle when agent starts speaking
  const onAgentSpeaking = useCallback((speaking: boolean) => {
    if (speaking) {
      playTalkingVideo();
    } else {
      playIdleVideo();
    }
  }, [playTalkingVideo, playIdleVideo]);

  // Reset to idle
  const resetToIdle = useCallback(() => {
    setIdleVideoIndex(0);
    setToolVideo(null);
    playIdleVideo();
  }, [playIdleVideo]);

  return {
    // Current state
    currentState,
    currentVideoUrl,
    videoRef,
    actionVideoKey: actionVideoKey.current,
    
    // Actions
    playIdleVideo,
    playTalkingVideo,
    playThinkingVideo,
    playToolVideo,
    onAgentSpeaking,
    resetToIdle,
    handleVideoEnded,
  };
}

