import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import {
  TrendingUp, Flame, ShieldAlert, Award, Calendar, CheckCircle2,
  Sparkles, HeartPulse, BookOpen, Clock, ArrowRight, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeatmapMatrix } from '@/components/ui/HeatmapMatrix';
import { Modal } from '@/components/ui/Modal';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export const ProgressPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidnt, setWhatDidnt] = useState('');
  const [whatWillChange, setWhatWillChange] = useState('');

  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => ApiClient.getProgressAnalytics(),
  });

  const { data: weeklyReview } = useQuery({
    queryKey: ['weekly_review'],
    queryFn: () => ApiClient.getWeeklyReview(),
    enabled: isWeeklyReviewOpen,
  });

  const submitReviewMutation = useMutation({
    mutationFn: () => ApiClient.submitWeeklyReview({
      what_worked: whatWorked,
      what_didnt: whatDidnt,
      what_will_change: whatWillChange
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_review'] });
      setIsWeeklyReviewOpen(false);
      addToast({ type: 'success', title: 'Weekly Review Saved', description: 'Your reflections are recorded.' });
    }
  });

  if (isLoading || !progress) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-900 rounded-3xl border border-slate-800" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-slate-900 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#6366f1', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Behavioral Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quantify consistency, routine mastery, and impulse moderation over time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsWeeklyReviewOpen(true)}
          className="font-bold self-start sm:self-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950"
        >
          <BookOpen className="w-4 h-4" />
          <span>Launch Weekly Review</span>
        </Button>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Momentum Score</span>
          <span className="text-3xl font-black text-emerald-400 block">{progress.momentum_score}%</span>
          <span className="text-[11px] text-slate-500">Calculated formula</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Overall Consistency</span>
          <span className="text-3xl font-black text-white block">{progress.overall_consistency}%</span>
          <span className="text-[11px] text-slate-500">30-day average</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Habits Built</span>
          <span className="text-3xl font-black text-indigo-400 block">{progress.habits_built_count}</span>
          <span className="text-[11px] text-slate-500">Active systems</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Habits Reduced</span>
          <span className="text-3xl font-black text-rose-400 block">{progress.habits_reduced_count}</span>
          <span className="text-[11px] text-slate-500">Moderated targets</span>
        </div>
      </div>

      {/* Weekly Consistency Bar Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">7-Day Completion Velocity</h3>
              <p className="text-xs text-slate-400">Daily habit check-in rate across your active stack.</p>
            </div>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.weekly_consistency_trend}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Focus Category Split</h3>
            <p className="text-xs text-slate-400">Distribution across life dimensions.</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progress.category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progress.category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {progress.category_distribution.map((cat, i) => (
              <span key={cat.name} className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {cat.name} ({cat.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 60-Day Contribution Heatmap Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Full Behavioral Matrix (60 Days)</h3>
          <p className="text-xs text-slate-400">Consistent adherence builds permanent identity shifts.</p>
        </div>
        <HeatmapMatrix data={progress.monthly_heatmap} />
      </div>

      {/* Smart Behavioral Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Smart Behavioral Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.behavioral_insights.map((ins) => (
            <div key={ins.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{ins.title}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {Math.round(ins.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Review Modal */}
      <Modal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
        title="Weekly Review & Reflection"
        description="Inspect what worked, what caused friction, and configure the upcoming week."
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          {weeklyReview && (
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consistency</span>
                <span className="text-lg font-bold text-emerald-400">{weeklyReview.consistency_rate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Habits Done</span>
                <span className="text-lg font-bold text-white">{weeklyReview.habits_completed}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recovered</span>
                <span className="text-lg font-bold text-amber-400">{weeklyReview.recoveries_count}x</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">1. What worked well this week?</label>
              <textarea
                rows={2}
                placeholder="e.g. Morning workouts before opening email kept momentum high."
                value={whatWorked}
                onChange={(e) => setWhatWorked(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">2. Where did you encounter friction?</label>
              <textarea
                rows={2}
                placeholder="e.g. Late dinners pushed evening meditation back."
                value={whatDidnt}
                onChange={(e) => setWhatDidnt(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">3. What is one adjustment for next week?</label>
              <textarea
                rows={2}
                placeholder="e.g. Set a strict 9:30 PM phone dock alarm."
                value={whatWillChange}
                onChange={(e) => setWhatWillChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsWeeklyReviewOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => submitReviewMutation.mutate()}>Save Weekly Reflection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
