import React, { useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import {
  Flame, Calendar, CheckCircle2, ChevronLeft, Trash2, Edit3, Clock,
  Sparkles, Award, TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { HeatmapMatrix } from '@/components/ui/HeatmapMatrix';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

export const HabitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [daysRange, setDaysRange] = useState<number>(30);

  const { data: habit, isLoading: isHabitLoading } = useQuery({
    queryKey: ['habit', id],
    queryFn: () => ApiClient.getHabitById(id!),
    enabled: !!id,
  });

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['habit_history', id, daysRange],
    queryFn: () => ApiClient.getHabitHistory(id!, daysRange),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => ApiClient.deleteHabit(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      addToast({ type: 'info', title: 'Habit Removed', description: 'Habit archived successfully.' });
      navigate('/app/habits');
    }
  });

  if (isHabitLoading) {
    return <div className="h-96 bg-slate-900 rounded-3xl animate-pulse border border-slate-800" />;
  }

  if (!habit) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Habit not found</h3>
        <NavLink to="/app/habits"><Button variant="primary">Back to Habits</Button></NavLink>
      </div>
    );
  }

  // Calculate consistency in range
  const totalInHistory = history.length;
  const completedInHistory = history.filter(h => h.status === 'completed').length;
  const consistencyPct = totalInHistory > 0 ? Math.round((completedInHistory / totalInHistory) * 100) : 85;

  // Chart data
  const chartData = history.slice(0, 14).reverse().map(h => ({
    date: h.log_date.split('-').slice(1).join('/'),
    completed: h.status === 'completed' ? 1 : 0,
    val: h.completion_value
  }));

  // Heatmap data array for 60 days
  const heatmapData = Array.from({ length: 60 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    const ds = d.toISOString().split('T')[0];
    const log = history.find(h => h.log_date === ds);
    const count = log?.status === 'completed' ? 1 : 0;
    return {
      date: ds,
      count,
      level: count > 0 ? 3 : 0
    };
  });

  return (
    <div className="space-y-8">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between">
        <NavLink to="/app/habits" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>All Habits</span>
        </NavLink>
        <button
          onClick={() => {
            if (confirm('Delete this habit? Historical logs will be removed.')) {
              deleteMutation.mutate();
            }
          }}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IconRenderer name={habit.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{habit.category}</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 capitalize">{habit.difficulty} difficulty</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{habit.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
              🔥 {habit.streak?.current_streak || 0} Day Streak
            </span>
          </div>
        </div>

        {habit.identity_statement && (
          <p className="text-sm italic text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            "{habit.identity_statement}"
          </p>
        )}
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Current Streak</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white block">
            {habit.streak?.current_streak || 0} <span className="text-xs font-normal text-slate-500">days</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Longest Streak</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white block">
            {habit.streak?.longest_streak || 0} <span className="text-xs font-normal text-slate-500">days</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Consistency ({daysRange}d)</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
            {consistencyPct}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Check-ins</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white block">
            {habit.streak?.total_completions || completedInHistory}
          </span>
        </div>
      </div>

      {/* Contribution Heatmap Matrix (60 days) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">60-Day Consistency Grid</h3>
            <p className="text-xs text-slate-400">Visual intensity indicates regular daily adherence.</p>
          </div>
        </div>
        <HeatmapMatrix data={heatmapData} />
      </div>

      {/* Implementation Cues & Goal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Implementation Trigger</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {habit.schedule?.trigger_cue || 'Perform promptly during scheduled time window.'}
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Target Time: <strong className="text-slate-200">{habit.schedule?.target_time || 'Anytime'}</strong> • {habit.schedule?.time_preference}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Target Output Goal</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {habit.goal?.target_value} {habit.goal?.unit} per session.
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Frequency: <strong className="text-slate-200 capitalize">{habit.schedule?.frequency_type}</strong> (7 days / week)
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Execution Logs</h3>
          <div className="flex gap-1.5">
            {[7, 30, 90].map((r) => (
              <button
                key={r}
                onClick={() => setDaysRange(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  daysRange === r ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No historical entries recorded yet.</p>
          ) : (
            history.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span className="font-mono text-slate-300">{log.log_date}</span>
                  {log.notes && <span className="text-slate-500 italic max-w-xs truncate">"{log.notes}"</span>}
                </div>
                <span className={`font-semibold capitalize ${
                  log.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {log.status} {log.skip_reason ? `(${log.skip_reason})` : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
