import { api, ApiResponse } from '../api';

export interface RexEntry {
  id: string;
  code: string;
  title: string;
  description: string;
  building?: string;
  equipment?: string;
  summary?: string;
  effectiveness?: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  site: string;
  zone?: string;
  knowledgeValue: string;
  rating?: number;
  views: number;
  comments: Array<{
    id: string;
    author: string;
    role?: string;
    content: string;
    timestamp: string;
    helpful: number;
  }>;
  bookmarks: number;
  tags: string[];
  rootCause: string;
  solution: string;
  equipmentType?: string;
  timeToResolve?: string;
  reusabilityScore?: number;
  lessonsLearned: string;
  costImpact?: string;
  downtimeHours?: number;
  safetyImpact: boolean;
  environmentalImpact: boolean;
  productionImpact: boolean;
  impactLevel?: string;
  preventiveActions: string[];
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  anomalyId?: string;
}

export interface CreateRexEntryInput {
  title: string;
  anomalyId?: string;
  equipmentId?: string;
  equipmentType?: string;
  category: string;
  subcategory?: string;
  site: string;
  zone?: string;
  building?: string;
  status: string;
  priority: string;
  rootCause: string;
  lessonsLearned: string;
  preventiveActions: string[];
  solution: string;
  timeToResolve?: string;
  costImpact?: string;
  downtimeHours?: number;
  safetyImpact: boolean;
  environmentalImpact: boolean;
  productionImpact: boolean;
  impactLevel?: string;
  tags: string[];
  knowledgeValue: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
}

export interface UpdateRexEntryInput extends Partial<CreateRexEntryInput> {
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export interface RexEntryQueryParams {
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  building?: string;
  equipment?: string;
  createdById?: string;
  approvedById?: string;
  page?: number;
  limit?: number;
}

export interface RexEntryListResponse {
  data: RexEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const rexService = {
  /**
   * Create a new REX entry
   */
  async createRexEntry(input: CreateRexEntryInput): Promise<RexEntry> {
    const response = await api.post<RexEntry>('/rex', input);
    if (!response.success) {
      throw new Error('Failed to create REX entry');
    }
    return response.data;
  },

  /**
   * Update an existing REX entry
   */
  async updateRexEntry(id: string, input: UpdateRexEntryInput): Promise<RexEntry> {
    const response = await api.put<RexEntry>(`/rex/${id}`, input);
    if (!response.success) {
      throw new Error('Failed to update REX entry');
    }
    return response.data;
  },

  /**
   * Delete a REX entry
   */
  async deleteRexEntry(id: string): Promise<void> {
    await api.delete(`/rex/${id}`);
  },

  /**
   * Get a single REX entry by ID
   */
  async getRexEntry(id: string): Promise<RexEntry> {
    const response = await api.get<RexEntry>(`/rex/${id}`);
    if (!response.success) {
      throw new Error('REX entry not found');
    }
    return response.data;
  },

  /**
   * List REX entries with optional filtering
   */
  async listRexEntries(params?: RexEntryQueryParams): Promise<RexEntryListResponse> {
    const response = await api.get<RexEntry[]>('/rex', params);
    if (!response.success || !response.meta) {
      throw new Error('Failed to list REX entries');
    }
    return {
      data: response.data,
      pagination: {
        total: response.meta.total || 0,
        page: response.meta.page || 1,
        limit: response.meta.limit || 10,
        totalPages: Math.ceil((response.meta.total || 0) / (response.meta.limit || 10))
      }
    };
  },

  /**
   * Approve a REX entry
   */
  async approveRexEntry(id: string): Promise<RexEntry> {
    const response = await api.post<RexEntry>(`/rex/${id}/approve`);
    if (!response.success) {
      throw new Error('Failed to approve REX entry');
    }
    return response.data;
  },

  /**
   * Reject a REX entry
   */
  async rejectRexEntry(id: string, rejectionReason: string): Promise<RexEntry> {
    const response = await api.post<RexEntry>(`/rex/${id}/reject`, { rejectionReason });
    if (!response.success) {
      throw new Error('Failed to reject REX entry');
    }
    return response.data;
  }
}; 