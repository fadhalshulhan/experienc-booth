import Image from 'next/image';
import { BoothConfig } from '@/config/booths';

interface HeaderProps {
  config: BoothConfig;
}

export default function Header({ config }: HeaderProps) {
  const { primary, secondary, background, text } = config.theme;
  const hasLogo = Boolean(config.logo);
  const logoWidth = config.logoWidth ?? 160;
  const logoHeight = config.logoHeight ?? 80;

  return (
    <header className="absolute top-0 left-0 z-50 flex w-full items-center justify-center px-4 py-3 sm:px-6 sm:py-3.5">
      <div
        className="flex w-full max-w-[720px] items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.6)] backdrop-blur-md sm:px-5 sm:py-3.5"
        style={{
          borderColor: `${primary}40`,
          background: `linear-gradient(135deg, ${primary}66, ${secondary}40)`,
        }}
      >
        {hasLogo && (
          <div className="relative">
            <Image
              src={config.logo}
              alt={`${config.name} logo`}
              width={logoWidth * 0.6}
              height={logoHeight * 0.6}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    </header>
  );
}

