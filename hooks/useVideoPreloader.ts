import { useState, useEffect } from 'react';
import { preloadVideos, getAllVideoUrls, PreloadProgress } from '@/utils/videoPreloader';
import { VideoSet } from '@/config/booths';

export function useVideoPreloader(videos: VideoSet) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<PreloadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    const videoUrls = getAllVideoUrls(videos);
    
    preloadVideos(videoUrls, (prog) => {
      setProgress(prog);
    }).then(() => {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    });
  }, [videos]);

  return {
    isLoading,
    progress,
  };
}

