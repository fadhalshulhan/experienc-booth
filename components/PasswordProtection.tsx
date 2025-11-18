import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const CORRECT_PASSWORD = 'cekatbooth';
const SESSION_KEY = 'booth_authenticated';

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const authStatus = sessionStorage.getItem(SESSION_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (password.trim() === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Password salah. Silakan coba lagi.');
      setPassword('');
    }
  }, [password]);

  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setError('');
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-white border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.15),transparent_50%)]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl border border-white/20"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-8 flex justify-center">
            <motion.div
              className="rounded-full bg-blue-500/20 p-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2, type: 'spring' }}
            >
              <Lock className="h-12 w-12 text-blue-400" />
            </motion.div>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold text-white">
            Experience Booth
          </h1>
          <p className="mb-8 text-center text-sm text-slate-300">
            Masukkan password untuk mengakses booth
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                autoFocus
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-2 text-sm text-red-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 hover:shadow-xl active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Password diperlukan untuk akses ke booth
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

