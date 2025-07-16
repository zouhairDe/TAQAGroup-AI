import { api, type ApiResponse } from '../api';
import { AuthService } from '../auth';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string | null;
  site: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    try {
      // First check if we have a token
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await api.get<UserProfile>('/users/profile');
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch profile');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If unauthorized, clear auth data and throw
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('Not authenticated')
      )) {
        AuthService.forceLogout();
      }
      throw error;
    }
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // First check if we have a token
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await api.put<UserProfile>('/users/profile', data);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update profile');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      // If unauthorized, clear auth data and throw
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('Not authenticated')
      )) {
        AuthService.forceLogout();
      }
      throw error;
    }
  },

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      // First check if we have a token
      const token = AuthService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await api.post<void>('/auth/change-password', data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      // If unauthorized, clear auth data and throw
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('Not authenticated')
      )) {
        AuthService.forceLogout();
      }
      throw error;
    }
  }
}; 