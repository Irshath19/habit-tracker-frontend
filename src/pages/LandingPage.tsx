import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, ShieldAlert, Sunrise, TrendingUp, CheckCircle2, ArrowRight,
  Sparkles, ShieldCheck, HeartPulse, RefreshCw, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 text-slate-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">HABIT OS</span>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </NavLink>
          <NavLink to="/register">
            <Button variant="primary" size="sm">Get Started Free</Button>
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Behavioral Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Build the habits you want. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Break the habits you don't.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Turn daily actions into consistent routines, reduce unwanted urges with scientific delay protocols, and protect momentum with the <strong className="text-slate-200">Never Miss Twice</strong> philosophy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <NavLink to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-base font-bold shadow-xl shadow-emerald-500/20">
                <span>Start Building Habits</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </NavLink>
            <NavLink to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                <span>Try Demo Account</span>
              </Button>
            </NavLink>
          </div>
        </motion.div>

        {/* Interactive Dashboard Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl text-left"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-slate-400 font-mono">Today Command Center • Live Preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Momentum & Routine Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Behavioral Momentum</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+14% this week</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">88%</span>
                <span className="text-xs text-slate-400">Peak Consistency</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[88%]" />
              </div>
            </div>

            {/* Build Habit Check-in Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Build Habit
                </span>
                <span className="text-xs text-slate-400">🔥 26 day streak</span>
              </div>
              <h4 className="text-base font-bold text-white">Deep Reading (20 pages)</h4>
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed today at 07:35 AM</span>
              </div>
            </div>

            {/* Quit Habit & Urge Delay Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Quit Moderation
                </span>
                <span className="text-xs text-emerald-400">-38% reduction</span>
              </div>
              <h4 className="text-base font-bold text-white">Endless Social Feeds</h4>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Usage: 24 / 45 mins</span>
                <span className="text-emerald-400 font-semibold">21m remaining</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full w-[53%]" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3 Core Systems */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Designed for Real Behavioral Change</h2>
          <p className="text-sm text-slate-400">
            A scientifically grounded architecture distinguishing positive habit reinforcement from impulse moderation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">BUILD Systems</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Define identity statements, schedule specific implementation triggers, and build lasting streaks with zero-friction tactile check-ins.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-rose-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">QUIT Moderation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step-down progressive target ladders, emotional urge tracking, and a 10-minute delay timer to strengthen impulse control without shame.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sunrise className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Full-Screen Rituals</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Guided full-screen routine runners for morning priming and evening wind-downs with seamless transitions and audio pacing cues.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-slate-800/80 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-slate-950" />
            </div>
            <span className="font-bold text-slate-300">HABIT & ROUTINE OS</span>
          </div>
          <p>© 2026 Habit & Routine OS. Build what you want. Break what you don't.</p>
        </div>
      </footer>
    </div>
  );
};
