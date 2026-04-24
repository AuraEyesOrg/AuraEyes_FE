export type ClinicAppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'CheckedIn'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow';

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
  isBooked: boolean;
  price: number;
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
  organisationId: string;
  slotId: string;
  visitReason?: string;
}

export interface ClinicAppointmentDto {
  id: string;
  patientId: string;
  organisationId: string;
  organisationName?: string | null;
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
  cost?: number | null;
  /**
   * True when the current patient has already submitted feedback for this
   * appointment. Populated server-side so the client never has to run an
   * N+1 existence-check across organisations.
   */
  hasFeedback?: boolean;
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
