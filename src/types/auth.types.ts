/**
 * Authentication Types
 * Type definitions for the AURA authentication system
 */

export type AuthMode = 'login' | 'register';

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

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'Patient'
  | 'Ophthalmologist'
  | 'ClinicStaff'
  | 'SystemAdmin';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isLongEnough: boolean;
}

export interface SSOConfig {
  provider: 'google' | 'microsoft' | 'apple' | 'institutional';
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// Form validation types
export interface FormFieldError {
  type: string;
  message: string;
}

export type FormErrors<T> = {
  [K in keyof T]?: FormFieldError;
};

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data?: AuthResponse;
  error?: AuthError;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    user: User;
    message: string;
  };
  error?: AuthError;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// OAuth/SSO types
export interface SSOAuthRequest {
  provider: string;
  code: string;
  state?: string;
}

export interface SSOAuthResponse {
  success: boolean;
  data?: AuthResponse;
  error?: AuthError;
}

// Token types
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}
