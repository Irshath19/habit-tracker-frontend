import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import { Search, Flame, ShieldAlert, Sunrise, CheckCircle2, Moon, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';

export const CommandMenu: React.FC = () => {
  const { isCommandOpen, setCommandOpen, openCreateModal, openUrgeSheet, toggleTheme } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => ApiClient.getHabits(),
    enabled: isCommandOpen,
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => ApiClient.getRoutines(),
    enabled: isCommandOpen,
  });

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(!isCommandOpen);
      }
      if (e.key === 'Escape' && isCommandOpen) {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, setCommandOpen]);

  const filteredHabits = habits.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
  const filteredRoutines = routines.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  const handleAction = (cb: () => void) => {
    cb();
    setCommandOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Type a command, habit name, or navigate..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                autoFocus
              />
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                ESC
              </kbd>
            </div>

            {/* Suggestions list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-3">
              {/* Quick Actions */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
                  Quick Actions
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleAction(() => openCreateModal('build'))}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span>Create Build Habit</span>
                  </button>
                  <button
                    onClick={() => handleAction(() => openUrgeSheet())}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Trigger 10-Min Urge Delay Protocol</span>
                  </button>
                  <button
                    onClick={() => handleAction(() => openCreateModal('routine'))}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Sunrise className="w-4 h-4 text-indigo-400" />
                    <span>Design New Routine</span>
                  </button>
                  <button
                    onClick={() => handleAction(() => toggleTheme())}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span>Toggle Light / Dark Mode</span>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
                  Navigation
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleAction(() => navigate('/app/today'))}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl text-left"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Today Command Center
                  </button>
                  <button
                    onClick={() => handleAction(() => navigate('/app/progress'))}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl text-left"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Analytics & Momentum
                  </button>
                  <button
                    onClick={() => handleAction(() => navigate('/app/calendar'))}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl text-left"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> Calendar & Heatmap
                  </button>
                  <button
                    onClick={() => handleAction(() => navigate('/app/quit'))}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl text-left"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Quit & Moderation
                  </button>
                </div>
              </div>

              {/* Habits Search Results */}
              {filteredHabits.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
                    Habits ({filteredHabits.length})
                  </div>
                  <div className="space-y-0.5">
                    {filteredHabits.slice(0, 5).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleAction(() => navigate(`/app/habits/${h.id}`))}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl text-left"
                      >
                        <span className="font-semibold">{h.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{h.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Routines Search Results */}
              {filteredRoutines.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
                    Routines ({filteredRoutines.length})
                  </div>
                  <div className="space-y-0.5">
                    {filteredRoutines.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleAction(() => navigate(`/app/routines/${r.id}/run`))}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl text-left"
                      >
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-[10px] text-indigo-400">Launch Focus Mode ⚡</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Habit OS ⌘K Command Palette</span>
              <span>Use ↑↓ to navigate • ↵ to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
