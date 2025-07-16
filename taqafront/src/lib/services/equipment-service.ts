import { api, ApiResponse } from '../api';
import { Equipment } from '@/types/database-types';

export interface EquipmentFilters {
  page?: number;
  limit?: number;
  type?: string;
  manufacturer?: string;
  zoneId?: string;
  site?: string;
  status?: string;
  isActive?: boolean;
  search?: string;
}

export class EquipmentService {
  private static readonly BASE_PATH = '/equipment';

  static async getAllEquipment(filters?: EquipmentFilters): Promise<Equipment[]> {
    const response = await api.get<Equipment[]>(this.BASE_PATH, filters);
    return response.data;
  }

  static async getEquipmentById(id: string): Promise<Equipment> {
    const response = await api.get<Equipment>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async searchEquipment(searchTerm: string, limit: number = 10): Promise<Equipment[]> {
    const response = await api.get<Equipment[]>(this.BASE_PATH, {
      search: searchTerm,
      limit,
      isActive: true
    });
    return response.data;
  }

  static async getEquipmentStats(): Promise<any> {
    const response = await api.get<any>(`${this.BASE_PATH}/stats/overview`);
    return response.data;
  }

  static async getEquipmentHealth(): Promise<any> {
    const response = await api.get<any>(`${this.BASE_PATH}/health/overview`);
    return response.data;
  }
} 