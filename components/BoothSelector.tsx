import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { booths, type BoothConfig } from '@/config/booths';
// import ParticlesBackground from '@/components/ParticlesBackground';
import { useRipple } from '@/hooks/useRipple';

const BACKGROUND_VIDEO_SOURCE = 'https://youtu.be/3Qpr3_3igus?list=TLGG1Dg9pE2T1MYxNzExMjAyNQ';

const getYouTubeVideoId = (input: string): string | null => {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();
  const directIdPattern = /^[a-zA-Z0-9_-]{11}$/u;
  if (directIdPattern.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.has('v')) {
        return url.searchParams.get('v');
      }
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments[0] === 'embed' || segments[0] === 'shorts') {
        return segments[1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const buildYouTubeEmbedUrl = (input: string): string | null => {
  const videoId = getYouTubeVideoId(input);
  if (!videoId) {
    return null;
  }

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoId,
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

function BoothCard({ boothOption }: { boothOption: BoothConfig }) {
  const { primary, accent, onPrimary } = boothOption.theme;
  const logoWidth = boothOption.logoWidth ?? 180;
  const logoHeight = boothOption.logoHeight ?? 80;
  const { ripples, createRipple, removeRipple } = useRipple();

  return (
    <Link href={`/booth/${boothOption.id.toLowerCase()}`} className="block focus:outline-none">
      <motion.div
        whileHover={{ scale: 1.04, boxShadow: `0 25px 65px -30px ${primary}aa`, y: -4 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onPointerDown={createRipple}
        className="group relative flex w-full items-center justify-between gap-3 xs:gap-4 overflow-hidden rounded-2xl xs:rounded-3xl px-5 py-4 xs:px-6 xs:py-5 sm:px-8 sm:py-6 md:px-10 md:py-7 lg:px-12 lg:py-8 4k:px-16 4k:py-10"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: onPrimary,
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at top left, ${onPrimary}1f, transparent 60%)` }}
        />

        <div className="relative flex flex-1 flex-col">
          <span className="text-xs xs:text-sm uppercase tracking-[0.25em] xs:tracking-[0.35em] opacity-75">Booth</span>
          <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl 4k:text-6xl font-semibold">{boothOption.name}</span>
        </div>

        <motion.div
          className="relative flex items-center justify-center rounded-xl xs:rounded-2xl bg-white/15 px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 4k:px-12 4k:py-6"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src={boothOption.selectorLogo ?? boothOption.headerLogo ?? boothOption.logo}
            alt={`${boothOption.name} logo`}
            width={logoWidth * 0.5}
            height={logoHeight * 0.5}
            style={{ objectFit: 'contain' }}
            className="w-auto h-8 xs:h-10 sm:h-12 md:h-14 lg:h-20 4k:h-28"
            priority
          />
        </motion.div>

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full bg-white/40 blur-[1px]"
              style={{
                top: ripple.y,
                left: ripple.x,
                width: ripple.size,
                height: ripple.size,
              }}
              initial={{ opacity: 0.45, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(ripple.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export default function BoothSelector() {
  const availableBooths = useMemo(() => Object.values(booths), []);
  const backgroundVideoUrl = useMemo(() => buildYouTubeEmbedUrl(BACKGROUND_VIDEO_SOURCE), []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 4k:px-16 py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 4k:py-20 text-white">
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[56.25vh]" style={{ aspectRatio: '9/16' }}>
            <div className="relative w-full h-full">
              {backgroundVideoUrl ? (
                <iframe
                  src={backgroundVideoUrl}
                  title="Booth selector background"
                  className="absolute inset-0 h-full w-full object-cover"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  frameBorder="0"
                />
              ) : (
                <div className="absolute inset-0 bg-black" />
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/75" />
      </div>
      {/* <ParticlesBackground className="absolute inset-0" opacity={0.25} /> */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff15,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-[90%] xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 4k:max-w-4xl space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8 4k:space-y-10">
        {availableBooths.map((booth) => (
          <BoothCard key={booth.id} boothOption={booth} />
        ))}
      </div>
    </div>
  );
}

