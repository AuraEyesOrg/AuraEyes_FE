import { api } from '@/lib/api';
import type { AxiosProgressEvent } from 'axios';
import type {
  PatientProfile,
  ProfileUpdateData,
  RetinalImageUpload,
  AnalysisResult,
  ScreeningReport,
  Clinic,
  ClinicSearchFilters,
  Appointment,
  AppointmentSlot,
  BookAppointmentData,
  VerificationRequest,
  HealthRoadmap,
  ChatConversation,
  ChatMessage,
  SendMessageData,
  Wallet,
  WalletTransaction,
  CreateDepositRequest,
  CreateDepositResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  PagedResult,
  PaginatedResponse,
  ApiResponse,
} from '../types';

// ============ API ENDPOINTS ============

export const PATIENT_ENDPOINTS = {
  // Profile
  PROFILE: {
    GET: '/patient/profile',
    UPDATE: '/patient/profile',
    UPLOAD_AVATAR: '/patient/profile/avatar',
    CHANGE_PASSWORD: '/patient/profile/change-password',
  },

  // Patient search (ophthalmologists, organisations, slots)
  SEARCH: {
    OPHTHALMOLOGISTS: '/patient/search/ophthalmologists',
    OPHTHALMOLOGIST_DETAIL: (id: string) =>
      `/patient/search/ophthalmologists/${id}`,
    ORGANISATIONS: '/patient/search/organisations',
    AVAILABLE_SLOTS: '/patient/search/available-slots',
    AVAILABLE_SLOT_DETAIL: (id: string) =>
      `/patient/search/available-slots/${id}`,
  },

  // Retinal Images & Screening
  IMAGES: {
    LIST: '/patient/images',
    UPLOAD: '/patient/images/upload',
    GET: (id: string) => `/patient/images/${id}`,
    DELETE: (id: string) => `/patient/images/${id}`,
    ANALYZE: (id: string) => `/patient/images/${id}/analyze`,
  },

  // Analysis & Results
  ANALYSIS: {
    LIST: '/patient/analysis',
    GET: (id: string) => `/patient/analysis/${id}`,
    HEATMAP: (id: string) => `/patient/analysis/${id}/heatmap`,
    DOWNLOAD_PDF: (id: string) => `/patient/analysis/${id}/pdf`,
  },

  // Screening Reports
  REPORTS: {
    LIST: '/patient/reports',
    GET: (id: string) => `/patient/reports/${id}`,
    DOWNLOAD_PDF: (id: string) => `/patient/reports/${id}/pdf`,
  },

  // Clinics
  CLINICS: {
    SEARCH: '/patient/clinics',
    GET: (id: string) => `/patient/clinics/${id}`,
    SLOTS: (id: string) => `/patient/clinics/${id}/slots`,
  },

  // Appointments
  APPOINTMENTS: {
    LIST: '/patient/appointments',
    CREATE: '/patient/appointments',
    GET: (id: string) => `/patient/appointments/${id}`,
    UPDATE: (id: string) => `/patient/appointments/${id}`,
    CANCEL: (id: string) => `/patient/appointments/${id}/cancel`,
    MANAGE_IMAGES: (id: string) => `/patient/appointments/${id}/images`,
  },

  // Verification
  VERIFICATION: {
    LIST: '/patient/verifications',
    CREATE: '/patient/verifications',
    GET: (id: string) => `/patient/verifications/${id}`,
    CANCEL: (id: string) => `/patient/verifications/${id}/cancel`,
  },

  // Health Roadmaps
  ROADMAPS: {
    LIST: '/patient/roadmaps',
    GET: (id: string) => `/patient/roadmaps/${id}`,
    UPDATE_MILESTONE: (roadmapId: string, milestoneId: string) =>
      `/patient/roadmaps/${roadmapId}/milestones/${milestoneId}`,
  },

  // Chat
  CHAT: {
    CONVERSATIONS: '/patient/chat/conversations',
    CONVERSATION: (id: string) => `/patient/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) =>
      `/patient/chat/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) =>
      `/patient/chat/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId: string) =>
      `/patient/chat/conversations/${conversationId}/read`,
  },

  // Wallet (maps to WalletsController)
  WALLET: {
    GET: '/wallets',
    TRANSACTIONS: '/wallets/transactions',
    DEPOSITS: '/wallets/deposits',
    DEPOSIT_BY_ID: (id: string) => `/wallets/deposits/${id}`,
    CREATE_DEPOSIT: '/wallets/deposit',
    VERIFY_PAYMENT: '/wallets/verify-payment',
    PAYMENT_STATUS: (orderCode: string) =>
      `/wallets/payment-status/${orderCode}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/patient/notifications',
    MARK_READ: (id: string) => `/patient/notifications/${id}/read`,
    MARK_ALL_READ: '/patient/notifications/read-all',
  },
};

