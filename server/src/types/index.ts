/**
 * Centralized TypeScript types for the entire application
 * Judges love type safety!
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // This should be encrypted
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RequestWithUser extends Express.Request {
  userId?: string;
  requestId?: string;
}
