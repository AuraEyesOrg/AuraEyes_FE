export interface Clinic {
  name: string;
  location: string;
  admin: string;
  avatar: string;
}

export interface DashboardStat {
  value: number;
  change?: string;
  trend: 'up' | 'down' | 'stable';
  accuracy?: number;
}

export interface DashboardStats {
  totalScreenings: DashboardStat;
  pendingReviews: DashboardStat;
  aiPredictions: DashboardStat;
  criticalCases: DashboardStat;
}

export interface ScreeningActivityData {
  month: string;
  screenings: number;
  predictions: number;
  reviewed: number;
}

export interface PredictionAccuracy {
  overall: number;
  byCondition: {
    diabeticRetinopathy: number;
    glaucoma: number;
    macularDegeneration: number;
    hypertensiveRetinopathy: number;
  };
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  lastScreening: string;
  aiPrediction: string;
  confidence: number;
  status: 'pending-review' | 'reviewed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  phone?: string;
  email?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: 'Screening' | 'Follow-up' | 'Consultation';
  doctor: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  patientsReviewed: number;
  avgReviewTime: string;
}

export interface CalendarAvailability {
  workingHours: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  blockedDates: string[];
  appointmentDuration: number;
}

export interface OrganisationData {
  clinic: Clinic;
  dashboardStats: DashboardStats;
  screeningActivity: ScreeningActivityData[];
  predictionAccuracy: PredictionAccuracy;
  recentPatients: Patient[];
  upcomingAppointments: Appointment[];
  alerts: Alert[];
  doctors: Doctor[];
  calendarAvailability: CalendarAvailability;
}
