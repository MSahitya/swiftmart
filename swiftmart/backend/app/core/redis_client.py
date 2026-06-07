import redis
import json
import logging
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def cache_get(key: str) -> Optional[Any]:
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except Exception as e:
        logger.warning(f"Cache GET failed for key {key}: {e}")
        return None


def cache_set(key: str, value: Any, ttl: int = 600) -> bool:
    try:
        redis_client.setex(key, ttl, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.warning(f"Cache SET failed for key {key}: {e}")
        return False


def cache_delete(key: str) -> bool:
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Cache DELETE failed for key {key}: {e}")
        return False


def cache_delete_pattern(pattern: str) -> int:
    try:
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"Cache DELETE pattern {pattern} failed: {e}")
        return 0
