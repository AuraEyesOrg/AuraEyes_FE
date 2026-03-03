// Patient Feature Types
export * from './type';

// ============ USER & PROFILE TYPES ============

export interface PatientProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
}

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

// ============ RETINAL IMAGE & ANALYSIS TYPES ============

export interface RetinalImageUpload {
  id: string;
  fileName: string;
  fileType: 'JPG' | 'PNG' | 'DICOM';
  fileSize: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  originalUrl?: string;
}

export interface AnalysisResult {
  id: string;
  imageId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'verified';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  findings: AnalysisFinding[];
  heatmapUrl?: string;
  roadmapUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: OphthalmologistInfo;
}

export interface AnalysisFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  description: string;
  confidence: number;
}

export interface OphthalmologistInfo {
  id: string;
  fullName: string;
  title: string;
  specialty: string;
  clinicName: string;
  avatarUrl?: string;
}

// ============ SCREENING RESULT TYPES ============

export interface ScreeningReport {
  id: string;
  patientId: string;
  imageId: string;
  analysisId: string;
  type: 'AI_SCREENING' | 'OPHTHALMOLOGIST_VERIFIED';
  status: 'pending' | 'completed' | 'verified';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  findings: AnalysisFinding[];
  recommendations: string[];
  heatmapUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: OphthalmologistInfo;
}

// ============ CLINIC & HOSPITAL TYPES ============

export interface Clinic {
  id: string;
  name: string;
  type: 'clinic' | 'hospital';
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  operatingHours: OperatingHours[];
  services: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number; // in km from user location
  isPartner: boolean;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ClinicSearchFilters {
  query?: string;
  city?: string;
  type?: 'clinic' | 'hospital' | 'all';
  rating?: number;
  distance?: number;
  services?: string[];
  page?: number;
  limit?: number;
}

// ============ APPOINTMENT TYPES ============

export interface Appointment {
  id: string;
  patientId: string;
  clinicId: string;
  clinic: Clinic;
  ophthalmologistId?: string;
  ophthalmologist?: OphthalmologistInfo;
  type: 'screening' | 'consultation' | 'follow-up' | 'verification';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  date: string;
  time: string;
  duration: number; // in minutes
  isOnline: boolean;
  meetingUrl?: string;
  notes?: string;
  relatedImageIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  ophthalmologistId?: string;
  ophthalmologist?: OphthalmologistInfo;
}

export interface BookAppointmentData {
  clinicId: string;
  ophthalmologistId?: string;
  type: 'screening' | 'consultation' | 'follow-up' | 'verification';
  date: string;
  time: string;
  isOnline: boolean;
  notes?: string;
  relatedImageIds?: string[];
}

// ============ VERIFICATION SERVICE TYPES ============

export interface VerificationRequest {
  id: string;
  patientId: string;
  screeningReportId: string;
  ophthalmologistId?: string;
  ophthalmologist?: OphthalmologistInfo;
  status: 'pending' | 'in-review' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  fee: number;
  paidAt?: string;
  requestedAt: string;
  completedAt?: string;
  result?: VerificationResult;
}

export interface VerificationResult {
  id: string;
  diagnosis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  findings: VerificationFinding[];
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  additionalNotes?: string;
  pdfUrl?: string;
}

export interface VerificationFinding {
  id: string;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  affectedArea: string;
}

// ============ HEALTH ROADMAP TYPES ============

export interface HealthRoadmap {
  id: string;
  patientId: string;
  diagnosisId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  progress: number;
  milestones: RoadmapMilestone[];
  recommendations: RoadmapRecommendation[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'missed';
  completedAt?: string;
  type: 'checkup' | 'screening' | 'lifestyle' | 'medication' | 'other';
}

export interface RoadmapRecommendation {
  id: string;
  category: 'diet' | 'exercise' | 'medication' | 'lifestyle' | 'monitoring';
  title: string;
  description: string;
  frequency?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

// ============ CHAT TYPES ============

export interface ChatConversation {
  id: string;
  patientId: string;
  ophthalmologistId: string;
  ophthalmologist: OphthalmologistInfo;
  status: 'active' | 'closed';
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'patient' | 'ophthalmologist';
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

// ============ WALLET TYPES ============

export interface Wallet {
  id: string;
  patientId: string;
  balance: number;
  currency: 'VND';
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'payment' | 'refund' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  referenceId?: string;
  paymentMethod?: 'payos' | 'vnpay' | 'bank_transfer';
  createdAt: string;
  completedAt?: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: 'payos' | 'vnpay';
  returnUrl?: string;
  cancelUrl?: string;
}

export interface DepositResponse {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  expiresAt: string;
}

// ============ NOTIFICATION TYPES ============

export interface Notification {
  id: string;
  patientId: string;
  type:
    | 'appointment'
    | 'result'
    | 'verification'
    | 'chat'
    | 'wallet'
    | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ============ PAGINATION & RESPONSE TYPES ============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
