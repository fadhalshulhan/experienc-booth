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
      className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
      style={{ bottom: `calc(156px + env(safe-area-inset-bottom))` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <motion.div
        className="pointer-events-auto flex w-full max-w-[320px] flex-col gap-3 overflow-hidden rounded-3xl border border-white/15 bg-black/60 p-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-lg sm:max-w-[360px]"
        style={{ borderColor: `${theme.onPrimary}33` }}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            {label}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 px-2 py-0.5 text-xs uppercase tracking-[0.3em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
            >
              Close
            </button>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/5">
          <Image
            src={item.image}
            alt={item.name}
            width={320}
            height={240}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          {item.description ? (
            <p className="mt-1 text-sm text-white/70">{item.description}</p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
