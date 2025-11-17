import { motion } from 'framer-motion';
import Image from 'next/image';
import { BoothConfig } from '@/config/booths';

interface HeaderProps {
  config: BoothConfig;
  isCompact?: boolean;
}

export default function Header({ config, isCompact = false }: HeaderProps) {
  const { primary, secondary, background, text } = config.theme;
  const headerLogo = config.headerLogo ?? config.logo;
  const hasLogo = Boolean(headerLogo);
  const logoWidth = config.logoWidth ?? 160;
  const logoHeight = config.logoHeight ?? 80;
  const isHealthyGo = config.id === 'healthygo';
  const gradientStyle = isHealthyGo
    ? 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(31,71,53,0.55))'
    : `linear-gradient(135deg, ${primary}66, ${secondary}40)`;
  const containerMaxWidth = isCompact ? 'min(520px, 92%)' : 'min(720px, 92%)';
  const containerPadding = isCompact ? '12px 18px' : undefined;
  const logoScale = isCompact ? 0.5 : 0.6;

  return (
    <motion.header
      className="absolute top-2 left-0 z-50 flex w-full items-center justify-center px-4 py-3 sm:px-6 sm:py-3.5"
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
              style={{ objectFit: 'contain' }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.header>
  );
}