// ============ PROFILE API ============

const normalizeDateOnly = (value?: string): string | undefined => {
  if (!value) return undefined;

  const directDateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (directDateOnlyMatch) {
    return directDateOnlyMatch[1];
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toISOString().split('T')[0];
};

const normalizePatientProfile = (profile: PatientProfile): PatientProfile => ({
  ...profile,
  dateOfBirth: normalizeDateOnly(profile.dateOfBirth),
});

export const getProfile = async (): Promise<PatientProfile> => {
  const response = await api.get<ApiResponse<PatientProfile>>(
    PATIENT_ENDPOINTS.PROFILE.GET
  );
  return normalizePatientProfile(response.data.data!);
};

export const updateProfile = async (
  data: ProfileUpdateData
): Promise<PatientProfile> => {
  const response = await api.put<ApiResponse<PatientProfile>>(
    PATIENT_ENDPOINTS.PROFILE.UPDATE,
    data
  );
  return normalizePatientProfile(response.data.data!);
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
    PATIENT_ENDPOINTS.PROFILE.UPLOAD_AVATAR,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data!.avatarUrl;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> => {
  await api.post(PATIENT_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
};

// ============ PATIENT SEARCH API ============

export interface OphthalmologistSearchItem {
  id: string;
  userId: string;
  userFullName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  isVerified: boolean;
  certificateCount: number;
  createdAt: string;
  licenseUrl?: string | null;
  degreeUrl?: string | null;
  ratingAverage?: number;
  ratingCount?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface OphthalmologistDetailItem {
  id: string;
  userId: string;
  userFullName?: string | null;
  userEmail?: string | null;
  bio?: string | null;
  yearsOfExperience: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string | null;
  licenseUrl?: string | null;
  degreeUrl?: string | null;
  ratingAverage?: number;
  ratingCount?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export interface AvailableSlotItem {
  id: string;
  organisationId?: string | null;
  ophthalmologistId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  createdAt: string;
}

type BackendAvailableSlotItem = {
  id?: string;
  Id?: string;
  organisationId?: string | null;
  ophthalmologistId?: string | null;
  orgId?: string | null;
  ophthalId?: string | null;
  date?: string;
  Date?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  startDateTime?: string;
  StartDateTime?: string;
  endDateTime?: string;
  EndDateTime?: string;
  maxCapacity?: number;
  MaxCapacity?: number;
  bookedCount?: number;
  BookedCount?: number;
  availableCapacity?: number;
  AvailableCapacity?: number;
  createdAt?: string;
  CreatedAt?: string;
};

const combineDateTime = (date: string, time: string): string =>
  `${date}T${time}`;

const normalizeAvailableSlot = (
  slot: BackendAvailableSlotItem
): AvailableSlotItem => {
  const date = slot.date ?? slot.Date ?? '';
  const startTime = slot.startTime ?? slot.StartTime ?? '';
  const endTime = slot.endTime ?? slot.EndTime ?? '';

  const startDateTime =
    slot.startDateTime ??
    slot.StartDateTime ??
    (date && startTime ? combineDateTime(date, startTime) : '');

  const endDateTime =
    slot.endDateTime ??
    slot.EndDateTime ??
    (date && endTime ? combineDateTime(date, endTime) : '');

  return {
    id: slot.id ?? slot.Id ?? '',
    organisationId: slot.organisationId ?? slot.orgId ?? null,
    ophthalmologistId: slot.ophthalmologistId ?? slot.ophthalId ?? null,
    date,
    startTime,
    endTime,
    startDateTime,
    endDateTime,
    maxCapacity: slot.maxCapacity ?? slot.MaxCapacity ?? 0,
    bookedCount: slot.bookedCount ?? slot.BookedCount ?? 0,
    availableCapacity: slot.availableCapacity ?? slot.AvailableCapacity ?? 0,
    createdAt: slot.createdAt ?? slot.CreatedAt ?? '',
  };
};

export interface OrganisationSearchItem {
  id: string;
  name: string;
  address?: string | null;
  licenseNumber?: string | null;
  orgType: string;
  deviceCount: number;
  isActive: boolean;
  createdAt: string;
}

export const searchOphthalmologistsForPatient = async (params: {
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedResult<OphthalmologistSearchItem>> => {
  const response = await api.get<
    ApiResponse<PagedResult<OphthalmologistSearchItem>>
  >(PATIENT_ENDPOINTS.SEARCH.OPHTHALMOLOGISTS, {
    params,
  });
  return response.data.data!;
};

export const getOphthalmologistDetailForPatient = async (
  id: string
): Promise<OphthalmologistDetailItem> => {
  const response = await api.get<ApiResponse<OphthalmologistDetailItem>>(
    PATIENT_ENDPOINTS.SEARCH.OPHTHALMOLOGIST_DETAIL(id)
  );
  return response.data.data!;
};

export const searchOrganisationsForPatient = async (params: {
  searchTerm?: string;
  orgType?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedResult<OrganisationSearchItem>> => {
  const response = await api.get<
    ApiResponse<PagedResult<OrganisationSearchItem>>
  >(PATIENT_ENDPOINTS.SEARCH.ORGANISATIONS, {
    params,
  });
  return response.data.data!;
};

export const searchAvailableSlotsForPatient = async (params: {
  ophthalmologistId?: string;
  organisationId?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PagedResult<AvailableSlotItem>> => {
  const response = await api.get<
    ApiResponse<PagedResult<BackendAvailableSlotItem>>
  >(PATIENT_ENDPOINTS.SEARCH.AVAILABLE_SLOTS, {
    params,
  });

  const page = response.data.data!;

  return {
    ...page,
    items: (page.items ?? []).map(normalizeAvailableSlot),
  };
};

// ============ IMAGES API ============

export const getImages = async (): Promise<RetinalImageUpload[]> => {
  const response = await api.get<ApiResponse<RetinalImageUpload[]>>(
    PATIENT_ENDPOINTS.IMAGES.LIST
  );
  return response.data.data!;
};

export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<RetinalImageUpload> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post<ApiResponse<RetinalImageUpload>>(
    PATIENT_ENDPOINTS.IMAGES.UPLOAD,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    }
  );
  return response.data.data!;
};

export const deleteImage = async (id: string): Promise<void> => {
  await api.delete(PATIENT_ENDPOINTS.IMAGES.DELETE(id));
};

export const analyzeImage = async (id: string): Promise<AnalysisResult> => {
  const response = await api.post<ApiResponse<AnalysisResult>>(
    PATIENT_ENDPOINTS.IMAGES.ANALYZE(id)
  );
  return response.data.data!;
};

// ============ ANALYSIS API ============

export const getAnalysisList = async (): Promise<AnalysisResult[]> => {
  const response = await api.get<ApiResponse<AnalysisResult[]>>(
    PATIENT_ENDPOINTS.ANALYSIS.LIST
  );
  return response.data.data!;
};

export const getAnalysis = async (id: string): Promise<AnalysisResult> => {
  const response = await api.get<ApiResponse<AnalysisResult>>(
    PATIENT_ENDPOINTS.ANALYSIS.GET(id)
  );
  return response.data.data!;
};

export const downloadAnalysisPdf = async (id: string): Promise<Blob> => {
  const response = await api.get(PATIENT_ENDPOINTS.ANALYSIS.DOWNLOAD_PDF(id), {
    responseType: 'blob',
  });
  return response.data;
};

// ============ REPORTS API ============

export const getReports = async (): Promise<ScreeningReport[]> => {
  const response = await api.get<ApiResponse<ScreeningReport[]>>(
    PATIENT_ENDPOINTS.REPORTS.LIST
  );
  return response.data.data!;
};

export const getReport = async (id: string): Promise<ScreeningReport> => {
  const response = await api.get<ApiResponse<ScreeningReport>>(
    PATIENT_ENDPOINTS.REPORTS.GET(id)
  );
  return response.data.data!;
};

export const downloadReportPdf = async (id: string): Promise<Blob> => {
  const response = await api.get(PATIENT_ENDPOINTS.REPORTS.DOWNLOAD_PDF(id), {
    responseType: 'blob',
  });
  return response.data;
};

// ============ CLINICS API ============

export const searchClinics = async (
  filters: ClinicSearchFilters
): Promise<PaginatedResponse<Clinic>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<Clinic>>>(
    PATIENT_ENDPOINTS.CLINICS.SEARCH,
    { params: filters }
  );
  return response.data.data!;
};

export const getClinic = async (id: string): Promise<Clinic> => {
  const response = await api.get<ApiResponse<Clinic>>(
    PATIENT_ENDPOINTS.CLINICS.GET(id)
  );
  return response.data.data!;
};

export const getClinicSlots = async (
  clinicId: string,
  date: string
): Promise<AppointmentSlot[]> => {
  const response = await api.get<ApiResponse<AppointmentSlot[]>>(
    PATIENT_ENDPOINTS.CLINICS.SLOTS(clinicId),
    { params: { date } }
  );
  return response.data.data!;
};

// ============ APPOINTMENTS API ============

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<ApiResponse<Appointment[]>>(
    PATIENT_ENDPOINTS.APPOINTMENTS.LIST
  );
  return response.data.data!;
};

export const getAppointment = async (id: string): Promise<Appointment> => {
  const response = await api.get<ApiResponse<Appointment>>(
    PATIENT_ENDPOINTS.APPOINTMENTS.GET(id)
  );
  return response.data.data!;
};

export const bookAppointment = async (
  data: BookAppointmentData
): Promise<Appointment> => {
  const response = await api.post<ApiResponse<Appointment>>(
    PATIENT_ENDPOINTS.APPOINTMENTS.CREATE,
    data
  );
  return response.data.data!;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  await api.post(PATIENT_ENDPOINTS.APPOINTMENTS.CANCEL(id));
};

export const updateAppointmentImages = async (
  appointmentId: string,
  imageIds: string[]
): Promise<void> => {
  await api.put(PATIENT_ENDPOINTS.APPOINTMENTS.MANAGE_IMAGES(appointmentId), {
    imageIds,
  });
};

// ============ VERIFICATION API ============

export const getVerificationRequests = async (): Promise<
  VerificationRequest[]
> => {
  const response = await api.get<ApiResponse<VerificationRequest[]>>(
    PATIENT_ENDPOINTS.VERIFICATION.LIST
  );
  return response.data.data!;
};

export const getVerificationRequest = async (
  id: string
): Promise<VerificationRequest> => {
  const response = await api.get<ApiResponse<VerificationRequest>>(
    PATIENT_ENDPOINTS.VERIFICATION.GET(id)
  );
  return response.data.data!;
};

export const createVerificationRequest = async (data: {
  screeningReportId: string;
  ophthalmologistId?: string;
  priority: 'normal' | 'urgent';
}): Promise<VerificationRequest> => {
  const response = await api.post<ApiResponse<VerificationRequest>>(
    PATIENT_ENDPOINTS.VERIFICATION.CREATE,
    data
  );
  return response.data.data!;
};

export const cancelVerificationRequest = async (id: string): Promise<void> => {
  await api.post(PATIENT_ENDPOINTS.VERIFICATION.CANCEL(id));
};

// ============ ROADMAPS API ============

export const getRoadmaps = async (): Promise<HealthRoadmap[]> => {
  const response = await api.get<ApiResponse<HealthRoadmap[]>>(
    PATIENT_ENDPOINTS.ROADMAPS.LIST
  );
  return response.data.data!;
};

export const getRoadmap = async (id: string): Promise<HealthRoadmap> => {
  const response = await api.get<ApiResponse<HealthRoadmap>>(
    PATIENT_ENDPOINTS.ROADMAPS.GET(id)
  );
  return response.data.data!;
};

export const updateMilestone = async (
  roadmapId: string,
  milestoneId: string,
  status: 'pending' | 'in-progress' | 'completed'
): Promise<void> => {
  await api.patch(
    PATIENT_ENDPOINTS.ROADMAPS.UPDATE_MILESTONE(roadmapId, milestoneId),
    { status }
  );
};

// ============ CHAT API ============

export const getConversations = async (): Promise<ChatConversation[]> => {
  const response = await api.get<ApiResponse<ChatConversation[]>>(
    PATIENT_ENDPOINTS.CHAT.CONVERSATIONS
  );
  return response.data.data!;
};

export const getConversation = async (
  id: string
): Promise<ChatConversation> => {
  const response = await api.get<ApiResponse<ChatConversation>>(
    PATIENT_ENDPOINTS.CHAT.CONVERSATION(id)
  );
  return response.data.data!;
};

export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ChatMessage>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<ChatMessage>>>(
    PATIENT_ENDPOINTS.CHAT.MESSAGES(conversationId),
    { params: { page, limit } }
  );
  return response.data.data!;
};

export const sendMessage = async (
  data: SendMessageData
): Promise<ChatMessage> => {
  const response = await api.post<ApiResponse<ChatMessage>>(
    PATIENT_ENDPOINTS.CHAT.SEND(data.conversationId),
    data
  );
  return response.data.data!;
};

export const markConversationAsRead = async (
  conversationId: string
): Promise<void> => {
  await api.post(PATIENT_ENDPOINTS.CHAT.MARK_READ(conversationId));
};

// ============ WALLET API ============

/** Backend response wrapper: { success, message, data, timestamp } */
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const getWallets = async (): Promise<Wallet> => {
  const response = await api.get<ApiResponse<Wallet>>(
    PATIENT_ENDPOINTS.WALLET.GET
  );
  return response.data.data!;
};

export const walletApi = {
  /** GET /wallets - Get current user's wallet */
  async getWallet(): Promise<Wallet> {
    const response = await api.get<BackendApiResponse<Wallet>>(
      PATIENT_ENDPOINTS.WALLET.GET
    );
    return response.data.data;
  },

  /** GET /wallets/transactions - Get paginated transaction history */
  async getTransactions(
    pageNumber = 1,
    pageSize = 20
  ): Promise<PagedResult<WalletTransaction>> {
    const response = await api.get<
      BackendApiResponse<PagedResult<WalletTransaction>>
    >(PATIENT_ENDPOINTS.WALLET.TRANSACTIONS, {
      params: { pageNumber, pageSize },
    });
    return response.data.data;
  },

  /** GET /wallets/deposits - Get paginated deposit history */
  async getDeposits(
    pageNumber = 1,
    pageSize = 20
  ): Promise<PagedResult<import('../types').DepositRequestDto>> {
    const response = await api.get<
      BackendApiResponse<PagedResult<import('../types').DepositRequestDto>>
    >(PATIENT_ENDPOINTS.WALLET.DEPOSITS, {
      params: { pageNumber, pageSize },
    });
    return response.data.data;
  },

  /** POST /wallets/deposit - Create deposit & get PayOS payment link */
  async createDeposit(
    data: CreateDepositRequest
  ): Promise<CreateDepositResponse> {
    const response = await api.post<BackendApiResponse<CreateDepositResponse>>(
      PATIENT_ENDPOINTS.WALLET.CREATE_DEPOSIT,
      data
    );
    return response.data.data;
  },

  /** POST /wallets/verify-payment - Verify payment and credit wallet */
  async verifyPayment(
    data: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    const response = await api.post<BackendApiResponse<VerifyPaymentResponse>>(
      PATIENT_ENDPOINTS.WALLET.VERIFY_PAYMENT,
      data
    );
    return response.data.data;
  },

  /** GET /wallets/payment-status/:orderCode - Check payment status (public) */
  async getPaymentStatus(orderCode: string): Promise<VerifyPaymentResponse> {
    const response = await api.get<BackendApiResponse<VerifyPaymentResponse>>(
      PATIENT_ENDPOINTS.WALLET.PAYMENT_STATUS(orderCode)
    );
    return response.data.data;
  },
};
