/**
 * Authentication API
 * API functions for user authentication, registration, and token management
 */

import { api } from '@/lib/api';
import { setItem, getItem } from '@/lib/local-storage';
import type {
  LoginRequest,
  GoogleLoginRequest,
  RegisterPatientRequest,
  RegisterOphthalmologistRequest,
  RegisterOrganisationRequest,
  VerifyTwoFactorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ConfirmEmailRequest,
  AuthResponse,
  TwoFactorRequiredResponse,
  UserInfoResponse,
} from '../types';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// ==================== Type Guards ====================

export const isTwoFactorRequired = (
  response: AuthResponse | TwoFactorRequiredResponse
): response is TwoFactorRequiredResponse => {
  return 'requiresTwoFactor' in response && response.requiresTwoFactor === true;
};

// ==================== Storage Keys ====================

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const parseProfileIdFromToken = (token: string): string | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as { profile_id?: string };
    return payload.profile_id ?? null;
  } catch {
    return null;
  }
};

const enrichUserWithRoleId = (
  user: UserInfoResponse,
  accessToken?: string
): UserInfoResponse => {
  if (user.roleId) return user;
  if (!accessToken) return user;

  const profileId = parseProfileIdFromToken(accessToken);
  if (!profileId) return user;

  return {
    ...user,
    roleId: profileId,
  };
};

// ==================== Token Management ====================

export const saveAuthTokens = (
  accessToken: string,
  refreshToken: string
): void => {
  setItem(TOKEN_KEY, accessToken);
  setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const saveUser = (user: UserInfoResponse): void => {
  setItem(USER_KEY, user);
};

export const getAccessToken = (): string | null => {
  return getItem<string>(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return getItem<string>(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): UserInfoResponse | null => {
  return getItem<UserInfoResponse>(USER_KEY);
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ==================== API Functions ====================

const AUTH_BASE_URL = '/auth';

/**
 * Login with email and password
 * Returns AuthResponse on success, or TwoFactorRequiredResponse if 2FA is enabled
 */
export const login = async (
  data: LoginRequest
): Promise<AuthResponse | TwoFactorRequiredResponse> => {
  const response = await api.post<
    ApiResponse<AuthResponse | TwoFactorRequiredResponse>
  >(`${AUTH_BASE_URL}/login`, {
    ...data,
    deviceInfo: data.deviceInfo || navigator.userAgent,
  });

  const result = response.data.data;

  // If login successful (not 2FA required), save tokens
  if (
    !isTwoFactorRequired(result) &&
    result.succeeded &&
    result.accessToken &&
    result.refreshToken
  ) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithRoleId(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
    }
  }

  return result;
};

/**
 * Returns AuthResponse on success, or TwoFactorRequiredResponse if 2FA is enabled
 */
export const googleLogin = async (
  data: GoogleLoginRequest
): Promise<AuthResponse | TwoFactorRequiredResponse> => {
  const response = await api.post<
    ApiResponse<AuthResponse | TwoFactorRequiredResponse>
  >(`${AUTH_BASE_URL}/google-login`, {
    ...data,
    deviceInfo: data.deviceInfo || navigator.userAgent,
  });

  const result = response.data.data;

  // If login successful (not 2FA required), save tokens
  if (
    !isTwoFactorRequired(result) &&
    result.succeeded &&
    result.accessToken &&
    result.refreshToken
  ) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithRoleId(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
    }
  }

  return result;
};

/**
 * Verify 2FA code and complete login
 */
export const verifyTwoFactorLogin = async (
  data: VerifyTwoFactorRequest
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    `${AUTH_BASE_URL}/login/verify-2fa`,
    {
      ...data,
      deviceInfo: data.deviceInfo || navigator.userAgent,
    }
  );

  const result = response.data.data;

  // Save tokens on successful 2FA verification
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithRoleId(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
    }
  }

  return result;
};

/**
 * Register a new patient account
 */
export const registerPatient = async (
  data: RegisterPatientRequest
): Promise<{ userId: string }> => {
  const response = await api.post<ApiResponse<{ userId: string }>>(
    `${AUTH_BASE_URL}/register/patient`,
    data
  );
  return response.data.data;
};

