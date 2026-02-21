import os
import json
import hashlib
from typing import Optional, Any, Dict
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

class CacheService:
    """Redis-based caching service for conversion results"""
    
    def __init__(self):
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.default_ttl = int(os.getenv('CACHE_TTL_SECONDS', '3600'))  # 1 hour default
        
    async def get_conversion_result(self, file_hash: str, conversion_params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached conversion result"""
        try:
            cache_key = self._generate_cache_key(file_hash, conversion_params)
            cached_result = await self.redis.get(cache_key)
            
            if cached_result:
                logger.info(f"Cache hit for key: {cache_key}")
                return json.loads(cached_result)
            
            logger.info(f"Cache miss for key: {cache_key}")
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set_conversion_result(self, file_hash: str, conversion_params: Dict[str, Any], result: Dict[str, Any], ttl: Optional[int] = None) -> bool:
        """Cache conversion result"""
        try:
            cache_key = self._generate_cache_key(file_hash, conversion_params)
            cache_ttl = ttl or self.default_ttl
            
            await self.redis.setex(
                cache_key,
                cache_ttl,
                json.dumps(result, default=str)
            )
            
            logger.info(f"Cached result for key: {cache_key} (TTL: {cache_ttl}s)")
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def invalidate_cache(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern"""
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                deleted = await self.redis.delete(*keys)
                logger.info(f"Invalidated {deleted} cache entries matching: {pattern}")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            info = await self.redis.info()
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': info.get('used_memory_human', '0B'),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'hit_rate': self._calculate_hit_rate(
                    info.get('keyspace_hits', 0),
                    info.get('keyspace_misses', 0)
                )
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {}
    
    def _generate_cache_key(self, file_hash: str, conversion_params: Dict[str, Any]) -> str:
        """Generate unique cache key for file + conversion parameters"""
        # Sort parameters for consistent key generation
        sorted_params = json.dumps(conversion_params, sort_keys=True)
        params_hash = hashlib.md5(sorted_params.encode()).hexdigest()
        return f"conversion:{file_hash}:{params_hash}"
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        """Calculate cache hit rate percentage"""
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0
    
    async def close(self):
        """Close Redis connection"""
        await self.redis.close()

# Global cache service instance
cache_service = CacheService()