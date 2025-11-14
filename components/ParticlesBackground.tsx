import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { ISourceOptions } from '@tsparticles/engine';
import { loadLinksPreset } from '@tsparticles/preset-links';

interface ParticlesBackgroundProps {
  color?: string;
  className?: string;
  opacity?: number;
}

export default function ParticlesBackground({ color = '#ffffff', className, opacity = 0.35 }: ParticlesBackgroundProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadLinksPreset(engine);
    }).then(() => setIsReady(true));
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      preset: 'links',
      background: {
        color: 'transparent',
      },
      particles: {
        color: {
          value: color,
        },
        opacity: {
          value: opacity,
        },
        links: {
          enable: true,
          color,
          opacity: opacity * 0.9,
          distance: 160,
        },
        move: {
          speed: 2,
        },
      },
    }),
    [color, opacity],
  );

  if (!isReady) {
    return null;
  }

  return <Particles className={className} options={options} />;
}
