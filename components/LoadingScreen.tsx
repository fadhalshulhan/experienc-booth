import { motion } from 'framer-motion';
import Image from 'next/image';
import { BoothConfig } from '@/config/booths';

interface LoadingScreenProps {
  config: BoothConfig;
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ config, progress = 0, message = 'Loading...' }: LoadingScreenProps) {
  const { primary, accent, onPrimary } = config.theme;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${accent})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo/Brand */}
      <motion.div 
        className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl mb-6 bg-white/20 backdrop-blur"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {config.logo ? (
          <Image
            src={config.logo}
            alt={`${config.name} logo`}
            width={84}
            height={84}
            style={{ objectFit: 'contain' }}
            priority
          />
        ) : (
          <span className="text-6xl font-bold" style={{ color: onPrimary }}>
            {config.name[0]}
          </span>
        )}
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        className="text-5xl font-bold mb-10 sm:text-6xl"
        style={{ color: onPrimary }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {config.name}
      </motion.h1>

      {/* Loading Spinner */}
      <motion.div
        className="relative w-32 h-32 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <div
          className="absolute inset-0 border-8 rounded-full"
          style={{ borderColor: `${onPrimary}50` }}
        ></div>
        <div 
          className="absolute inset-0 border-8 rounded-full animate-spin"
          style={{ borderColor: onPrimary, borderTopColor: 'transparent' }}
        ></div>
      </motion.div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div
          className="w-96 h-4 rounded-full overflow-hidden mb-4"
          style={{ backgroundColor: `${onPrimary}40` }}
        >
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: onPrimary }}
          ></div>
        </div>
      )}

      {/* Loading Message */}
      <motion.div 
        className="text-2xl font-medium"
        style={{ color: onPrimary }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        {message}
      </motion.div>

      {/* Progress Percentage */}
      {progress > 0 && (
        <div 
          className="text-xl mt-2"
          style={{ color: onPrimary, opacity: 0.8 }}
        >
          {progress}%
        </div>
      )}
    </motion.div>
  );
}

