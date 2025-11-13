import { useMemo } from 'react';
import Link from 'next/link';
import { booths } from '@/config/booths';

export default function BoothSelector() {
  const availableBooths = useMemo(() => Object.values(booths), []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        {availableBooths.map((boothOption) => (
          <Link
            key={boothOption.id}
            href={`/booth/${boothOption.id.toLowerCase()}`}
            className="flex w-full items-center justify-center rounded-3xl px-10 py-6 text-2xl font-semibold transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_20px_45px_-20px_rgba(0,0,0,0.9)] focus:outline-none focus:ring-4"
            style={{
              backgroundColor: boothOption.theme.primary,
              color: boothOption.theme.onPrimary,
            }}
          >
            {boothOption.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

