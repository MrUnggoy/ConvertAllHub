import time
from typing import Dict, Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import redis.asyncio as redis
import os
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Redis-based rate limiter for API endpoints"""
    
    def __init__(self):
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis = redis.from_url(redis_url, decode_responses=True)
        
        # Rate limit configurations
        self.limits = {
            'free_user': {
                'requests_per_minute': 10,
                'requests_per_hour': 100,
                'requests_per_day': 500
            },
            'pro_user': {
                'requests_per_minute': 60,
                'requests_per_hour': 1000,
                'requests_per_day': 10000
            },
            'anonymous': {
                'requests_per_minute': 5,
                'requests_per_hour': 50,
                'requests_per_day': 200
            }
        }
    
    async def check_rate_limit(
        self,
        identifier: str,
        user_tier: str = 'anonymous',
        endpoint: Optional[str] = None
    ) -> Dict[str, any]:
        """Check if request is within rate limits"""
        
        try:
            limits = self.limits.get(user_tier, self.limits['anonymous'])
            current_time = int(time.time())
            
            # Create keys for different time windows
            minute_key = f"rate_limit:{identifier}:minute:{current_time // 60}"
            hour_key = f"rate_limit:{identifier}:hour:{current_time // 3600}"
            day_key = f"rate_limit:{identifier}:day:{current_time // 86400}"
            
            # Get current counts
            pipe = self.redis.pipeline()
            pipe.get(minute_key)
            pipe.get(hour_key)
            pipe.get(day_key)
            results = await pipe.execute()
            
            minute_count = int(results[0] or 0)
            hour_count = int(results[1] or 0)
            day_count = int(results[2] or 0)
            
            # Check limits
            if minute_count >= limits['requests_per_minute']:
                return {
                    'allowed': False,
                    'limit_type': 'minute',
                    'limit': limits['requests_per_minute'],
                    'current': minute_count,
                    'reset_time': (current_time // 60 + 1) * 60
                }
            
            if hour_count >= limits['requests_per_hour']:
                return {
                    'allowed': False,
                    'limit_type': 'hour',
                    'limit': limits['requests_per_hour'],
                    'current': hour_count,
                    'reset_time': (current_time // 3600 + 1) * 3600
                }
            
            if day_count >= limits['requests_per_day']:
                return {
                    'allowed': False,
                    'limit_type': 'day',
                    'limit': limits['requests_per_day'],
                    'current': day_count,
                    'reset_time': (current_time // 86400 + 1) * 86400
                }
            
            # Increment counters
            pipe = self.redis.pipeline()
            pipe.incr(minute_key)
            pipe.expire(minute_key, 60)
            pipe.incr(hour_key)
            pipe.expire(hour_key, 3600)
            pipe.incr(day_key)
            pipe.expire(day_key, 86400)
            await pipe.execute()
            
            return {
                'allowed': True,
                'remaining': {
                    'minute': limits['requests_per_minute'] - minute_count - 1,
                    'hour': limits['requests_per_hour'] - hour_count - 1,
                    'day': limits['requests_per_day'] - day_count - 1
                }
            }
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # Allow request if rate limiter fails
            return {'allowed': True, 'error': str(e)}
    
    def get_client_identifier(self, request: Request) -> str:
        """Get unique identifier for client (IP + User-Agent hash)"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        # Use IP + first 8 chars of user-agent hash for identification
        import hashlib
        ua_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
        return f"{client_ip}:{ua_hash}"
    
    def get_user_tier(self, request: Request) -> str:
        """Determine user tier from request (placeholder implementation)"""
        # In real implementation, check JWT token or API key
        auth_header = request.headers.get("authorization", "")
        
        if "pro-api-key" in auth_header:
            return "pro_user"
        elif "api-key" in auth_header:
            return "free_user"
        else:
            return "anonymous"

# Global rate limiter instance
rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """FastAPI middleware for rate limiting"""
    
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/", "/docs", "/openapi.json"] or request.url.path.startswith("/static"):
        response = await call_next(request)
        return response
    
    # Get client info
    client_id = rate_limiter.get_client_identifier(request)
    user_tier = rate_limiter.get_user_tier(request)
    endpoint = request.url.path
    
    # Check rate limit
    limit_result = await rate_limiter.check_rate_limit(client_id, user_tier, endpoint)
    
    if not limit_result['allowed']:
        # Rate limit exceeded
        reset_time = limit_result.get('reset_time', 0)
        retry_after = max(1, reset_time - int(time.time()))
        
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "limit_type": limit_result['limit_type'],
                "limit": limit_result['limit'],
                "current": limit_result['current'],
                "retry_after": retry_after
            },
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit_result['limit']),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time)
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers to response
    if 'remaining' in limit_result:
        remaining = limit_result['remaining']
        response.headers["X-RateLimit-Limit-Minute"] = str(rate_limiter.limits[user_tier]['requests_per_minute'])
        response.headers["X-RateLimit-Remaining-Minute"] = str(remaining['minute'])
        response.headers["X-RateLimit-Limit-Hour"] = str(rate_limiter.limits[user_tier]['requests_per_hour'])
        response.headers["X-RateLimit-Remaining-Hour"] = str(remaining['hour'])
        response.headers["X-RateLimit-Limit-Day"] = str(rate_limiter.limits[user_tier]['requests_per_day'])
        response.headers["X-RateLimit-Remaining-Day"] = str(remaining['day'])
    
    return response