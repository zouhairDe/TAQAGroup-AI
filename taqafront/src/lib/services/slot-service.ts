import { api, ApiResponse } from '../api';
import { AuthService } from '../auth';

// Match the backend schema exactly
export interface Slot {
  id: string;
  code: string;
  title: string;
  description?: string;
  anomalyId: string;
  estimatedDuration?: number;
  actualDuration?: number;
  status: string;
  priority: string;
  createdById: string;
  assignedTeamId?: string;
  assignedToId?: string;
  windowType: 'planned' | 'emergency' | 'opportunistic';
  downtime: boolean;
  safetyPrecautions: string[];
  resourcesNeeded: string[];
  estimatedCost?: number;
  actualCost?: number;
  productionImpact: boolean;
  notes?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  maintenancePeriodId?: string;
  anomaly?: {
    id: string;
    code: string;
    title: string;
    severity: string;
    priority: string;
    equipment?: {
      id: string;
      name: string;
      code: string;
    };
  };
  assignedTeam?: {
    id: string;
    name: string;
    code: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  maintenancePeriod?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
}

export interface SlotResponse {
  success: boolean;
  data: Slot[];
  total: number;
}

export class SlotService {
  /**
   * Get all slots
   */
  static async getSlots(params?: {
    status?: string;
    priority?: string;
    windowType?: string;
    maintenancePeriodId?: string;
    assignedTeamId?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SlotResponse> {
    try {
      // Check authentication first
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching slots with params:', params);
      const response = await api.get<Slot[]>('/slots', params);
      console.log('Slots response:', response);
      
      return {
        success: true,
        data: response.data || [],
        total: response.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching slots:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Get slot by ID
   */
  static async getSlotById(id: string): Promise<ApiResponse<Slot>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log(`Fetching slot with ID: ${id}`);
      const response = await api.get<Slot>(`/slots/${id}`);
      console.log('Slot response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching slot:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Create a new slot
   */
  static async createSlot(slotData: {
    title: string;
    description?: string;
    anomalyId: string;  // Required
    estimatedDuration?: number;
    priority: string;
    windowType: 'planned' | 'emergency' | 'opportunistic';
    maintenancePeriodId?: string;  // Optional
    scheduledAt?: string;
    assignedTeamId?: string;
    assignedToId?: string;
    downtime?: boolean;
    safetyPrecautions?: string[];
    resourcesNeeded?: string[];
    estimatedCost?: number;
    productionImpact?: boolean;
    notes?: string;
  }): Promise<ApiResponse<Slot>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('Creating slot with data:', slotData);
      const response = await api.post<Slot>('/slots', slotData);
      console.log('Create slot response:', response);
      return response;
    } catch (error) {
      console.error('Error creating slot:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Update slot
   */
  static async updateSlot(
    id: string, 
    updateData: Partial<Slot>
  ): Promise<ApiResponse<Slot>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log(`Updating slot ${id} with data:`, updateData);
      const response = await api.put<Slot>(`/slots/${id}`, updateData);
      console.log('Update slot response:', response);
      return response;
    } catch (error) {
      console.error('Error updating slot:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Delete slot
   */
  static async deleteSlot(id: string): Promise<ApiResponse<void>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log(`Deleting slot with ID: ${id}`);
      const response = await api.delete<void>(`/slots/${id}`);
      console.log('Delete slot response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting slot:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Get slots by anomaly ID
   */
  static async getSlotsByAnomaly(anomalyId: string): Promise<ApiResponse<Slot[]>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      return await api.get<Slot[]>(`/slots/anomaly/${anomalyId}`);
    } catch (error) {
      console.error('Error fetching anomaly slots:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Get slots by maintenance period ID
   */
  static async getSlotsByMaintenancePeriod(periodId: string): Promise<ApiResponse<Slot[]>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      return await api.get<Slot[]>(`/slots/maintenance-period/${periodId}`);
    } catch (error) {
      console.error('Error fetching maintenance period slots:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Get slots by team ID
   */
  static async getSlotsByTeam(teamId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Slot[]>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      return await api.get<Slot[]>(`/slots/team/${teamId}`, params);
    } catch (error) {
      console.error('Error fetching team slots:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }

  /**
   * Get slots by assigned user ID
   */
  static async getSlotsByUser(userId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Slot[]>> {
    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      return await api.get<Slot[]>(`/slots/assigned/${userId}`, params);
    } catch (error) {
      console.error('Error fetching user slots:', error);
      if (error instanceof Error && error.message === 'User not authenticated') {
        AuthService.forceLogout();
      }
      throw error;
    }
  }
} 