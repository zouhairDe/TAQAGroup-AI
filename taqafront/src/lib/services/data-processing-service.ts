import { api } from '../api';

export interface DataProcessingLog {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  operation: string;
  progress?: number;
  message?: string;
  error?: string;
}

export interface DataProcessingResponse {
  success: boolean;
  data: DataProcessingLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: Record<string, any>;
}

export interface DataProcessingService {
  getProcessingLogs(params?: {
    status?: 'running' | 'completed' | 'failed' | 'pending';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<DataProcessingResponse>;
  
  isSystemProcessing(): Promise<boolean>;
  
  getRunningProcesses(): Promise<DataProcessingLog[]>;
}

class DataProcessingServiceImpl implements DataProcessingService {
  private readonly baseUrl = '/data-processing';

  async getProcessingLogs(params: {
    status?: 'running' | 'completed' | 'failed' | 'pending';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<DataProcessingResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await api.get<DataProcessingResponse>(`${this.baseUrl}/logs?${searchParams.toString()}`);
    return response.data;
  }

  async isSystemProcessing(): Promise<boolean> {
    try {
      const response = await this.getProcessingLogs({ 
        status: 'running', 
        page: 1, 
        limit: 1 
      });
      // The response structure is { success: true, data: [...], pagination: {...} }
      // So we need to access response.data (which is the array of logs)
      return response.data && response.data.length > 0;
    } catch (error) {
      console.error('Error checking system processing status:', error);
      return false;
    }
  }

  async getRunningProcesses(): Promise<DataProcessingLog[]> {
    try {
      const response = await this.getProcessingLogs({ 
        status: 'running', 
        page: 1, 
        limit: 20,
        sortBy: 'startTime',
        sortOrder: 'desc'
      });
      // Return the actual data array from the response
      return response.data || [];
    } catch (error) {
      console.error('Error fetching running processes:', error);
      return [];
    }
  }
}

export const dataProcessingService = new DataProcessingServiceImpl(); 