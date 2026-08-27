import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import {
  ShieldAlert, ChevronLeft, HeartPulse, CheckCircle2, TrendingDown,
  Sparkles, Layers, History, Clock, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const QuitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { openUrgeSheet, addToast } = useUIStore();
  const [logInput, setLogInput] = useState<number>(30);

  const { data: quit, isLoading: isQuitLoading } = useQuery({
    queryKey: ['quit_habit', id],
    queryFn: () => ApiClient.getQuitHabitById(id!),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['quit_history', id],
    queryFn: () => ApiClient.getQuitHistory(id!, 30),
    enabled: !!id,
  });

  const logMutation = useMutation({
    mutationFn: (usage: number) => ApiClient.logQuitUsage(id!, { usage_value: usage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quit_habit', id] });
      queryClient.invalidateQueries({ queryKey: ['quit_history', id] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      addToast({ type: 'success', title: 'Usage Logged', description: 'Records updated.' });
    }
  });

  if (isQuitLoading || !quit) {
    return <div className="h-96 bg-slate-900 rounded-3xl animate-pulse border border-slate-800" />;
  }

  const chartData = history.slice(0, 14).reverse().map(h => ({
    date: h.log_date.split('-').slice(1).join('/'),
    usage: h.usage_value,
    target: h.target_value
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <NavLink to="/app/quit" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>All Quit Targets</span>
        </NavLink>
        <Button
          variant="primary"
          size="sm"
          onClick={() => openUrgeSheet(quit.id, quit.name)}
          className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold"
        >
          <HeartPulse className="w-4 h-4" />
          <span>Delay Urge 10 Mins</span>
        </Button>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <IconRenderer name={quit.icon} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">{quit.category}</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-emerald-400 font-bold">-{quit.reduction_percentage}% reduction</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{quit.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span>Daily Ceiling: <strong className="text-white">{quit.current_target_value} {quit.unit}</strong></span>
          </div>
        </div>

        {quit.why_quit && (
          <p className="text-sm italic text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            "{quit.why_quit}"
          </p>
        )}
      </div>

      {/* Progressive Reduction Ladder */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" />
            <span>Progressive Step-Down Ladder</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Gradual moderation rewires dopamine pathways sustainably without withdrawal relapse.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {quit.progressive_reduction_plan.map((step, idx) => {
            const isPassed = quit.current_target_value <= step.target;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${
                  isPassed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Phase {idx + 1}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-600" />
                  )}
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white">{step.target} <span className="text-xs font-normal text-slate-400">{quit.unit}</span></span>
                  <p className="text-[11px] text-slate-400 mt-1">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 14-Day Usage Trend Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <span>14-Day Moderation Trend</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Daily recorded usage against target threshold.</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="usage" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#usageGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Non-punitive recovery philosophy reminder */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-emerald-400 font-bold">Non-Punitive Moderation Principle:</strong> Going over your ceiling on a single stressful day is not a failure. Protecting overall weekly reduction is what builds sustainable neuroplastic freedom.
        </p>
      </div>
    </div>
  );
};
