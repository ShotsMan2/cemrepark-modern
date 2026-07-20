import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: unknown;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  categoryId?: number;
}

export interface RequestWithUser extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string | null;
  };
}

export interface AuthenticatedRequest extends NextRequest {
  session: Session;
}
