export interface UserProfile {
  name: string;
  age: number;
  location: string;
  avatar: string;
  stats: {
    blood: string;
    height: string;
    weight: string;
  };
}

export interface DailyStat {
  current: number;
  goal: number;
  unit: string;
}

export interface DailyStats {
  steps: DailyStat;
  calories: DailyStat;
  water: DailyStat;
}

export interface FitnessActivityData {
  month: string;
  water: number;
  steps: number;
  calories: number;
}

export interface SleepData {
  percentage: number;
  minutesYesterday: number;
  hoursYesterday: number;
}

export interface CalendarDate {
  day: string;
  date: number;
  active?: boolean;
}

export interface Calendar {
  currentMonth: string;
  selectedDate: number;
  dates: CalendarDate[];
}

export interface UpcomingEvent {
  id: number;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  type: string;
  color: string;
}

export interface Reminder {
  id: number;
  title: string;
  duration: string;
  icon: string;
  color: string;
}

export interface Report {
  id: number;
  title: string;
  percentage: number;
  status: 'increase' | 'decrease';
}

export interface WorkoutSession {
  id: number;
  title: string;
  time: string;
  coach: string;
}

export interface GoalProgress {
  achieved: number;
  total: number;
  month: string;
}

export interface AdminDashboardData {
  user: UserProfile;
  dailyStats: DailyStats;
  fitnessActivity: FitnessActivityData[];
  sleepData: SleepData;
  calendar: Calendar;
  upcomingEvents: UpcomingEvent[];
  reminders: Reminder[];
  reports: Report[];
  workoutSessions: WorkoutSession[];
  goalProgress: GoalProgress;
}
