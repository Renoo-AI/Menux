import { NextRequest, NextResponse } from 'next/server';

/**
 * Get client IP from request (Edge compatible)
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Create a banned response (Edge compatible)
 */
export function bannedResponse(reason: string, retryAfter?: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Access denied',
      message: 'Your access has been restricted. Please contact support if you believe this is an error.',
      reason: process.env.NODE_ENV === 'development' ? reason : undefined,
    },
    {
      status: 403,
      headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {},
    }
  );
}
