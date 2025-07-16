import { api, ApiResponse } from '../api';
import { AuthService } from '../auth';
import { Anomaly } from '@/types/database-types';

// Types for the API responses
interface AnomalyStats {
  totalAnomalies: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  siteDistribution: Record<string, number>;
  recentAnomalies: Anomaly[];
}

interface CreateAnomalyDto {
  title: string;
  description: string;
  priority?: 'critical' | 'medium' | 'low';
  severity?: 'critical' | 'medium' | 'low';
  equipment?: string;
  location?: string;
  estimatedRepairTime?: number;
  requiredSkills?: string[];
  // Add availability factors
  disponibilite?: number;
  fiabilite?: number;
  processSafety?: number;
  // Add other form fields
  category?: string;
  equipmentId?: string;
  reportedById?: string;
  reportedAt?: string;
  sectionProprietaire?: string;
  estimatedTimeToResolve?: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface AnomalyResponse {
  success: boolean;
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: {
    totalAnomalies: number;
    statusDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    siteDistribution: Record<string, number>;
    recentAnomalies: any[];
  };
}

// Get API base URL from environment or fallback
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://10.30.249.128:3333/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface AnomalyFilters {
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved';
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AnomalyService {
  private static readonly BASE_PATH = '/anomalies';

  static async getAllAnomalies(): Promise<Anomaly[]> {
    const response = await api.get<Anomaly[]>(this.BASE_PATH);
    return response.data;
  }

  static async getAnomalyById(id: string): Promise<Anomaly> {
    try {
      const response = await api.get<Anomaly>(`${this.BASE_PATH}/${id}`);
      if (!response.data) {
        throw new Error('Anomalie non trouvée');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching anomaly:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'anomalie');
    }
  }

  static async getAnomalyStats(): Promise<AnomalyStats> {
    const response = await api.get<AnomalyStats>(`${this.BASE_PATH}/stats/overview`);
    return response.data;
  }

  static async createAnomaly(data: CreateAnomalyDto): Promise<Anomaly> {
    const response = await api.post<Anomaly>(this.BASE_PATH, data);
    return response.data;
  }

  static async getAIPrediction(data: { description: string; equipmentId: string }): Promise<{
    disponibilite: number;
    fiabilite: number;
    processSafety: number;
    criticite: string;
    severity: string;
    priority: string;
    aiConfidence: number;
    aiFactors: string[];
    aiSuggestedSeverity: string;
  }> {
    const response = await api.post<{
      disponibilite: number;
      fiabilite: number;
      processSafety: number;
      criticite: string;
      severity: string;
      priority: string;
      aiConfidence: number;
      aiFactors: string[];
      aiSuggestedSeverity: string;
    }>(`${this.BASE_PATH}/ai-prediction`, data);
    return response.data;
  }

  static async createComment(anomalyId: string, content: string): Promise<Comment> {
    // Get current user to include authorId in request
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const response = await api.post<Comment>(`${this.BASE_PATH}/${anomalyId}/comments`, { 
      content, 
      authorId: currentUser.id 
    });
    return response.data;
  }

  static async uploadFiles(anomalyId: string, files: File[]): Promise<Attachment[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.uploadFile<Attachment[]>(`${this.BASE_PATH}/${anomalyId}/attachments`, formData);
    return response.data;
  }
  static async uploadFile(file: File): Promise<{ successCount: number; totalRows: number }> {
    const formData = new FormData();
    formData.append('csvFile', file);
    const response = await api.uploadFile<{ successCount: number; totalRows: number }>(
      `${this.BASE_PATH}/import/csv`,
      formData
    );
    return response.data;
  }

  // Legacy method for backward compatibility
  static async uploadCsvFile(file: File): Promise<{ successCount: number; totalRows: number }> {
    return this.uploadFile(file);
  }

  static async updateAnomaly(
    anomalyId: string, 
    update: Partial<Omit<Anomaly, 'id' | 'code' | 'createdAt' | 'updatedAt'>>
  ): Promise<Anomaly> {
    const response = await api.put<Anomaly>(`${this.BASE_PATH}/${anomalyId}`, update);
    return response.data;
  }

  static transformPriorityToBackend(priority: string): 'critical' | 'medium' | 'low' {
    switch (priority.toLowerCase()) {
      case 'p1':
        return 'critical';
      case 'p2':
        return 'medium';
      case 'p3':
        return 'low';
      default:
        return 'medium';
    }
  }

  static transformStatusToBackend(status: string): 'in_progress' | 'resolved' | 'closed' | 'new' {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'in_progress';
      case 'resolved':
        return 'resolved';
      case 'closed':
        return 'closed';
      default:
        return 'new';
    }
  }

  static transformPriorityToFrontend(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'P1';
      case 'medium':
        return 'P2';
      case 'low':
        return 'P3';
      default:
        return 'P2';
    }
  }

  static transformStatusToFrontend(status: string): string {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      case 'closed':
        return 'Fermé';
      default:
        return 'Nouveau';
    }
  }

  static async getAnomalies(filters?: AnomalyFilters): Promise<ApiResponse<Anomaly[]>> {
    const params = filters ? { ...filters } : {};
    return api.get<Anomaly[]>('/anomalies', params);
  }

  static async getCriticalAnomalies(): Promise<ApiResponse<Anomaly[]>> {
    return this.getAnomalies({
      severity: 'critical',
      status: 'open',
      limit: 10,
      sortBy: 'reportedAt',
      sortOrder: 'desc'
    });
  }

  static async deleteAnomaly(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
} 