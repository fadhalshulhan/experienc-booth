import { RotateCcw, StopCircle } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import { BoothConfig } from '@/config/booths';

interface FooterProps {
  config: BoothConfig;
  isActive: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  onRestart: () => void;
  onEnd: () => void;
}

export default function Footer({ config, isActive, isSpeaking, volumeLevel, onRestart, onEnd }: FooterProps) {
  const { primary, secondary, text, onPrimary } = config.theme;
  const endButtonColor = config.id === 'jago' ? '#ee2737' : '#dc2626';

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-5 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto flex w-full max-w-[420px] items-center justify-between gap-4 rounded-2xl bg-black/55 px-4 py-3 text-sm text-white shadow-[0_12px_40px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md sm:max-w-[460px] sm:px-5 sm:py-3.5">
        <div className="scale-[0.72] origin-left sm:scale-75">
          <VoiceIndicator isActive={isActive} isSpeaking={isSpeaking} color={primary} textColor={text} volumeLevel={volumeLevel} />
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            onClick={onRestart}
            disabled={!isActive}
            className="flex items-center gap-1 rounded-full px-3 py-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-[1.04]"
            style={{
              backgroundColor: isActive ? `${primary}dd` : '#6b7280',
              color: onPrimary,
              boxShadow: isActive ? `0 10px 28px -22px ${primary}` : 'none',
            }}
          >
            <RotateCcw size={18} className="transition-transform duration-300 group-hover:rotate-180" />
            <span>Restart</span>
          </button>

          <button
            onClick={onEnd}
            disabled={!isActive}
            className="flex items-center gap-1 rounded-full px-3 py-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-[1.04]"
            style={{
              backgroundColor: isActive ? endButtonColor : '#6b7280',
              color: '#ffffff',
              boxShadow: isActive ? `0 10px 28px -22px ${endButtonColor}` : 'none',
            }}
          >
            <StopCircle size={18} />
            <span>End</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

