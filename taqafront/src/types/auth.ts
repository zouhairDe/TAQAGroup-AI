export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isFirstLogin: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy?: string; // Manager who created the account
  isActive: boolean;
}

export type UserRole = "admin" | "manager" | "technician";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ChangePasswordFormData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequestData {
  email: string;
  reason: string;
  requestedBy: string; // Requester details
}

export interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  temporaryPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  requiresPasswordChange: boolean;
  message?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  requestId?: string;
  managerToApprove?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
} 