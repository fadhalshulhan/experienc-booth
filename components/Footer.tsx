import { AnimatePresence, motion } from 'framer-motion';
import { StopCircle } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import { BoothConfig } from '@/config/booths';
import { useRipple } from '@/hooks/useRipple';

interface FooterProps {
  config: BoothConfig;
  isActive: boolean;
  isSpeaking: boolean;
  volumeLevel: number;
  onRestart: () => void;
  onEnd: () => void;
  showControls?: boolean;
}

export default function Footer({ config, isActive, isSpeaking, volumeLevel, onRestart, onEnd, showControls = true }: FooterProps) {
  const { primary, text, onPrimary } = config.theme;
  const endButtonColor = config.id === 'jago' ? '#ee2737' : '#dc2626';
  const endRipple = useRipple();

  return showControls ? (
    <motion.footer
      className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-1.5 xs:px-2"
      style={{ bottom: 'calc(120px + env(safe-area-inset-bottom))' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.div
        className="pointer-events-auto sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6 sm:py-3"
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
      >
        {/* <div className="flex flex-1 items-center justify-center sm:justify-start">
          <VoiceIndicator
            isActive={isActive}
            isSpeaking={isSpeaking}
            color={primary}
            textColor={text}
            volumeLevel={volumeLevel}
          />
        </div> */}

        <AnimatePresence>
          {showControls && (
            <motion.div
              className="flex flex-1 flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center sm:justify-end"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={onEnd}
                disabled={!isActive}
                onPointerDown={isActive ? endRipple.createRipple : undefined}
                className={`relative flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-[1.06] sm:w-auto ${
                  isActive
                    ? 'gap-1.5 px-4 py-2 text-sm xs:px-5 xs:py-2.5 xs:text-base xs:gap-2 sm:px-8 sm:py-3.5 sm:text-lg md:px-8 md:py-3 md:text-base lg:px-16 lg:py-8 lg:text-4xl xl:px-10 xl:py-4 xl:text-lg 4k:px-24 4k:py-12 4k:text-6xl sm:gap-2.5 md:gap-2 lg:gap-4 xl:gap-2.5'
                    : 'gap-1.5 px-4 py-2 text-sm xs:gap-2 sm:gap-2.5'
                }`}
                style={{
                  backgroundColor: isActive ? endButtonColor : '#6b7280',
                  color: '#ffffff',
                  boxShadow: isActive ? `0 10px 28px -12px ${endButtonColor}` : 'none',
                }}
                whileHover={isActive ? { scale: 1.08 } : undefined}
                whileTap={isActive ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.2 }}
              >
                <StopCircle 
                  size={isActive ? 54 : 40}
                  className={isActive 
                    ? 'w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 md:w-8 md:h-8 lg:w-20 lg:h-20 xl:w-10 xl:h-10 4k:w-32 4k:h-32' 
                    : 'w-6 h-6'
                  }
                />
                <span
                  className={
                    isActive 
                    ? 'text-sm xs:text-base sm:text-lg md:text-base lg:text-4xl xl:text-lg 4k:text-6xl font-bold'
                    : 'text-sm font-bold'
                  }
                  style={{ marginLeft: '0.2em' }}
                >
                  END
                </span>
                <AnimatePresence>
                  {endRipple.ripples.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      className="pointer-events-none absolute rounded-full bg-white/40 blur-[1px]"
                      style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size,
                      }}
                      initial={{ opacity: 0.4, scale: 0 }}
                      animate={{ opacity: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      onAnimationComplete={() => endRipple.removeRipple(ripple.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.footer>
  ) : null;
}

