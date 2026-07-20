import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(message: string, error?: unknown, status: number = 500) {
  // If the error is an instance of Error, we extract the message, otherwise we just pass the unknown error
  const parsedError = error instanceof Error ? error.message : error;
  
  const response: ApiResponse<never> = {
    success: false,
    message,
    ...(error !== undefined && { error: parsedError }),
  };
  return NextResponse.json(response, { status });
}
