export type WebsiteFeedbackCategory = 'BUG' | 'UX' | 'SUGGESTION' | 'OTHER';

export interface CreateWebsiteFeedbackRequest {
  rating: number;
  category: WebsiteFeedbackCategory;
  comment?: string;
}

export type CreateClinicFeedbackRequest = {
  appointmentId: string;
  rating: number;
  comment?: string;
  doctorId?: string;
  staffId?: string;
};

export interface CreateOphthalmologistFeedbackRequest {
  consultationSessionId: string;
  rating: number;
  comment?: string;
}

export interface FeedbackRatingSummary {
  entityId: string;
  ratingAverage: number;
  ratingCount: number;
  distribution: Record<number, number>;
}

export type ClinicFeedbackItem = {
  id: string;
  patientId: string;
  patientFullName?: string;
  organisationId?: string;
  appointmentId: string;
  rating: number;
  comment?: string;
  doctorId?: string;
  staffId?: string;
  createdAt: string;
};

export interface OphthalmologistFeedbackItem {
  id: string;
  patientId: string;
  patientFullName?: string | null;
  ophthalmologistId: string;
  consultationSessionId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackFormValues {
  rating: number;
  comment?: string;
}

export interface WebsiteFeedbackFormValues extends FeedbackFormValues {
  category: WebsiteFeedbackCategory;
}
