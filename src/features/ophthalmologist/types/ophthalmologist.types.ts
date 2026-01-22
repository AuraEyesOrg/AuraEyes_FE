export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  department: string;
  avatar: string | null;
}

export interface DashboardStats {
  pendingReviews: number;
  urgentCases: number;
  completedToday: number;
}

export type ConditionType =
  | 'glaucoma'
  | 'vein-occlusion'
  | 'diabetic-retinopathy'
  | 'macular-degeneration'
  | 'microaneurysms'
  | 'hypertensive'
  | 'healthy';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface UrgentAlert {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  condition: string;
  conditionType: ConditionType;
  aiConfidence: number;
  eyeImage: string;
  priority: Priority;
}

export type PatientStatus = 'ai-analyzed' | 'flagged-for-review' | 'reviewed';
export type PatientAction = 'start-review' | 'quick-approve';

export interface ScreeningPatient {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  scanDate: string;
  aiPrediction: string;
  predictionType: ConditionType;
  confidence: number;
  status: PatientStatus;
  action: PatientAction;
}

export interface ScreeningQueue {
  total: number;
  showing: number;
  currentPage: number;
  totalPages: number;
  patients: ScreeningPatient[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active: boolean;
}

export interface OphthalmologistData {
  doctor: Doctor;
  dashboardStats: DashboardStats;
  urgentAlerts: UrgentAlert[];
  screeningQueue: ScreeningQueue;
  navItems: NavItem[];
}
