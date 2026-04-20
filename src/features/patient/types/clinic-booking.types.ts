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

export interface OrganisationAvailableSlotDto {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  remaining: number;
  cost?: number | null;
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
}

export interface CompleteClinicAppointmentRequest {
  notes?: string;
}
