import { Mic, MicOff } from 'lucide-react';

interface VoiceIndicatorProps {
  isActive: boolean;
  isSpeaking: boolean;
  color: string;
}

export default function VoiceIndicator({ isActive, isSpeaking, color }: VoiceIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Voice activity indicator */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings when speaking */}
        {isSpeaking && (
          <>
            <div 
              className="absolute w-24 h-24 rounded-full voice-pulse"
              style={{ 
                backgroundColor: `${color}40`,
                border: `2px solid ${color}`,
              }}
            />
            <div 
              className="absolute w-20 h-20 rounded-full voice-pulse"
              style={{ 
                backgroundColor: `${color}60`,
                animationDelay: '0.2s',
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
            <Mic size={32} className="animate-pulse" />
          ) : (
            <MicOff size={32} />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <div 
          className="text-2xl font-bold"
          style={{ color }}
        >
          {isActive ? (isSpeaking ? 'Listening...' : 'Ready') : 'Inactive'}
        </div>
        <div className="text-sm text-gray-400">
          {isActive ? 'Speak to interact' : 'Start conversation'}
        </div>
      </div>
    </div>
  );
}

