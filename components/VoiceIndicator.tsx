import { Mic, MicOff } from 'lucide-react';

interface VoiceIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  color: string;
  textColor: string;
  volumeLevel?: number;
}

export default function VoiceIndicator({ isActive, isSpeaking, color, textColor, volumeLevel = 0 }: VoiceIndicatorProps) {
  const clampedVolume = Math.min(Math.max(volumeLevel, 0), 1);
  const pulseScale = isActive ? 1 + clampedVolume * 0.35 : 1;
  const ringOpacity = isActive ? 0.6 + clampedVolume * 0.4 : 0.3;

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Voice activity indicator */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings when speaking */}
        {isActive && (
          <>
            <div 
              className="absolute h-24 w-24 rounded-full transition-all duration-150 ease-out"
              style={{
                backgroundColor: `${color}33`,
                border: `2px solid ${color}`,
                opacity: ringOpacity,
                transform: `scale(${pulseScale})`,
              }}
            />
            <div 
              className="absolute h-20 w-20 rounded-full transition-all duration-150 ease-out"
              style={{
                backgroundColor: `${color}55`,
                opacity: ringOpacity,
                transform: `scale(${1 + clampedVolume * 0.25})`,
              }}
            />
          </>
        )}
        
        {/* Center microphone icon */}
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
          style={{ 
            backgroundColor: isActive ? color : '#6b7280',
          }}
        >
          {isActive ? (
            <Mic
              size={32}
              style={{
                transform: `scale(${1 + clampedVolume * 0.15})`,
                transition: 'transform 120ms ease-out',
              }}
            />
          ) : (
            <MicOff size={32} />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <div
          className="text-2xl font-bold"
          style={{ color: textColor }}
        >
          {isActive ? (isSpeaking ? 'Speaking...' : 'Listening...') : 'Inactive'}
        </div>
        <div
          className="text-sm"
          style={{ color: textColor, opacity: 0.65 }}
        >
          {isActive ? 'Speak to interact' : 'Start conversation'}
        </div>
      </div>
    </div>
  );
}

