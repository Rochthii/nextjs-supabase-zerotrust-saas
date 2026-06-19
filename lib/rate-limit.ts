import rateLimit from 'next-rate-limit';
import { NextRequest } from 'next/server';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique tokens per interval
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit middleware for API routes
 * @param requests - Number of requests allowed per minute
 * @param request - NextRequest object
 */
export async function checkRateLimit(
  requests: number,
  request: NextRequest
): Promise<RateLimitResult> {
  try {
    const headers = limiter.checkNext(request, requests);
    
    const limit = parseInt(headers.get('X-RateLimit-Limit') || String(requests));
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '0');
    const reset = parseInt(headers.get('X-RateLimit-Reset') || String(Date.now() + 60000));
    
    if (remaining <= 0) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }

    return {
      success: true,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    // Rate limit exceeded or error
    return {
      success: false,
      limit: requests,
      remaining: 0,
      reset: Date.now() + 60 * 1000, // Reset in 1 minute
    };
  }
}


