import { api as apiClient, ApiResponse } from '../api';

export interface MaintenancePeriod {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  durationHours: number;
  status: 'available' | 'booked' | 'pending';
  type: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  assignedTo?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePeriodsResponse extends ApiResponse<MaintenancePeriod[]> {
  data: MaintenancePeriod[]; // Override to make data required
}

export interface MaintenancePeriodResponse extends ApiResponse<MaintenancePeriod> {
  data: MaintenancePeriod; // Override to make data required
}

export interface ImportResponse extends ApiResponse<{
  created: MaintenancePeriod[];
  errors: Array<{
    index: number;
    data: any;
    error: string;
  }>;
  total: number;
  successful: number;
  failed: number;
}> {
  data: {
    created: MaintenancePeriod[];
    errors: Array<{
      index: number;
      data: any;
      error: string;
    }>;
    total: number;
    successful: number;
    failed: number;
  }; // Override to make data required
}

export const maintenancePeriodsService = {
  async getMaintenancePeriods(): Promise<MaintenancePeriodsResponse> {
    const response = await apiClient.get<MaintenancePeriod[]>('/maintenance/periods');
    return response as MaintenancePeriodsResponse;
  },

  async getMaintenancePeriodById(id: string): Promise<MaintenancePeriodResponse> {
    const response = await apiClient.get<MaintenancePeriod>(`/maintenance/periods/${id}`);
    return response as MaintenancePeriodResponse;
  },

  async createMaintenancePeriod(data: Partial<MaintenancePeriod>): Promise<MaintenancePeriodResponse> {
    const response = await apiClient.post<MaintenancePeriod>('/maintenance/periods', data);
    return response as MaintenancePeriodResponse;
  },

  async updateMaintenancePeriod(id: string, data: Partial<MaintenancePeriod>): Promise<MaintenancePeriodResponse> {
    const response = await apiClient.put<MaintenancePeriod>(`/maintenance/periods/${id}`, data);
    return response as MaintenancePeriodResponse;
  },

  async deleteMaintenancePeriod(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/maintenance/periods/${id}`);
    return response;
  },

  async importMaintenancePeriods(data: { periods: Partial<MaintenancePeriod>[] }): Promise<ImportResponse> {
    const response = await apiClient.post<{
      created: MaintenancePeriod[];
      errors: Array<{
        index: number;
        data: any;
        error: string;
      }>;
      total: number;
      successful: number;
      failed: number;
    }>('/maintenance/periods/import', data);
    return response as ImportResponse;
  }
}; 