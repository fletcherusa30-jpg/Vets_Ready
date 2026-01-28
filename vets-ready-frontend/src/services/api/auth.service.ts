/**
 * Authentication API Service
 */

import api, { setAuthToken, clearAuthToken } from '../../lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  military_branch?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    military_branch?: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  military_branch?: string;
  subscription_tier?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  /**
   * Login existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    clearAuthToken();
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Verify token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await api.get('/api/auth/verify');
      return true;
    } catch {
      clearAuthToken();
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
