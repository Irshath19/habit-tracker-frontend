import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@habitos.app');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      addToast({ type: 'success', title: 'Welcome back', description: 'Redirecting to your command center...' });
      navigate('/app/today');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Sign In Failed', description: err.message || 'Invalid email or password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@habitos.app');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <NavLink to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-slate-950" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">HABIT OS</span>
        </NavLink>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign in to your OS</h2>
        <p className="mt-2 text-xs text-slate-400">
          Or{' '}
          <NavLink to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
            create a free new account
          </NavLink>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10"
      >
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* Demo account quick banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Preloaded Demo User</span>
                <span className="text-[11px] text-emerald-300 block">demo@habitos.app • 90d history</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30"
            >
              Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
