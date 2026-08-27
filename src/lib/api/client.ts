import {
  User, UserSettings, Habit, Routine, QuitHabit, HabitLog,
  RoutineLog, QuitUsageLog, QuitUrgeLog, TodayDashboardData,
  AnalyticsProgressData, NotificationItem, NotificationPreference
} from '@/types';

const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}` : '/api/v1');

export class ApiClient {
  private static getAuthToken(): string | null {
    return localStorage.getItem('habitos_access_token');
  }

  public static setTokens(access: string, refresh: string) {
    localStorage.setItem('habitos_access_token', access);
    localStorage.setItem('habitos_refresh_token', refresh);
  }

  public static clearTokens() {
    localStorage.removeItem('habitos_access_token');
    localStorage.removeItem('habitos_refresh_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearTokens();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  static async register(data: any) {
    const res = await this.request<{ access_token: string; refresh_token: string; user_id: string; email: string; full_name: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    );
    this.setTokens(res.access_token, res.refresh_token);
    return res;
  }

  static async login(data: any) {
    const res = await this.request<{ access_token: string; refresh_token: string; user_id: string; email: string; full_name: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) }
    );
    this.setTokens(res.access_token, res.refresh_token);
    return res;
  }

  static async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Habits
  static async getHabits(dateStr?: string): Promise<Habit[]> {
    return this.request<Habit[]>(`/habits${dateStr ? `?target_date=${dateStr}` : ''}`);
  }

  static async getHabitById(id: string): Promise<Habit> {
    return this.request<Habit>(`/habits/${id}`);
  }

  static async createHabit(data: any): Promise<Habit> {
    return this.request<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) });
  }

  static async updateHabit(id: string, data: any): Promise<Habit> {
    return this.request<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  static async deleteHabit(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/habits/${id}`, { method: 'DELETE' });
  }

  static async checkinHabit(id: string, data: { status: string; completion_value?: number; skip_reason?: string; notes?: string }): Promise<HabitLog> {
    return this.request<HabitLog>(`/habits/${id}/checkin`, { method: 'POST', body: JSON.stringify(data) });
  }

  static async getHabitHistory(id: string, days = 90): Promise<HabitLog[]> {
    return this.request<HabitLog[]>(`/habits/${id}/history?days=${days}`);
  }

  // Routines
  static async getRoutines(dateStr?: string): Promise<Routine[]> {
    return this.request<Routine[]>(`/routines${dateStr ? `?target_date=${dateStr}` : ''}`);
  }

  static async getRoutineById(id: string): Promise<Routine> {
    return this.request<Routine>(`/routines/${id}`);
  }

  static async createRoutine(data: any): Promise<Routine> {
    return this.request<Routine>('/routines', { method: 'POST', body: JSON.stringify(data) });
  }

  static async updateRoutine(id: string, data: any): Promise<Routine> {
    return this.request<Routine>(`/routines/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  static async deleteRoutine(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/routines/${id}`, { method: 'DELETE' });
  }

  static async completeRoutine(id: string, data: { steps_completed: number; total_steps: number; notes?: string; status?: string }): Promise<RoutineLog> {
    return this.request<RoutineLog>(`/routines/${id}/complete`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Quit Habits
  static async getQuitHabits(dateStr?: string): Promise<QuitHabit[]> {
    return this.request<QuitHabit[]>(`/quit-habits${dateStr ? `?target_date=${dateStr}` : ''}`);
  }

  static async getQuitHabitById(id: string): Promise<QuitHabit> {
    return this.request<QuitHabit>(`/quit-habits/${id}`);
  }

  static async createQuitHabit(data: any): Promise<QuitHabit> {
    return this.request<QuitHabit>('/quit-habits', { method: 'POST', body: JSON.stringify(data) });
  }

  static async logQuitUsage(id: string, data: { usage_value: number; notes?: string }): Promise<QuitUsageLog> {
    return this.request<QuitUsageLog>(`/quit-habits/${id}/usage`, { method: 'POST', body: JSON.stringify(data) });
  }

  static async logQuitUrge(id: string, data: { trigger_emotion: string; intensity: number; delayed_minutes?: number; post_delay_feeling?: string; outcome: string; notes?: string }): Promise<QuitUrgeLog> {
    return this.request<QuitUrgeLog>(`/quit-habits/${id}/urge`, { method: 'POST', body: JSON.stringify(data) });
  }

  static async getQuitHistory(id: string, days = 30): Promise<QuitUsageLog[]> {
    return this.request<QuitUsageLog[]>(`/quit-habits/${id}/history?days=${days}`);
  }

  // Dashboard & Analytics
  static async getTodayDashboard(dateStr?: string): Promise<TodayDashboardData> {
    return this.request<TodayDashboardData>(`/today${dateStr ? `?target_date=${dateStr}` : ''}`);
  }

  static async getProgressAnalytics(): Promise<AnalyticsProgressData> {
    return this.request<AnalyticsProgressData>('/progress');
  }

  static async getWeeklyReview(): Promise<any> {
    return this.request<any>('/weekly-review');
  }

  static async submitWeeklyReview(data: any): Promise<any> {
    return this.request<any>('/weekly-review', { method: 'POST', body: JSON.stringify(data) });
  }

  // Notifications
  static async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  static async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  static async markAllNotificationsRead(): Promise<any> {
    return this.request<any>('/notifications/read-all', { method: 'POST' });
  }

  static async getNotificationPreferences(): Promise<NotificationPreference> {
    return this.request<NotificationPreference>('/notifications/preferences');
  }

  static async updateNotificationPreferences(data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return this.request<NotificationPreference>('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Settings
  static async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/settings');
  }

  static async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>('/settings', { method: 'PATCH', body: JSON.stringify(data) });
  }
}
