export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  week_starts_on: 'monday' | 'sunday';
  sound_effects_enabled: boolean;
  haptics_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  default_habit_reminder?: string;
}

export interface HabitSchedule {
  frequency_type: 'daily' | 'specific_days' | 'x_per_week';
  days_of_week: number[];
  target_times_per_week?: number;
  time_preference: 'morning' | 'afternoon' | 'evening' | 'exact' | 'anytime';
  target_time?: string | null;
  trigger_cue?: string | null;
}

export interface HabitGoal {
  target_value: number;
  unit: string;
  goal_type: 'boolean' | 'numeric' | 'timer';
}

export interface HabitStreak {
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completed_date?: string | null;
  freeze_tokens: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  status: 'completed' | 'skipped' | 'missed' | 'partial';
  completion_value: number;
  skip_reason?: string | null;
  notes?: string | null;
  is_recovery: boolean;
  completed_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  icon: string;
  category: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  identity_statement?: string | null;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  schedule?: HabitSchedule;
  goal?: HabitGoal;
  streak?: HabitStreak;
  today_status?: 'completed' | 'skipped' | 'missed' | 'partial' | 'pending';
  today_log?: HabitLog | null;
  is_pending_recovery?: boolean;
}

export interface RoutineStep {
  id: string;
  routine_id: string;
  habit_id?: string | null;
  title: string;
  duration_minutes: number;
  step_order: number;
  instructions?: string | null;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  log_date: string;
  status: 'completed' | 'partial' | 'skipped';
  steps_completed: number;
  total_steps: number;
  started_at: string;
  completed_at?: string | null;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  icon: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduled_time?: string | null;
  color: string;
  is_active: boolean;
  order_index: number;
  steps: RoutineStep[];
  today_status?: 'completed' | 'partial' | 'skipped' | 'pending';
  today_log?: RoutineLog | null;
}

export interface ProgressiveReductionStep {
  step: number;
  target: number;
  title: string;
  completed: boolean;
}

export interface QuitHabit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  unit: string;
  baseline_value: number;
  target_value: number;
  current_target_value: number;
  why_quit?: string | null;
  status: 'active' | 'paused' | 'overcome';
  progressive_reduction_plan: ProgressiveReductionStep[];
  today_usage: number;
  within_limit_today: boolean;
  reduction_percentage: number;
  recent_urges_count: number;
  today_log?: QuitUsageLog | null;
}

export interface QuitUsageLog {
  id: string;
  quit_habit_id: string;
  log_date: string;
  usage_value: number;
  target_value: number;
  within_limit: boolean;
  notes?: string | null;
  logged_at: string;
}

export interface QuitUrgeLog {
  id: string;
  quit_habit_id: string;
  trigger_emotion: string;
  intensity: number;
  delayed_minutes: number;
  post_delay_feeling?: string | null;
  outcome: 'resisted' | 'reduced' | 'gave_in';
  notes?: string | null;
  logged_at: string;
}

export interface RecoveryEvent {
  id: string;
  target_type: 'habit' | 'quit';
  target_id: string;
  target_name?: string;
  missed_date: string;
  recovery_date: string;
  status: 'pending' | 'recovered' | 'expired';
  minimum_action_plan: string;
}

export interface TodayDashboardData {
  greeting: string;
  date_str: string;
  today_date: string;
  momentum_score: number;
  habits_completed_count: number;
  habits_total_count: number;
  routines_completed_count: number;
  routines_total_count: number;
  routines: Routine[];
  build_habits: Habit[];
  quit_habits: QuitHabit[];
  pending_recoveries: RecoveryEvent[];
  quick_insights: string[];
}

export interface AnalyticsProgressData {
  momentum_score: number;
  overall_consistency: number;
  habits_built_count: number;
  habits_reduced_count: number;
  current_streak: number;
  best_streak: number;
  weekly_consistency_trend: Array<{ day: string; date: string; completed: number; total: number; rate: number }>;
  monthly_heatmap: Array<{ date: string; count: number; level: number }>;
  category_distribution: Array<{ name: string; value: number }>;
  quit_reduction_trend: Array<{ name: string; baseline: number; target: number; current: number; today_usage: number; reduction_pct: number }>;
  urge_triggers: Array<{ emotion: string; count: number }>;
  behavioral_insights: Array<{ id: string; title: string; description: string; category: string; confidence: number; impact: string }>;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  is_read: boolean;
  sent_at: string;
}

export interface NotificationPreference {
  morning_briefing_enabled: boolean;
  morning_briefing_time: string;
  evening_summary_enabled: boolean;
  evening_summary_time: string;
  habit_reminders_enabled: boolean;
  routine_reminders_enabled: boolean;
  quit_alerts_enabled: boolean;
}
