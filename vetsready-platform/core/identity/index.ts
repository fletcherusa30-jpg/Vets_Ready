/**
 * Authentication & Identity Service
 * Interfaces for authentication, authorization, and identity management
 * Future support for SSO and multiple auth providers
 */

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  veteranId?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export enum UserRole {
  VETERAN = 'veteran',
  CAREGIVER = 'caregiver',
  REPRESENTATIVE = 'representative',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum Permission {
  // Veteran permissions
  READ_OWN_PROFILE = 'read_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  READ_OWN_BENEFITS = 'read_own_benefits',

  // Caregiver permissions
  READ_VETERAN_PROFILE = 'read_veteran_profile',

  // Representative permissions
  ACCESS_CLAIMS = 'access_claims',
  MANAGE_CLAIMS = 'manage_claims',

  // Admin permissions
  ADMIN_READ_ALL = 'admin_read_all',
  ADMIN_WRITE_ALL = 'admin_write_all',
  MANAGE_USERS = 'manage_users',
  MANAGE_RULES = 'manage_rules',
  VIEW_ANALYTICS = 'view_analytics'
}

export interface IAuthService {
  /**
   * Authenticate user with credentials
   */
  login(credentials: AuthCredentials): Promise<AuthToken>;

  /**
   * Logout user and invalidate tokens
   */
  logout(token: string): Promise<void>;

  /**
   * Validate and verify token
   */
  validateToken(token: string): Promise<boolean>;

  /**
   * Refresh expired access token
   */
  refreshToken(refreshToken: string): Promise<AuthToken>;

  /**
   * Register new user account
   */
  register(email: string, password: string): Promise<User>;

  /**
   * Reset user password
   */
  resetPassword(email: string): Promise<void>;
}

export interface IAuthorizationService {
  /**
   * Check if user has specific permission
   */
  hasPermission(userId: string, permission: Permission): Promise<boolean>;

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean>;

  /**
   * Check if user has all of the permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean>;

  /**
   * Grant permission to user
   */
  grantPermission(userId: string, permission: Permission): Promise<void>;

  /**
   * Revoke permission from user
   */
  revokePermission(userId: string, permission: Permission): Promise<void>;
}

export interface IIdentityService extends IAuthService, IAuthorizationService {
  /**
   * Get current user info
   */
  getCurrentUser(token: string): Promise<User>;

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, data: Partial<User>): Promise<User>;
}
