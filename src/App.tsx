import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OnboardingPage } from '@/pages/OnboardingPage';

import { AppLayout } from '@/components/layout/AppLayout';
import { TodayPage } from '@/pages/TodayPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { HabitDetailPage } from '@/pages/HabitDetailPage';
import { RoutinesPage } from '@/pages/RoutinesPage';
import { RoutineRunnerPage } from '@/pages/RoutineRunnerPage';
import { QuitPage } from '@/pages/QuitPage';
import { QuitDetailPage } from '@/pages/QuitDetailPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Full-Screen Focus Mode Runner (independent of app layout) */}
          <Route path="/app/routines/:id/run" element={<RoutineRunnerPage />} />

          {/* Protected Application Workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/today" replace />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="habits/:id" element={<HabitDetailPage />} />
            <Route path="routines" element={<RoutinesPage />} />
            <Route path="quit" element={<QuitPage />} />
            <Route path="quit/:id" element={<QuitDetailPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
