/**
 * Claims API Service
 */

import api from '../../lib/api';

export interface Condition {
  name: string;
  rating: number;
  description?: string;
}

export interface ClaimAnalysisRequest {
  conditions: Condition[];
  service_connected: boolean;
  evidence_description?: string;
}

export interface ClaimAnalysisResponse {
  combined_rating: number;
  monthly_payment: number;
  annual_payment: number;
  individual_ratings: Condition[];
  recommendations: string[];
  next_steps: string[];
}

export interface Claim {
  id: string;
  user_id: string;
  combined_rating: number;
  monthly_payment: number;
  status: string;
  conditions: Condition[];
  created_at: string;
  updated_at: string;
}

class ClaimsService {
  /**
   * Analyze a disability claim
   */
  async analyzeClaim(data: ClaimAnalysisRequest): Promise<ClaimAnalysisResponse> {
    const response = await api.post<ClaimAnalysisResponse>('/api/claims/analyze', data);
    return response.data;
  }

  /**
   * Get all claims for current user
   */
  async getMyClaims(): Promise<Claim[]> {
    const response = await api.get<Claim[]>('/api/claims/my-claims');
    return response.data;
  }

  /**
   * Get claim by ID
   */
  async getClaim(claimId: string): Promise<Claim> {
    const response = await api.get<Claim>(`/api/claims/${claimId}`);
    return response.data;
  }

  /**
   * Delete claim
   */
  async deleteClaim(claimId: string): Promise<void> {
    await api.delete(`/api/claims/${claimId}`);
  }
}

export const claimsService = new ClaimsService();
export default claimsService;
