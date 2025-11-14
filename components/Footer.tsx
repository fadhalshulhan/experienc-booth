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
      className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-3"
      style={{ bottom: 'calc(22px + env(safe-area-inset-bottom))' }}
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
                className="relative flex items-center justify-center gap-1 rounded-full px-3 py-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-[1.04] sm:w-auto"
                style={{
                  backgroundColor: isActive ? endButtonColor : '#6b7280',
                  color: '#ffffff',
                  boxShadow: isActive ? `0 10px 28px -22px ${endButtonColor}` : 'none',
                }}
                whileHover={isActive ? { scale: 1.05 } : undefined}
                whileTap={isActive ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.2 }}
              >
                <StopCircle size={18} />
                <span>End</span>

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

