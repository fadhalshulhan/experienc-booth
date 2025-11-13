import { RotateCcw, Square } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import { BoothConfig } from '@/config/booths';

interface FooterProps {
  config: BoothConfig;
  isActive: boolean;
  isSpeaking: boolean;
  onRestart: () => void;
  onEnd: () => void;
}

export default function Footer({ config, isActive, isSpeaking, onRestart, onEnd }: FooterProps) {
  const { primary, accent, dark } = config.theme;

  return (
    <div 
      className="absolute bottom-0 left-0 w-full z-50 h-32"
      style={{
        background: `linear-gradient(to top, ${dark}90, ${primary}20)`,
        backdropFilter: 'blur(20px)',
        borderTop: `3px solid ${primary}`,
      }}
    >
      <div className="flex items-center justify-between h-full px-12">
        {/* Left: Restart button */}
        <button
          onClick={onRestart}
          disabled={!isActive}
          className="group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isActive ? primary : '#6b7280',
            color: 'white',
          }}
        >
          <RotateCcw size={28} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Restart</span>
        </button>

        {/* Center: Voice Indicator */}
        <VoiceIndicator 
          isActive={isActive}
          isSpeaking={isSpeaking}
          color={primary}
        />

        {/* Right: End button */}
        <button
          onClick={onEnd}
          disabled={!isActive}
          className="group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isActive ? '#dc2626' : '#6b7280',
            color: 'white',
          }}
        >
          <Square size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>End</span>
        </button>
      </div>
    </div>
  );
}

