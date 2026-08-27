import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { Bell, CheckCheck, Clock, Flame, ShieldAlert, Sunrise, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => ApiClient.getNotifications(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => ApiClient.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) => ApiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Notifications & Briefings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Circadian briefings, habit reminders, and recovery triggers.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            className="self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(n => <div key={n} className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No notifications yet</h3>
          <p className="text-xs text-slate-400">Scheduled morning briefings and reminders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.is_read) markSingleMutation.mutate(n.id); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.is_read
                  ? 'bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.body}</p>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
