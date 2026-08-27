import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { User as UserIcon, Mail, Globe, Shield, Calendar, LogOut, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">User Profile</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal account credentials and timezone context.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'Builder'}</h2>
            <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Timezone Context
            </span>
            <span className="text-sm font-bold text-white block">{user?.timezone || 'UTC'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Account Status
            </span>
            <span className="text-sm font-bold text-emerald-400 block">Active • Lifetime Architecture</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex justify-end">
          <Button variant="destructive" onClick={logout}>
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
