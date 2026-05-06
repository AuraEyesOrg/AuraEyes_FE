export type ClinicAppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'CheckedIn'
  | 'InProgress'
  | 'WaitingForPayment'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow'
  | 'CancellationRequested';

export interface OrganisationSummaryDto {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  orgType?: string | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  avatarUrl?: string | null;
}

export interface DoctorSlotDetailDto {
  slotId: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string | null;
  providerAvatarUrl?: string | null;
  isBooked: boolean;
  price: number;
  bio?: string | null;
  ratingAverage: number;
  ratingCount: number;
  completedPatientsCount: number;
  certificates: CertificateDto[];
}

export interface CertificateDto {
  id: string;
  type: string;
  degreeLevel?: number | null;
  name: string;
  issuingAuthority?: string | null;
  issuingInstitution?: string | null;
  scopeOfPractice?: string | null;
  issuedDate: string;
  expiryDate?: string | null;
  certificateUrl?: string | null;
  licenseNumber?: string | null;
}

export interface AggregatedSlotDto {
  date: string;
  startTime: string;
  endTime: string;
  doctors: DoctorSlotDetailDto[];
  totalMaxCapacity: number;
  totalBookedCount: number;
  isAvailable: boolean;
}

export interface OrganisationScheduleDto {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  ratingAverage: number;
  ratingCount: number;
  aggregatedSlots: AggregatedSlotDto[];
}

export interface CreateClinicAppointmentRequest {
  slotId: string;
  visitReason?: string;
}

export interface ClinicAppointmentDto {
  id: string;
  patientId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  visitReason?: string | null;
  status: ClinicAppointmentStatus;
  createdAt?: string;
  ophthalId?: string | null;
  ophthalFullName?: string | null;
  ophthalAvatarUrl?: string | null;
  staffId?: string | null;
  staffName?: string | null;
  cost?: number | null;
  /**
   * Target types ('CLINIC' | 'DOCTOR' | 'STAFF') for which the patient has already submitted feedback.
   * Empty array means no feedback submitted yet.
   */
  submittedFeedbackTargets?: string[];
  /**
   * Convenience: True when the current patient has already submitted at least one feedback for this appointment.
   * @deprecated use submittedFeedbackTargets to check per-target
   */
  hasFeedback?: boolean;
  orderId?: string | null;
  totalAmount?: number | null;
  depositAmount?: number | null;
  isPaidDeposit?: boolean;
  paidAmount?: number | null;
  orderStatus?: string | null;
  refundBankNumber?: string | null;
  refundAccountName?: string | null;
  refundBankName?: string | null;
  cancellationReason?: string | null;
}

export interface RequestCancellationRequest {
  bankNumber?: string | null;
  accountName?: string | null;
  bankName?: string | null;
  reason?: string | null;
}

/** Matches backend enum {@link Application.Scheduling.Appointments.Queries.GetPatientClinicAppointments.PatientAppointmentTab}. */
export type PatientAppointmentTab =
  | 'All'
  | 'Upcoming'
  | 'Completed'
  | 'Cancelled';

export interface PatientClinicAppointmentsQuery {
  tab?: PatientAppointmentTab;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateClinicAppointmentResult {
  appointmentId: string;
  status: ClinicAppointmentStatus;
  /** PayOS checkout URL – redirect patient here to complete the 30% deposit. */
  paymentUrl: string | null;
  /** The Order ID created for this booking deposit. */
  orderId: string | null;
  /** Deposit amount in VND (30% of full slot price). */
  depositAmount?: number | null;
}

export interface CompleteClinicAppointmentRequest {
  notes?: string;
}

export interface OrganisationAvailableSlotDto {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
  maxCapacity: number;
  cost?: number | null;
}
