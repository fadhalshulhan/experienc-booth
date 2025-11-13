import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });
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
      className={`w-full h-full ${objectFit === 'contain' ? 'object-contain bg-black' : 'object-cover'} ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}

