/**
 * Authentication Types
 * Type definitions for the AURA authentication system
 */

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
  recaptchaToken?: string;
}

export interface GoogleLoginRequest {
  credential: string;
  deviceInfo?: string;
}

export interface RegisterPatientRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  address?: string;
  dateOfBirth?: string;
  gender?: number;
}

export interface RegisterOphthalmologistRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
  bio?: string;
  yearsOfExperience: number;
  organizationId?: string;
  licenseImage?: File;
  degreeImage?: File;
}

export interface VerifyTwoFactorRequest {
  userId: string;
  code: string;
  useRecoveryCode?: boolean;
  deviceInfo?: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  token: string;
}

export interface UserInfoResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: string[];
  emailConfirmed: boolean;
  organizationId?: string;
  roleId?: string | null;
  twoFactorEnabled: boolean;
  isVerified?: boolean | null;
  verificationStatus?: string | null;
}

export interface AuthResponse {
  succeeded: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: UserInfoResponse;
  errors?: string[];
}

export interface TwoFactorRequiredResponse {
  requiresTwoFactor: boolean;
  userId: string;
  message: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  recoveryCodesRemaining: number;
  hasAuthenticator: boolean;
}

export interface TwoFactorSetupResponse {
  sharedKey: string;
  authenticatorUri: string;
  formattedKey: string;
}

export interface EnableTwoFactorRequest {
  verificationCode: string;
}

export interface EnableTwoFactorResponse {
  succeeded: boolean;
  recoveryCodes: string[];
}

export interface DisableTwoFactorRequest {
  password: string;
}

export interface GenerateRecoveryCodesRequest {
  password: string;
}

export interface RecoveryCodesResponse {
  succeeded: boolean;
  recoveryCodes: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}
export { default as ConfirmEmailPage } from '../pages/confirm-email';
export { default as RegisterDoctorPage } from '../pages/register-doctor';
export interface TwoFactorVerifyFormData {
  code: string;
}

export interface TwoFactorDisableFormData {
  password: string;
}

// ==================== UI State Types ====================

export type AuthMode = 'login' | 'register';

export type TwoFactorStep =
  | 'status'
  | 'setup'
  | 'verify'
  | 'recovery-codes'
  | 'disable';

export interface TwoFactorState {
  step: TwoFactorStep;
  isLoading: boolean;
  error: string | null;
  status: TwoFactorStatusResponse | null;
  setupData: TwoFactorSetupResponse | null;
  recoveryCodes: string[];
}
