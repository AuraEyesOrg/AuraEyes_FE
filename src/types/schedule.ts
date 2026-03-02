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
}

export enum SlotType {
  Consultation = 1,
  FollowUp = 2,
  Screening = 3,
  Emergency = 4,
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
};

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  [SlotType.Consultation]: 'Consultation',
  [SlotType.FollowUp]: 'Follow-Up',
  [SlotType.Screening]: 'Screening',
  [SlotType.Emergency]: 'Emergency',
};
