import Image from 'next/image';
import { motion } from 'framer-motion';
import type { RecommendationItem } from '@/config/booths';

interface RecommendationCardProps {
  item: RecommendationItem;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    background: string;
    text: string;
    onPrimary: string;
  };
  label?: string;
  onClose?: () => void;
}

export default function RecommendationCard({ item, theme, label = 'Recommended', onClose }: RecommendationCardProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: `calc(250px + env(safe-area-inset-bottom))` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <motion.div
        className="pointer-events-auto flex w-full max-w-[280px] flex-col gap-2.5 overflow-hidden rounded-xl border border-white/15 bg-black/60 p-3.5 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-lg xs:max-w-[300px] sm:max-w-[340px] md:max-w-[300px] lg:max-w-[680px] xl:max-w-[360px] 4k:max-w-[1080px] xs:gap-3 sm:gap-3.5 md:gap-2.5 lg:gap-7 4k:gap-12 xs:p-4 sm:p-4.5 md:p-3.5 lg:p-10 4k:p-20 xs:rounded-xl sm:rounded-2xl lg:rounded-[2rem] 4k:rounded-[4rem]"
        style={{ borderColor: `${theme.onPrimary}33` }}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/70 xs:text-[10px] sm:text-xs md:text-[10px] lg:text-2xl xl:text-xs 4k:text-4xl">
            {label}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/40 hover:text-white xs:px-1.5 xs:py-0.5 xs:text-[9px] sm:px-2 sm:py-0.5 sm:text-[10px] md:px-1.5 md:py-0.5 md:text-[9px] lg:px-6 lg:py-2.5 lg:text-2xl xl:px-2.5 xl:py-1 xl:text-xs 4k:px-12 4k:py-5 4k:text-4xl"
            >
              Close
            </button>
          )}
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white/5 xs:rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-3xl 4k:rounded-[4rem]">
          <Image
            src={item.image}
            alt={item.name}
            width={360}
            height={270}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white xs:text-base sm:text-lg md:text-base lg:text-4xl xl:text-lg 4k:text-7xl">{item.name}</h3>
          {item.description ? (
            <p className="mt-0.5 text-[11px] text-white/70 xs:text-xs sm:text-sm md:text-xs lg:text-2xl xl:text-sm 4k:text-5xl xs:mt-1 sm:mt-1 md:mt-0.5 lg:mt-3 4k:mt-6">{item.description}</p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
