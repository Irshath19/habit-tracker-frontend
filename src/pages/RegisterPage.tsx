import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Flame, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });
      addToast({ type: 'success', title: 'Account Created', description: "Let's set up your daily architecture." });
      navigate('/onboarding');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Registration Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
        <p className="mt-2 text-xs text-slate-400">
          Already have an account?{' '}
          <NavLink to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            Sign in
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Alex Mercer"
                />
              </div>
            </div>

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
                  placeholder="alex@example.com"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
