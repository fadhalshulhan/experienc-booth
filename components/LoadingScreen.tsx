import { BoothConfig } from '@/config/booths';

interface LoadingScreenProps {
  config: BoothConfig;
  progress?: number;
  message?: string;
}

export default function LoadingScreen({ config, progress = 0, message = 'Loading...' }: LoadingScreenProps) {
  const { primary, accent } = config.theme;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${accent})`,
      }}
    >
      {/* Logo/Brand */}
      <div 
        className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl mb-8"
        style={{ 
          background: `linear-gradient(135deg, ${accent}, ${primary})`,
        }}
      >
        {config.name[0]}
      </div>

      {/* Brand Name */}
      <h1 className="text-6xl font-bold text-white mb-12">
        {config.name}
      </h1>

      {/* Loading Spinner */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-8 border-white/30 rounded-full"></div>
        <div 
          className="absolute inset-0 border-8 border-white border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="w-96 h-4 bg-white/30 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Loading Message */}
      <div className="text-2xl text-white font-medium">
        {message}
      </div>

      {/* Progress Percentage */}
      {progress > 0 && (
        <div className="text-xl text-white/80 mt-2">
          {progress}%
        </div>
      )}
    </div>
  );
}

