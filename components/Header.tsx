import { motion } from 'framer-motion';
import Image from 'next/image';
import { BoothConfig } from '@/config/booths';

interface HeaderProps {
  config: BoothConfig;
  isCompact?: boolean;
  isConnected?: boolean;
}

export default function Header({ config, isCompact = false, isConnected = false }: HeaderProps) {
  const { primary, secondary, background, text } = config.theme;
  const headerLogo = config.headerLogo ?? config.logo;
  const hasLogo = Boolean(headerLogo);
  const logoWidth = config.logoWidth ?? 160;
  const logoHeight = config.logoHeight ?? 80;
  const isHealthyGo = config.id === 'healthygo';
  const isJago = config.id === 'jago';
  const gradientStyle = isHealthyGo
    ? 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(31,71,53,0.55))'
    : `linear-gradient(135deg, ${primary}66, ${secondary}40)`;
  const containerMaxWidth = isCompact ? 'min(520px, 92%)' : 'min(720px, 92%)';
  const containerPadding = isCompact ? '12px 18px' : undefined;
  const logoScale = isCompact ? 0.5 : isJago ? 1.5 : 0.6;

  return (
    <motion.header
      className="absolute left-0 z-50 flex w-full items-center justify-center px-1.5 py-1 xs:px-2 xs:py-1.5 sm:px-4 sm:py-2.5 md:px-8 lg:px-12 4k:px-12 4k:py-6 top-3 xs:top-4 sm:top-8 md:top-6 lg:top-32 xl:top-8 4k:top-48"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
      >
        {hasLogo && (
          <motion.div
            className="relative"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Image
              src={headerLogo}
              alt={`${config.name} logo`}
              width={logoWidth * logoScale}
              height={logoHeight * logoScale}
              priority
              style={{ 
                objectFit: 'contain',
                maxWidth: isJago 
                  ? (isConnected ? 'min(35vw, 240px)' : 'min(35vw, 220px)')
                  : (isConnected ? 'min(40vw, 280px)' : 'min(38vw, 250px)')
              }}
              className={isJago 
                ? (isConnected
                    ? 'scale-[1.2] xs:scale-[1.4] sm:scale-[1.7] md:scale-[1.4] lg:scale-[4.0] xl:scale-[1.6] 4k:scale-[5.5] mt-3 xs:mt-4 sm:mt-5 md:mt-4 lg:mt-6 xl:mt-5'
                    : 'scale-[0.9] xs:scale-[1.05] sm:scale-[1.25] md:scale-[1.1] lg:scale-[2.5] xl:scale-[1.3] 4k:scale-[3.5] mt-2 xs:mt-3 sm:mt-4 md:mt-3 lg:mt-5 xl:mt-4')
                : (isConnected
                    ? 'scale-[1.1] xs:scale-[1.3] sm:scale-[1.5] md:scale-[1.3] lg:scale-[3.5] xl:scale-[1.6] 4k:scale-[4.5] mt-3 xs:mt-4 sm:mt-5 md:mt-4 lg:mt-6 xl:mt-5'
                    : 'scale-[0.95] xs:scale-[1.1] sm:scale-[1.3] md:scale-[1.15] lg:scale-[2.5] xl:scale-[1.35] 4k:scale-[3.0] mt-2 xs:mt-3 sm:mt-4 md:mt-3 lg:mt-5 xl:mt-4')}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.header>
  );
}

