import { BoothConfig } from '@/config/booths';

interface HeaderProps {
  config: BoothConfig;
}

export default function Header({ config }: HeaderProps) {
  const { primary, accent } = config.theme;

  return (
    <div 
      className="absolute top-0 left-0 w-full z-50 h-24"
      style={{
        background: `linear-gradient(135deg, ${primary}20, ${accent}30)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `3px solid ${primary}`,
      }}
    >
      <div className="flex items-center justify-center h-full px-12 relative">
        {/* Left decorative frame */}
        <div 
          className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-16 rounded-lg border-4"
          style={{ 
            borderColor: primary,
            background: `linear-gradient(45deg, ${primary}10, transparent)`,
          }}
        />

        {/* Center logo */}
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
            }}
          >
            {config.name[0]}
          </div>
          <h1 
            className="text-4xl font-bold tracking-wide"
            style={{ color: primary }}
          >
            {config.name}
          </h1>
        </div>

        {/* Right decorative frame */}
        <div 
          className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-16 rounded-lg border-4"
          style={{ 
            borderColor: primary,
            background: `linear-gradient(225deg, ${primary}10, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

