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
  doctorId?: string | null;
  doctorName?: string | null;
  visitReason?: string | null;
  status: ClinicAppointmentStatus;
  createdAt?: string;
}

export interface CreateClinicAppointmentResult {
  appointmentId: string;
  status: ClinicAppointmentStatus;
}

export interface AssignDoctorRequest {
  doctorId: string;
}

export interface CompleteClinicAppointmentRequest {
  notes?: string;
}
