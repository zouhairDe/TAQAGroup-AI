import { api } from '../api';
import { AnomalyAction } from '@/types/database-types';

export interface GetActionsParams {
  type?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  teamId?: string;
}

export interface CreateAnomalyActionDto {
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  teamId?: string;
  status?: string;
  priority?: string;
  severity?: string;
  category?: string;
  impact?: Record<string, any>;
  maintenanceData?: Record<string, any>;
  attachments?: string[];
  isAutomated?: boolean;
  aiConfidence?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface ActionsResponse {
  actions: AnomalyAction[];
  total: number;
}

export class AnomalyActionService {
  static async getActions(anomalyId: string, params?: GetActionsParams): Promise<ActionsResponse> {
    try {
      const response = await api.get<ApiResponse<AnomalyAction[]>>(
        `/anomalies/${anomalyId}/actions`
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch actions');
      }

      return {
        actions: response.data || [],
        total: response.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching anomaly actions:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch actions: ${error.message}`);
      }
      throw new Error('Failed to fetch actions: An unexpected error occurred');
    }
  }

  static async createAction(
    anomalyId: string,
    actionData: CreateAnomalyActionDto
  ): Promise<AnomalyAction> {
    try {
      const response = await api.post<ApiResponse<AnomalyAction>>(
        `/anomalies/${anomalyId}/actions`,
        actionData
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to create action');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating anomaly action:', error);
      throw error;
    }
  }

  static async uploadActionAttachment(
    anomalyId: string,
    actionId: string,
    file: File
  ): Promise<{ attachmentId: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.uploadFile<ApiResponse<{ attachmentId: string }>>(
        `/anomalies/${anomalyId}/actions/${actionId}/attachments`,
        formData
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to upload attachment');
      }

      return response.data;
    } catch (error) {
      console.error('Error uploading action attachment:', error);
      throw error;
    }
  }
} 