/**
 * Register a new ophthalmologist account
 * Uses FormData to support dynamic credential arrays with file uploads
 */
export const registerOphthalmologist = async (
  data: RegisterOphthalmologistRequest
): Promise<{ userId: string }> => {
  const formData = new FormData();
  formData.append('Email', data.email);
  formData.append('Password', data.password);
  formData.append('ConfirmPassword', data.confirmPassword);
  formData.append('FullName', data.fullName);
  if (data.phone) formData.append('Phone', data.phone);
  if (data.bio) formData.append('Bio', data.bio);
  formData.append('YearsOfExperience', String(data.yearsOfExperience));
  formData.append('EmploymentType', data.employmentType);
  if (data.workingHoursPerWeek !== undefined) {
    formData.append('WorkingHoursPerWeek', String(data.workingHoursPerWeek));
  }
  if (data.expectedMonthlySalary !== undefined) {
    formData.append(
      'ExpectedMonthlySalary',
      String(data.expectedMonthlySalary)
    );
  }
  if (data.organizationId)
    formData.append('OrganizationId', data.organizationId);

  data.degrees.forEach((item, index) => {
    formData.append(`Degrees[${index}].Name`, item.name);
    if (item.issuingAuthority) {
      formData.append(
        `Degrees[${index}].IssuingAuthority`,
        item.issuingAuthority
      );
    }
    formData.append(`Degrees[${index}].IssuedDate`, item.issuedDate);
    if (item.expiryDate) {
      formData.append(`Degrees[${index}].ExpiryDate`, item.expiryDate);
    }
    formData.append(`Degrees[${index}].File`, item.file);
  });

  data.certificates.forEach((item, index) => {
    formData.append(`Certificates[${index}].Name`, item.name);
    if (item.issuingAuthority) {
      formData.append(
        `Certificates[${index}].IssuingAuthority`,
        item.issuingAuthority
      );
    }
    formData.append(`Certificates[${index}].IssuedDate`, item.issuedDate);
    if (item.expiryDate) {
      formData.append(`Certificates[${index}].ExpiryDate`, item.expiryDate);
    }
    formData.append(`Certificates[${index}].File`, item.file);
  });

  const response = await api.post<ApiResponse<{ userId: string }>>(
    `${AUTH_BASE_URL}/register/ophthalmologist`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const registerOrganisation = async (
  data: RegisterOrganisationRequest
): Promise<{ requestId: string; email: string; message: string }> => {
  const response = await api.post<
    ApiResponse<{ requestId: string; email: string; message: string }>
  >(`${AUTH_BASE_URL}/register/organisation`, data);
  return response.data.data;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const accessToken = getAccessToken();
  const refreshTokenValue = getRefreshToken();

  if (!accessToken || !refreshTokenValue) {
    throw new Error('No tokens available for refresh');
  }

  const response = await api.post<ApiResponse<AuthResponse>>(
    `${AUTH_BASE_URL}/refresh`,
    {
      accessToken,
      refreshToken: refreshTokenValue,
    }
  );

  const result = response.data.data;

  // Update stored tokens
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithRoleId(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
    }
  }

  return result;
};

/**
 * Logout - revoke refresh token
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post(`${AUTH_BASE_URL}/logout`);
  } finally {
    clearAuthData();
  }
};

/**
 * Request password reset email
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/forgot-password`, data);
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/reset-password`, data);
};

/**
 * Confirm email address via token link
 */
export const confirmEmail = async (
  data: ConfirmEmailRequest
): Promise<void> => {
  await api.get(`${AUTH_BASE_URL}/confirm-email`, { params: data });
};

/**
 * Resend email confirmation link
 */
export const resendConfirmation = async (
  data: ForgotPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/resend-confirmation`, data);
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<UserInfoResponse> => {
  const response = await api.get<ApiResponse<UserInfoResponse>>(
    `${AUTH_BASE_URL}/me`
  );
  return response.data.data;
};
