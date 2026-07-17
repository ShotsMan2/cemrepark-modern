import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(message: string, error?: any, status: number = 500) {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error }),
  };
  return NextResponse.json(response, { status });
}
