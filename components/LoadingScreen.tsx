import { motion } from 'framer-motion';
import Image from 'next/image';
import { BoothConfig } from '@/config/booths';
import ParticlesBackground from '@/components/ParticlesBackground';

interface LoadingScreenProps {
  config: BoothConfig;
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ config, progress = 0, message = 'Loading...' }: LoadingScreenProps) {
  const { primary, accent, onPrimary } = config.theme;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${accent})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Particles background - behind all content */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <ParticlesBackground className="absolute inset-0" color="#ffffff" opacity={0.22} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,#ffffff14,transparent_65%)]" />

      {/* Logo/Brand */}
      <motion.div
        className="relative z-20 mb-6 xs:mb-8 flex h-24 w-24 xs:h-28 xs:w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-48 lg:w-48 4k:h-64 4k:w-64 items-center justify-center rounded-full bg-white shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${primary})`,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {(config.headerLogo || config.logo) ? (
          <Image
            src={config.id === 'cekat' ? '/logos/Cekat-logo-putih.png' : config.headerLogo || config.logo || ''}
            alt={`${config.name} logo`}
            width={84}
            height={84}
            style={{ objectFit: 'contain' }}
            className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 4k:w-48 4k:h-48"
            priority
          />
        ) : (
          <span className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl 4k:text-9xl font-bold" style={{ color: onPrimary }}>
            {config.name[0]}
          </span>
        )}
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        className="relative z-20 text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl 4k:text-8xl font-bold mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-16 4k:mb-20"
        style={{ color: onPrimary }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {config.name}
      </motion.h1>

      {/* Loading Spinner */}
      <motion.div
        className="relative z-20 w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-48 lg:h-48 4k:w-64 4k:h-64 mb-6 xs:mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <div
          className="absolute inset-0 border-4 xs:border-6 sm:border-8 md:border-10 lg:border-12 4k:border-16 rounded-full"
          style={{ borderColor: `${onPrimary}50` }}
        ></div>
        <div
          className="absolute inset-0 border-4 xs:border-6 sm:border-8 md:border-10 lg:border-12 4k:border-16 rounded-full animate-spin"
          style={{ borderColor: onPrimary, borderTopColor: 'transparent' }}
        ></div>
      </motion.div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div
          className="relative z-20 w-64 xs:w-72 sm:w-96 md:w-[28rem] lg:w-[36rem] 4k:w-[48rem] h-3 xs:h-3.5 sm:h-4 md:h-5 lg:h-6 4k:h-8 rounded-full overflow-hidden mb-3 xs:mb-4"
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
        className="relative z-20 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl 4k:text-4xl font-medium"
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
          className="relative z-20 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl 4k:text-3xl mt-2"
          style={{ color: onPrimary, opacity: 0.8 }}
        >
          {progress}%
        </div>
      )}
    </motion.div>
  );
}

