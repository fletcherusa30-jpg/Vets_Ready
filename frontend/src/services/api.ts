/**
 * API Client Service for VetsReady Platform
 * Centralized HTTP client with TypeScript types
 * Phase 3 - Frontend Development
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Veteran,
  VeteranCreateRequest,
  VeteranUpdateRequest,
  Resume,
  ResumeGenerateRequest,
  JobListing,
  JobMatch,
  JobApplicationRequest,
  Budget,
  HealthStatus,
  PlatformStats,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  RetirementProjectionRequest,
  RetirementProjectionResponse,
  BackgroundInventoryResponse,
  BackgroundSelectionRequest,
  BackgroundSelectionResponse,
  BackgroundUploadResponse,
  RetirementBudgetRequest,
  RetirementBudgetResponse,
  DisabilityWizardResponse,
  DisabilityWizardRequest
} from '../types/models';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (error handling)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Veteran API
  async getAllVeterans(skip = 0, limit = 100): Promise<PaginatedResponse<Veteran>> {
    const { data } = await this.client.get<PaginatedResponse<Veteran>>('/api/veterans', {
      params: { skip, limit },
    });
    return data;
  }

  async getVeteran(veteranId: string): Promise<Veteran> {
    const { data } = await this.client.get<Veteran>(`/api/veterans/${veteranId}`);
    return data;
  }

  async createVeteran(veteranData: VeteranCreateRequest): Promise<ApiResponse<Veteran>> {
    const { data } = await this.client.post<ApiResponse<Veteran>>('/api/veterans', veteranData);
    return data;
  }

  async updateVeteran(veteranId: string, updateData: VeteranUpdateRequest): Promise<ApiResponse<Veteran>> {
    const { data} = await this.client.put<ApiResponse<Veteran>>(`/api/veterans/${veteranId}`, updateData);
    return data;
  }

  async deleteVeteran(veteranId: string): Promise<void> {
    await this.client.delete(`/api/veterans/${veteranId}`);
  }

  // Resume API
  async generateResume(resumeData: ResumeGenerateRequest): Promise<ApiResponse<Resume>> {
    const { data } = await this.client.post<ApiResponse<Resume>>('/resume/generate', resumeData);
    return data;
  }

  async getVeteranResumes(veteranId: string): Promise<{ veteran_id: string; count: number; resumes: Resume[] }> {
    const { data } = await this.client.get(`/api/resumes/${veteranId}`);
    return data;
  }

  async getLatestResume(veteranId: string): Promise<Resume> {
    const { data } = await this.client.get<Resume>(`/api/resumes/${veteranId}/latest`);
    return data;
  }

  // Job API
  async getActiveJobs(skip = 0, limit = 50): Promise<{ count: number; jobs: JobListing[] }> {
    const { data } = await this.client.get('/api/jobs/active', {
      params: { skip, limit },
    });
    return data;
  }

  async createJobMatch(matchData: JobApplicationRequest): Promise<ApiResponse<JobMatch>> {
    const { data } = await this.client.post<ApiResponse<JobMatch>>('/api/matches', matchData);
    return data;
  }

  // Budget API
  async getCurrentBudget(veteranId: string): Promise<Budget> {
    const { data } = await this.client.get<Budget>(`/api/budgets/${veteranId}/current`);
    return data;
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.client.post<LoginResponse>('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Health API
  async getHealth(): Promise<HealthStatus> {
    const { data } = await this.client.get<HealthStatus>('/api/health');
    return data;
  }

  async getStats(): Promise<PlatformStats> {
    const { data } = await this.client.get<PlatformStats>('/api/stats');
    return data;
  }

  async projectRetirement(
    veteranId: string,
    payload: RetirementProjectionRequest
  ): Promise<RetirementProjectionResponse> {
    const { data } = await this.client.post<RetirementProjectionResponse>(
      `/api/retirement/project/${veteranId}`,
      payload
    );
    return data;
  }

  async planRetirementBudget(
    veteranId: string,
    payload: RetirementBudgetRequest
  ): Promise<RetirementBudgetResponse> {
    const { data } = await this.client.post<RetirementBudgetResponse>(
      `/api/retirement/budget/${veteranId}`,
      payload
    );
    return data;
  }

  async getBackgroundInventory(veteranId: string): Promise<BackgroundInventoryResponse> {
    const { data } = await this.client.get<BackgroundInventoryResponse>('/profile/background', {
      params: { veteran_id: veteranId },
    });
    return data;
  }

  async selectBackground(payload: BackgroundSelectionRequest): Promise<BackgroundSelectionResponse> {
    const { data } = await this.client.post<BackgroundSelectionResponse>('/profile/background', payload);
    return data;
  }

  async uploadBackground(veteranId: string, file: File): Promise<BackgroundUploadResponse> {
    const formData = new FormData();
    formData.append('veteran_id', veteranId);
    formData.append('file', file);

    const { data } = await this.client.post<BackgroundUploadResponse>('/profile/background/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  }

  async getDisabilityWizard(veteranId: string): Promise<DisabilityWizardResponse> {
    const { data } = await this.client.get<DisabilityWizardResponse>(`/api/disability/wizard/${veteranId}`);
    return data;
  }

  async runDisabilityWizard(payload: DisabilityWizardRequest): Promise<DisabilityWizardResponse> {
    const { data } = await this.client.post<DisabilityWizardResponse>('/api/disability/wizard', payload);
    return data;
  }

  // Upload API
  async upload(endpoint: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await this.client.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Upload failed' };
    }
  }

  // Scanner upload API
  async scannerUpload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await this.client.post('/api/scanner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Scanner upload failed' };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual API modules for convenience
export const veteranAPI = {
  getAll: (skip = 0, limit = 100) => apiClient.getAllVeterans(skip, limit),
  getById: (id: string) => apiClient.getVeteran(id),
  create: (data: VeteranCreateRequest) => apiClient.createVeteran(data),
  update: (id: string, data: VeteranUpdateRequest) => apiClient.updateVeteran(id, data),
  delete: (id: string) => apiClient.deleteVeteran(id),
};

export const retirementAPI = {
  project: (veteranId: string, payload: RetirementProjectionRequest) =>
    apiClient.projectRetirement(veteranId, payload),
  planBudget: (veteranId: string, payload: RetirementBudgetRequest) =>
    apiClient.planRetirementBudget(veteranId, payload),
};

export const resumeAPI = {
  generate: (data: ResumeGenerateRequest) => apiClient.generateResume(data),
  getAll: (veteranId: string) => apiClient.getVeteranResumes(veteranId),
  getLatest: (veteranId: string) => apiClient.getLatestResume(veteranId),
};

export const jobAPI = {
  getActive: (skip = 0, limit = 50) => apiClient.getActiveJobs(skip, limit),
  apply: (data: JobApplicationRequest) => apiClient.createJobMatch(data),
};

export const budgetAPI = {
  getCurrent: (veteranId: string) => apiClient.getCurrentBudget(veteranId),
};

export const profileAPI = {
  getBackgrounds: (veteranId: string) => apiClient.getBackgroundInventory(veteranId),
  selectBackground: (payload: BackgroundSelectionRequest) => apiClient.selectBackground(payload),
  uploadBackground: (veteranId: string, file: File) => apiClient.uploadBackground(veteranId, file),
};

export const disabilityAPI = {
  getWizard: (veteranId: string) => apiClient.getDisabilityWizard(veteranId),
  runWizard: (payload: DisabilityWizardRequest) => apiClient.runDisabilityWizard(payload),
};

export const authAPI = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
};

export const healthAPI = {
  check: () => apiClient.getHealth(),
  stats: () => apiClient.getStats(),
};

// Export as 'api' for backwards compatibility
export const api = apiClient;

export default apiClient;
