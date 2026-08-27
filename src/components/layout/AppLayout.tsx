import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  Flame, CalendarCheck, Sunrise, ShieldAlert, TrendingUp, Calendar,
  Bell, Settings, User as UserIcon, Plus, Search, LogOut, Sun, Moon, Sparkles
} from 'lucide-react';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { CreateActionSheet } from '@/components/layout/CreateActionSheet';
import { UrgeDelaySheet } from '@/components/layout/UrgeDelaySheet';
import { CommandMenu } from '@/components/layout/CommandMenu';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api/client';

export const AppLayout: React.FC = () => {
  const { user, logout, isAuthenticated, fetchMe } = useAuthStore();
  const { theme, toggleTheme, setCommandOpen, openCreateModal } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('habitos_access_token')) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => ApiClient.getNotifications(),
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLinks = [
    { to: '/app/today', label: 'Today', icon: CalendarCheck },
    { to: '/app/habits', label: 'Habits', icon: Flame },
    { to: '/app/routines', label: 'Routines', icon: Sunrise },
    { to: '/app/quit', label: 'Quit / Reduce', icon: ShieldAlert },
    { to: '/app/progress', label: 'Progress', icon: TrendingUp },
    { to: '/app/calendar', label: 'Calendar', icon: Calendar },
    { to: '/app/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-4 sticky top-0 h-screen z-30 justify-between">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between px-2">
            <NavLink to="/app/today" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">HABIT OS</span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">Build & Quit</span>
              </div>
            </NavLink>
            <button
              onClick={toggleTheme}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick ⌘K Trigger Button */}
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              <span>Search or command...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 rounded border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Action Button: Create */}
          <button
            onClick={() => openCreateModal('build')}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 btn-pressable cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Habit / Routine</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <NavLink to="/app/profile" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-200 block truncate">{user?.full_name || 'Builder'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'Logged In'}</span>
              </div>
            </NavLink>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-lg sticky top-0 z-40">
        <NavLink to="/app/today" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Flame className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">HABIT OS</span>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <Search className="w-4 h-4" />
          </button>
          <NavLink to="/app/notifications" className="p-2 text-slate-400 hover:text-white relative rounded-lg">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </NavLink>
        </div>
      </header>

      {/* 3. Main Content Area */}
      <main className="flex-1 min-w-0 pb-24 md:pb-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* 4. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around py-2 px-3">
        <NavLink
          to="/app/today"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-xl ${
              isActive ? 'text-emerald-400' : 'text-slate-400'
            }`
          }
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Today</span>
        </NavLink>

        <NavLink
          to="/app/habits"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-xl ${
              isActive ? 'text-emerald-400' : 'text-slate-400'
            }`
          }
        >
          <Flame className="w-5 h-5" />
          <span>Habits</span>
        </NavLink>

        {/* Central Plus Action Button */}
        <button
          onClick={() => openCreateModal('build')}
          className="w-12 h-12 -mt-5 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 btn-pressable cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <NavLink
          to="/app/progress"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-xl ${
              isActive ? 'text-emerald-400' : 'text-slate-400'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span>Progress</span>
        </NavLink>

        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-3 rounded-xl ${
              isActive ? 'text-emerald-400' : 'text-slate-400'
            }`
          }
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Global Modals & Sheets */}
      <ToastContainer />
      <CreateActionSheet />
      <UrgeDelaySheet />
      <CommandMenu />
    </div>
  );
};
