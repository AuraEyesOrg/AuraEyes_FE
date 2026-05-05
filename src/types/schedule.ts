/**
 * Schedule types matching backend DTOs exactly.
 * Maps to: Domain/Enums + Application/Ophthalmologists/Schedules/Common/ScheduleDtos
 */

// ============ ENUMS (match BE Domain/Enums) ============

export enum ScheduleStatus {
  Available = 1,
  Booked = 2,
  Cancelled = 3,
  Completed = 4,
  NoShow = 5,
  Reserved = 6, // Slot is temporarily reserved (pending payment)
  Blocked = 7, // Slot is blocked by doctor (not available)
  Expired = 8, // Slot auto-expired after start time passed without booking
}

export enum SlotType {
  Consultation = 1,
  FollowUp = 2,
  Screening = 3,
  Emergency = 4,
}

export enum PricingType {
  AutoAssign = 1,
  DoctorSelected = 2,
}

// ============ DTOs (match BE Application layer) ============

/** List item - maps to ScheduleListDto */
export interface ScheduleListDto {
  id: string;
  ophthalmologistId: string;
  organisationId: string | null;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  status: ScheduleStatus;
  statusName: string;
  slotType: SlotType;
  slotTypeName: string;
  cost: number | null;
  createdAt: string;
}

/** Full detail - maps to ScheduleDto */
export interface ScheduleDto {
  id: string;
  ophthalmologistId: string;
  ophthalmologistName: string | null;
  organisationId: string | null;
  organisationName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  statusName: string;
  slotType: SlotType;
  slotTypeName: string;
  cost: number | null;
  createdAt: string;
  updatedAt: string | null;
}

// ============ REQUEST MODELS ============

export interface CreateScheduleRequest {
  organisationId?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  slotType: SlotType;
  cost?: number;
}

export interface UpdateScheduleStatusRequest {
  newStatus: ScheduleStatus;
}

// ============ QUERY PARAMS ============

export interface GetSchedulesParams {
  ophthalmologistId: string;
  status?: ScheduleStatus;
  slotType?: SlotType;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ============ HELPER MAPS ============

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  [ScheduleStatus.Available]: 'Available',
  [ScheduleStatus.Booked]: 'Booked',
  [ScheduleStatus.Cancelled]: 'Cancelled',
  [ScheduleStatus.Completed]: 'Completed',
  [ScheduleStatus.NoShow]: 'No Show',
  [ScheduleStatus.Reserved]: 'Reserved',
  [ScheduleStatus.Blocked]: 'Blocked',
  [ScheduleStatus.Expired]: 'Expired',
};

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  [SlotType.Consultation]: 'Consultation',
  [SlotType.FollowUp]: 'Follow-Up',
  [SlotType.Screening]: 'Screening',
  [SlotType.Emergency]: 'Emergency',
};

// ============ APPOINTMENT SLOT BOOKING TYPES ============

export interface SlotBookingDto {
  appointmentId: string;
  patientId: string;
  patientName: string;
  status: string;
}

/** List item DTO for appointment slots - matches BE AppointmentSlotListDto */
export interface AppointmentSlotListDto {
  id: string;
  ophthalId: string;
  scheduleTemplateId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  status: string; // "Available", "Reserved", "Booked", "Blocked"
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  ophthalFullName?: string;
  ophthalAvatarUrl?: string;
  cost: number | null;
  createdAt: string;
  bookings: SlotBookingDto[];
}

/** Full detail DTO for appointment slot - matches BE AppointmentSlotDto */
export interface AppointmentSlotDto {
  id: string;
  ophthalId: string;
  scheduleTemplateId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  status: string; // "Available", "Reserved", "Booked", "Blocked"
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  ophthalFullName?: string;
  ophthalAvatarUrl?: string;
  cost: number | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Reservation response */
export interface SlotReservationResult {
  slotId: string;
  expiresAt: string;
  remainingSeconds: number;
}

/** Booking confirmation response */
export interface BookingConfirmationResult {
  consultationSessionId: string;
  appointmentSlotId: string;
  appointmentTime: string;
}

// ============ BOOKING REQUEST MODELS ============

export interface ReserveSlotRequest {
  patientId: string;
  reservationMinutes?: number; // Default 5 minutes
}

export interface ConfirmReservationRequest {
  patientId: string;
  aiScreeningId?: string;
  shareRetinalImages?: boolean;
  shareAiResults?: boolean;
}

export interface ReleaseReservationRequest {
  patientId: string;
}

export interface CreateClinicAppointmentRequest {
  slotId: string;
  visitReason?: string;
  pricingType: PricingType;
  requestedDoctorId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface BlockSlotRequest {
  ophthalmologistId: string;
  reason?: string;
}

export interface UnblockSlotRequest {
  ophthalmologistId: string;
}

export interface GenerateSlotsRequest {
  scheduleTemplateId: string;
  fromDate: string;
  toDate: string;
  skipExistingDates?: boolean;
}

export interface AllowedPriceRangeDto {
  ophthalmologistId: string;
  minPrice: number;
  maxPrice: number;
}

// ============ SCHEDULE TEMPLATE TYPES ============

export interface ScheduleTemplateDto {
  id: string;
  dayOfWeek: number | string; // BE might return string like "Friday"
  startTime: string;
  endTime: string;
  slotDuration: number; // minutes
  slotType: number;
  slotTypeName: string;
  maxCapacity: number;
  cost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateScheduleTemplateRequest {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string;
  endTime: string;
  slotDuration: number;
  slotType?: number;
  maxCapacity?: number;
  cost?: number;
}

export interface UpdateScheduleTemplateRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxCapacity?: number;
  isActive?: boolean;
}

// ============ QUERY PARAMS ============

export interface GetAppointmentSlotsParams {
  ophthalId?: string;
  status?: ScheduleStatus;
  slotType?: SlotType;
  fromDate?: string;
  toDate?: string;
  excludePastSlots?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
