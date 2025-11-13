/**
 * Video Preloader Utility
 * Preloads videos to ensure smooth playback
 */

export interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function preloadVideos(
  videoUrls: string[],
  onProgress?: (progress: PreloadProgress) => void
): Promise<void> {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalCount = videoUrls.length;

    if (totalCount === 0) {
      resolve();
      return;
    }

    const updateProgress = () => {
      loadedCount++;
      const progress: PreloadProgress = {
        loaded: loadedCount,
        total: totalCount,
        percentage: Math.round((loadedCount / totalCount) * 100),
      };
      
      onProgress?.(progress);

      if (loadedCount === totalCount) {
        resolve();
      }
    };

    videoUrls.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      
      video.oncanplaythrough = updateProgress;
      video.onerror = () => {
        console.warn(`Failed to preload video: ${url}`);
        updateProgress(); // Still count it to avoid hanging
      };
      
      video.src = url;
      video.load();
    });
  });
}

/**
 * Get all video URLs from a video set configuration
 */
export function getAllVideoUrls(
  videoSet: Record<string, string | string[] | undefined>
): string[] {
  const urls = new Set<string>();
  
  Object.values(videoSet).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((url) => urls.add(url));
    } else if (typeof value === 'string') {
      urls.add(value);
    }
  });
  
  return Array.from(urls);
}

