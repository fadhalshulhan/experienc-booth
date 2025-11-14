import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  loop?: boolean;
  onEnded?: () => void;
  className?: string;
  objectFit?: 'cover' | 'contain';
}

export default function VideoPlayer({
  videoUrl,
  loop = false,
  onEnded,
  className = '',
  objectFit = 'cover',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const player = videoRef.current;
    if (!player) {
      return;
    }

    setIsReady(false);

    const playVideo = async () => {
      try {
        await player.play();
        setIsReady(true);
      } catch (err) {
        console.warn('Video autoplay failed:', err);
      }
    };

    if (player.readyState >= 2) {
      void playVideo();
    } else {
      const handleCanPlay = () => {
        player.removeEventListener('canplay', handleCanPlay);
        void playVideo();
      };

      player.addEventListener('canplay', handleCanPlay);
      return () => player.removeEventListener('canplay', handleCanPlay);
    }
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop={loop}
      playsInline
      onEnded={onEnded}
      onPlaying={() => setIsReady(true)}
      className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} transition-opacity duration-400 ease-out ${isReady ? 'opacity-100' : 'opacity-75'} ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}

