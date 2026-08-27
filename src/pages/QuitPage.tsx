import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import { ShieldAlert, Plus, HeartPulse, ChevronRight, CheckCircle2, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';

export const QuitPage: React.FC = () => {
  const { openCreateModal, openUrgeSheet, addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: quitHabits = [], isLoading } = useQuery({
    queryKey: ['quit_habits'],
    queryFn: () => ApiClient.getQuitHabits(),
  });

  const logUsageMutation = useMutation({
    mutationFn: ({ id, usage }: { id: string; usage: number }) =>
      ApiClient.logQuitUsage(id, { usage_value: usage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quit_habits'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      addToast({ type: 'info', title: 'Usage Logged', description: 'Quit records updated.' });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Quit & Moderation</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gradually reduce unwanted impulses through progressive step-down ceilings and urge delay timers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={() => openUrgeSheet()}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Record Urge</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => openCreateModal('quit')}
            className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>New Quit Target</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
          ))}
        </div>
      ) : quitHabits.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active quit targets</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Set up step-down reduction goals for social media, gaming, or late-night screen time.
          </p>
          <Button variant="primary" size="sm" onClick={() => openCreateModal('quit')} className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold">
            Create Quit Target
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quitHabits.map((quit) => {
            const usage = quit.today_usage || 0;
            const target = quit.current_target_value;
            const pct = Math.min(100, Math.round((usage / target) * 100));
            const isOver = usage > target;

            return (
              <div
                key={quit.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl shadow-rose-950/20"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <IconRenderer name={quit.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <NavLink to={`/app/quit/${quit.id}`} className="text-lg font-bold text-white hover:text-rose-300 transition-colors">
                          {quit.name}
                        </NavLink>
                        <p className="text-xs text-slate-400">
                          Baseline: {quit.baseline_value} → Target: {quit.target_value} {quit.unit}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> -{quit.reduction_percentage}%
                    </span>
                  </div>

                  {/* Why Quit Anchor */}
                  {quit.why_quit && (
                    <p className="text-xs italic text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      "{quit.why_quit}"
                    </p>
                  )}

                  {/* Daily Allowance Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300">
                        Today: <strong className={isOver ? 'text-rose-400' : 'text-emerald-400'}>{usage}</strong> / {target} {quit.unit}
                      </span>
                      <span className={isOver ? 'text-rose-400' : 'text-slate-400'}>
                        {isOver ? `+${usage - target} ${quit.unit} over limit` : `${target - usage} ${quit.unit} remaining`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Usage Increment Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[11px] text-slate-400">Add:</span>
                    {[10, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => logUsageMutation.mutate({ id: quit.id, usage: usage + mins })}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                      >
                        +{mins}m
                      </button>
                    ))}
                    <button
                      onClick={() => openUrgeSheet(quit.id, quit.name)}
                      className="ml-auto text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/30 cursor-pointer"
                    >
                      Delay Urge ⚡
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Current Step Limit: <strong className="text-slate-200">{target} {quit.unit}</strong></span>
                  <NavLink to={`/app/quit/${quit.id}`} className="text-rose-400 font-semibold hover:text-rose-300 flex items-center gap-1">
                    Details & Ladder <ChevronRight className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
