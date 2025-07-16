import { api, ApiResponse } from '../api';
import { MaintenancePeriod } from '../../types/maintenance-actions';

/**
 * Maintenance Service
 * Handles all maintenance-related API operations
 */

export interface MaintenancePeriodsResponse {
  success: boolean;
  data: MaintenancePeriod[];
  total: number;
}

export class MaintenanceService {
  
  /**
   * Get all available maintenance periods
   */
  static async getMaintenancePeriods(): Promise<MaintenancePeriodsResponse> {
    try {
      console.log('Fetching maintenance periods...');
      
      const response = await api.get<MaintenancePeriod[]>('/maintenance/periods');
      
      console.log('Maintenance periods response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch maintenance periods');
      }
      
      return {
        success: true,
        data: response.data || [],
        total: response.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching maintenance periods:', error);
      throw error;
    }
  }

  /**
   * Get maintenance period by ID
   */
  static async getMaintenancePeriodById(id: string): Promise<ApiResponse<MaintenancePeriod>> {
    try {
      const response = await api.get<MaintenancePeriod>(`/maintenance/periods/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching maintenance period:', error);
      throw error;
    }
  }

  /**
   * Create a new maintenance period
   */
  static async createMaintenancePeriod(periodData: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    type: 'maintenance' | 'emergency';
    location?: string;
  }): Promise<ApiResponse<MaintenancePeriod>> {
    try {
      const response = await api.post<MaintenancePeriod>('/maintenance/periods', periodData);
      return response;
    } catch (error) {
      console.error('Error creating maintenance period:', error);
      throw error;
    }
  }

  /**
   * Update maintenance period
   */
  static async updateMaintenancePeriod(
    id: string, 
    updateData: Partial<MaintenancePeriod>
  ): Promise<ApiResponse<MaintenancePeriod>> {
    try {
      const response = await api.put<MaintenancePeriod>(`/maintenance/periods/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating maintenance period:', error);
      throw error;
    }
  }

  /**
   * Delete maintenance period
   */
  static async deleteMaintenancePeriod(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<void>(`/maintenance/periods/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting maintenance period:', error);
      throw error;
    }
  }
} 