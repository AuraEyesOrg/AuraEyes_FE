/**
 * Two-Factor Authentication Types
 * Type definitions for the AURA 2FA system
 */

// API Response Types
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

export interface EnableTwoFactorResponse {
  succeeded: boolean;
  recoveryCodes: string[];
}

export interface RecoveryCodesResponse {
  succeeded: boolean;
  recoveryCodes: string[];
}

// API Request Types
export interface EnableTwoFactorRequest {
  verificationCode: string;
}

export interface DisableTwoFactorRequest {
  password: string;
}

export interface GenerateRecoveryCodesRequest {
  password: string;
}

export interface VerifyTwoFactorRequest {
  code: string;
  useRecoveryCode?: boolean;
}

// Form Data Types
export interface TwoFactorVerifyFormData {
  code: string;
}

export interface TwoFactorDisableFormData {
  password: string;
}

// UI State Types
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
