import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';
import { useUIStore } from '@/stores/useUIStore';
import { Settings as SettingsIcon, Moon, Sun, Bell, Volume2, Shield, Globe, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { theme, setTheme, addToast } = useUIStore();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => ApiClient.getSettings(),
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ['notif_prefs'],
    queryFn: () => ApiClient.getNotificationPreferences(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => ApiClient.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      addToast({ type: 'success', title: 'Settings Updated', description: 'Preferences saved.' });
    }
  });

  const updateNotifMutation = useMutation({
    mutationFn: (data: any) => ApiClient.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif_prefs'] });
      addToast({ type: 'success', title: 'Notification Preferences Updated' });
    }
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize themes, quiet hours, synthesized sound feedback, and reminders.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-emerald-400" />
          <span>Appearance & Theme</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => { setTheme('dark'); updateSettingsMutation.mutate({ theme: 'dark' }); }}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-emerald-950/60 border-emerald-500 text-white'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Moon className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-200 block">Dark Mode</span>
              <span className="text-[10px] text-slate-400">Deep obsidian palette</span>
            </div>
          </button>

          <button
            onClick={() => { setTheme('light'); updateSettingsMutation.mutate({ theme: 'light' }); }}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-emerald-950/60 border-emerald-500 text-white'
                : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-200 block">Light Mode</span>
              <span className="text-[10px] text-slate-400">Clean contrast surface</span>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications & Circadian Quiet Hours */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span>Circadian Notifications</span>
        </h3>

        <div className="space-y-3 divide-y divide-slate-800/80">
          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Morning Briefing</span>
              <span className="text-[11px] text-slate-400">Daily routine summary delivered at your wake window</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs?.morning_briefing_enabled ?? true}
              onChange={(e) => updateNotifMutation.mutate({ morning_briefing_enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Evening Wind-Down Summary</span>
              <span className="text-[11px] text-slate-400">Daily completion score and momentum protection check</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs?.evening_summary_enabled ?? true}
              onChange={(e) => updateNotifMutation.mutate({ evening_summary_enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Quit Moderation Alerts</span>
              <span className="text-[11px] text-slate-400">Notifies when approaching your daily allowance</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs?.quit_alerts_enabled ?? true}
              onChange={(e) => updateNotifMutation.mutate({ quit_alerts_enabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Sound & Haptic Feedback */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-400" />
          <span>Feedback Audio & Cues</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Synthetic Audio Chimes</span>
            <span className="text-[11px] text-slate-400">Plays crisp zero-latency chime on check-in and urge delay finish</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.sound_effects_enabled ?? true}
            onChange={(e) => updateSettingsMutation.mutate({ sound_effects_enabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
