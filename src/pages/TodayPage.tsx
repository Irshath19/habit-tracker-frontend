import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import {
  Flame, ShieldAlert, Sunrise, CheckCircle2, Circle, Clock, Sparkles,
  ShieldCheck, AlertTriangle, ArrowRight, Play, MoreVertical, Plus, ChevronRight,
  RotateCcw, ThumbsUp, Calendar, HeartPulse
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Modal } from '@/components/ui/Modal';
import confetti from 'canvas-confetti';

export const TodayPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openCreateModal, openUrgeSheet, playSoundEffect, addToast } = useUIStore();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [skipModalHabit, setSkipModalHabit] = useState<any | null>(null);
  const [skipReason, setSkipReason] = useState('Too busy');

  // Fetch Today Dashboard Data
  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['today', selectedDate],
    queryFn: () => ApiClient.getTodayDashboard(selectedDate),
    staleTime: 5000,
  });

  // Habit Check-in Mutation (Optimistic Update)
  const checkinMutation = useMutation({
    mutationFn: ({ habitId, status, skipReason }: { habitId: string; status: string; skipReason?: string }) =>
      ApiClient.checkinHabit(habitId, { status, skip_reason: skipReason, completion_value: 1.0 }),
    onMutate: async ({ habitId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['today', selectedDate] });
      const previousData = queryClient.getQueryData(['today', selectedDate]);

      queryClient.setQueryData(['today', selectedDate], (old: any) => {
        if (!old) return old;
        const updatedHabits = old.build_habits.map((h: any) => {
          if (h.id === habitId) {
            return {
              ...h,
              today_status: status,
              streak: {
                ...h.streak,
                current_streak: status === 'completed' ? (h.streak?.current_streak || 0) + 1 : h.streak?.current_streak
              }
            };
          }
          return h;
        });
        const completedCount = updatedHabits.filter((h: any) => h.today_status === 'completed').length;
        return {
          ...old,
          build_habits: updatedHabits,
          habits_completed_count: completedCount
        };
      });

      return { previousData };
    },
    onError: (err, _, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['today', selectedDate], context.previousData);
      }
      addToast({ type: 'error', title: 'Check-in Error', description: 'Could not sync update.' });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });

      if (variables.status === 'completed') {
        playSoundEffect('complete');
        // Micro celebration particle burst
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
        addToast({ type: 'success', title: 'Habit Completed!', description: 'Consistency loop protected.' });
      }
    }
  });

  // Quit Usage Log Mutation
  const quitUsageMutation = useMutation({
    mutationFn: ({ quitId, usage }: { quitId: string; usage: number }) =>
      ApiClient.logQuitUsage(quitId, { usage_value: usage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['quit_habits'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      addToast({ type: 'info', title: 'Usage Logged', description: 'Quit moderation records updated.' });
    }
  });

  const handleHabitToggle = (habit: any) => {
    const isDone = habit.today_status === 'completed';
    const nextStatus = isDone ? 'pending' : 'completed';
    checkinMutation.mutate({ habitId: habit.id, status: nextStatus });
  };

  const handleSkipSubmit = () => {
    if (!skipModalHabit) return;
    checkinMutation.mutate({
      habitId: skipModalHabit.id,
      status: 'skipped',
      skipReason
    });
    setSkipModalHabit(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-900/80 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-slate-900/80 rounded-2xl border border-slate-800" />
          <div className="h-40 bg-slate-900/80 rounded-2xl border border-slate-800" />
          <div className="h-40 bg-slate-900/80 rounded-2xl border border-slate-800" />
        </div>
        <div className="h-64 bg-slate-900/80 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Could not load today's dashboard</h3>
        <p className="text-xs text-slate-400">Make sure the backend service is running.</p>
        <Button variant="primary" onClick={() => queryClient.invalidateQueries({ queryKey: ['today'] })}>
          Retry
        </Button>
      </div>
    );
  }

  const completionPercentage = dashboard.habits_total_count > 0
    ? (dashboard.habits_completed_count / dashboard.habits_total_count) * 100
    : 0;

  return (
    <div className="space-y-8">
      {/* 1. Header Command Hub */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase font-semibold">
                {dashboard.date_str}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-xs text-slate-400 font-medium">Daily Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {dashboard.greeting}, Alex
            </h1>
            {dashboard.quick_insights.length > 0 && (
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl flex items-center gap-1.5 pt-1">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dashboard.quick_insights[0]}</span>
              </p>
            )}
          </div>

          {/* Momentum & Habits Completed Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto">
            {/* Habits Ratio */}
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <ProgressRing percentage={completionPercentage} size={56} strokeWidth={5} color="#10b981" />
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Habits Done</span>
                <span className="text-lg font-bold text-white">
                  {dashboard.habits_completed_count} <span className="text-xs text-slate-500 font-normal">/ {dashboard.habits_total_count}</span>
                </span>
              </div>
            </div>

            {/* Momentum Score */}
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-base font-extrabold text-slate-950 leading-none">{dashboard.momentum_score}</span>
                <span className="text-[8px] font-bold text-slate-950/80 uppercase">Score</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Momentum</span>
                <span className="text-xs font-bold text-emerald-400 block">
                  {dashboard.momentum_score >= 80 ? 'Peak Flow ⚡' : 'Building Up 🌱'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Never Miss Twice" Active Recovery Alert */}
      {dashboard.pending_recoveries.length > 0 && (
        <section className="space-y-3">
          {dashboard.pending_recoveries.map((rec) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Never Miss Twice</span>
                    <span className="text-[10px] text-slate-400">• Recovery Active</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">Protect streak for: {rec.target_name}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Missed yesterday. {rec.minimum_action_plan}. Completing today recovers your momentum!
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  checkinMutation.mutate({ habitId: rec.target_id, status: 'completed' });
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold self-start sm:self-center shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Recover Habit Now</span>
              </Button>
            </motion.div>
          ))}
        </section>
      )}

      {/* 3. Today's Active Routines */}
      {dashboard.routines.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sunrise className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Today's Routines</h2>
            </div>
            <NavLink to="/app/routines" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.routines.map((routine) => {
              const isDone = routine.today_status === 'completed';
              return (
                <div
                  key={routine.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-900/60 border-slate-800/80 opacity-90'
                      : 'bg-slate-900 border-indigo-500/30 shadow-lg shadow-indigo-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <IconRenderer name={routine.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{routine.name}</h4>
                        <p className="text-xs text-slate-400">{routine.steps.length} steps • {routine.scheduled_time || 'Daily'}</p>
                      </div>
                    </div>

                    <NavLink to={`/app/routines/${routine.id}/run`}>
                      <Button
                        variant={isDone ? 'secondary' : 'primary'}
                        size="sm"
                        className={isDone ? '' : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isDone ? 'Re-run' : 'Start Ritual'}</span>
                      </Button>
                    </NavLink>
                  </div>

                  {/* Step preview pills */}
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
                    {routine.steps.slice(0, 4).map((st, idx) => (
                      <span
                        key={st.id}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {idx + 1}. {st.title} ({st.duration_minutes}m)
                      </span>
                    ))}
                    {routine.steps.length > 4 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800/40 text-slate-400">
                        +{routine.steps.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Build Habits Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Build Habits</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {dashboard.build_habits.length}
            </span>
          </div>

          <button
            onClick={() => openCreateModal('build')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </div>

        {dashboard.build_habits.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Flame className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">No habits scheduled for today</h4>
            <p className="text-xs text-slate-400">Build your first habit to establish consistent daily momentum.</p>
            <Button variant="primary" size="sm" onClick={() => openCreateModal('build')}>
              Create First Habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dashboard.build_habits.map((habit) => {
              const isCompleted = habit.today_status === 'completed';
              const isSkipped = habit.today_status === 'skipped';
              return (
                <motion.div
                  key={habit.id}
                  layout
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isSkipped
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Interactive Tactile Check-in Button */}
                    <button
                      onClick={() => handleHabitToggle(habit)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all btn-pressable shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700'
                      }`}
                      title={isCompleted ? 'Mark Pending' : 'Complete Habit'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-6 h-6 stroke-[1.5]" />
                      )}
                    </button>

                    <NavLink to={`/app/habits/${habit.id}`} className="min-w-0 group">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold truncate group-hover:text-emerald-400 transition-colors ${
                          isCompleted ? 'text-slate-300 line-through' : 'text-white'
                        }`}>
                          {habit.name}
                        </h4>
                        {habit.streak && habit.streak.current_streak > 0 && (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
                            🔥 {habit.streak.current_streak}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {habit.goal?.target_value} {habit.goal?.unit} • {habit.schedule?.target_time || habit.schedule?.time_preference}
                      </p>
                    </NavLink>
                  </div>

                  {/* Actions (Skip / Snooze) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isCompleted && !isSkipped && (
                      <button
                        onClick={() => setSkipModalHabit(habit)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Skip Today with Reason"
                      >
                        Skip
                      </button>
                    )}
                    {isSkipped && (
                      <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-800/60 rounded-md">
                        Skipped
                      </span>
                    )}
                    <NavLink
                      to={`/app/habits/${habit.id}`}
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Quit & Moderation Goals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Quit & Moderation Targets</h2>
          </div>

          <button
            onClick={() => openUrgeSheet()}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Record Urge (10m Delay)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboard.quit_habits.map((quit) => {
            const usage = quit.today_usage || 0;
            const target = quit.current_target_value;
            const pct = Math.min(100, Math.round((usage / target) * 100));
            const isOver = usage > target;

            return (
              <div
                key={quit.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <IconRenderer name={quit.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <NavLink to={`/app/quit/${quit.id}`} className="text-base font-bold text-white hover:text-rose-300 transition-colors">
                        {quit.name}
                      </NavLink>
                      <p className="text-xs text-slate-400">
                        Daily Ceiling: {target} {quit.unit} • {quit.reduction_percentage}% reduced
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openUrgeSheet(quit.id, quit.name)}
                    className="px-2.5 py-1 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    I Have an Urge
                  </button>
                </div>

                {/* Usage Bar & Quick Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      Today: <strong className={isOver ? 'text-rose-400' : 'text-emerald-400'}>{usage}</strong> / {target} {quit.unit}
                    </span>
                    <span className={isOver ? 'text-rose-400' : 'text-slate-400'}>
                      {isOver ? `+${usage - target} ${quit.unit} over limit` : `${target - usage} ${quit.unit} left`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add Minutes/Units */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Log usage:</span>
                  {[5, 15, 30].map((inc) => (
                    <button
                      key={inc}
                      onClick={() => quitUsageMutation.mutate({ quitId: quit.id, usage: usage + inc })}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      +{inc} {quit.unit === 'minutes' ? 'min' : quit.unit}
                    </button>
                  ))}
                  <button
                    onClick={() => quitUsageMutation.mutate({ quitId: quit.id, usage: 0 })}
                    className="ml-auto text-xs text-slate-500 hover:text-slate-400"
                  >
                    Reset 0
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skip Reason Modal */}
      <Modal
        isOpen={!!skipModalHabit}
        onClose={() => setSkipModalHabit(null)}
        title={`Skip ${skipModalHabit?.name || 'Habit'}`}
        description="Logging the reason helps identify behavioral friction."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['Too busy', 'Forgot', 'Too tired', 'Not motivated', 'Travel', 'Sick'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSkipReason(r)}
                className={`p-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                  skipReason === r
                    ? 'bg-slate-700 border-slate-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setSkipModalHabit(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSkipSubmit}>Confirm Skip</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
