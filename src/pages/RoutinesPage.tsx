import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import { Sunrise, Moon, Plus, Play, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconRenderer } from '@/components/ui/IconRenderer';

export const RoutinesPage: React.FC = () => {
  const { openCreateModal } = useUIStore();

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines'],
    queryFn: () => ApiClient.getRoutines(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Routines & Rituals</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chained sequences of habits guiding you through focused circadian rituals.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => openCreateModal('routine')} className="font-bold self-start sm:self-auto bg-indigo-600 hover:bg-indigo-500 text-white">
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-56 bg-slate-900 rounded-3xl border border-slate-800" />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <Sunrise className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active routines yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design a morning prime or evening wind-down routine to eliminate daily decision fatigue.
          </p>
          <Button variant="primary" size="sm" onClick={() => openCreateModal('routine')}>
            Create First Routine
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => {
            const totalDuration = routine.steps.reduce((acc, s) => acc + s.duration_minutes, 0);
            return (
              <div
                key={routine.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl shadow-indigo-950/20"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <IconRenderer name={routine.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{routine.name}</h3>
                        <p className="text-xs text-slate-400">
                          {routine.steps.length} steps • ~{totalDuration} mins • {routine.time_of_day}
                        </p>
                      </div>
                    </div>

                    <NavLink to={`/app/routines/${routine.id}/run`}>
                      <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Focus Mode</span>
                      </Button>
                    </NavLink>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-2 pt-2">
                    {routine.steps.map((st, idx) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{st.title}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono shrink-0">{st.duration_minutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Scheduled for: <strong className="text-slate-300">{routine.scheduled_time || 'Daily'}</strong></span>
                  <NavLink to={`/app/routines/${routine.id}/run`} className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1">
                    Start Guided Mode <ChevronRight className="w-3.5 h-3.5" />
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
