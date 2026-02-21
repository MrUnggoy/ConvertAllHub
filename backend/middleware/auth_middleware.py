"""
Authentication middleware for ConvertAll Hub.

Provides JWT token verification middleware and dependency injection
for accessing the current authenticated user in protected endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError
from typing import Optional
import logging

from models.database import User
from services.database import get_db_session
from services.auth_service import get_auth_service

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Dependency injection function to get current authenticated user.
    
    Verifies JWT token from Authorization header and returns the user object.
    Handles expired and invalid tokens with appropriate error responses.
    
    Usage in FastAPI routes:
        @router.get("/protected")
        async def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.id, "email": user.email}
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        session: Database session for user lookup
    
    Returns:
        User: Authenticated user object from database
    
    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found
    """
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify token and extract user_id
        auth_service = get_auth_service()
        user_id = auth_service.verify_token(token)
        
        # Fetch user from database
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.warning(f"Token valid but user not found: user_id={user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        logger.debug(f"Authenticated user: {user.email}")
        return user
        
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    session: AsyncSession = Depends(get_db_session)
) -> Optional[User]:
    """
    Optional authentication dependency for endpoints that work with or without auth.
    
    Returns user if valid token provided, None if no token or invalid token.
    Does not raise exceptions for missing/invalid tokens.
    
    Usage in FastAPI routes:
        @router.get("/public-or-private")
        async def flexible_route(user: Optional[User] = Depends(get_current_user_optional)):
            if user:
                return {"message": f"Hello {user.email}"}
            return {"message": "Hello anonymous user"}
    
    Args:
        credentials: Optional HTTP Bearer token from Authorization header
        session: Database session for user lookup
    
    Returns:
        Optional[User]: User object if authenticated, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        auth_service = get_auth_service()
        user_id = auth_service.verify_token(token)
        
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            logger.debug(f"Optional auth: authenticated as {user.email}")
        return user
        
    except (JWTError, Exception) as e:
        logger.debug(f"Optional auth: token invalid or expired: {e}")
        return None


def require_tier(required_tier: str):
    """
    Dependency factory for requiring specific user tier.
    
    Creates a dependency that checks if the authenticated user has the required tier.
    Useful for protecting Pro-only endpoints.
    
    Usage in FastAPI routes:
        @router.get("/pro-only")
        async def pro_route(user: User = Depends(require_tier("pro"))):
            return {"message": "Welcome Pro user!"}
    
    Args:
        required_tier: Required tier ("free" or "pro")
    
    Returns:
        Dependency function that returns User if tier matches
    
    Raises:
        HTTPException: 403 if user doesn't have required tier
    """
    async def tier_checker(user: User = Depends(get_current_user)) -> User:
        if user.tier != required_tier:
            logger.warning(f"User {user.email} attempted to access {required_tier}-only endpoint")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This endpoint requires {required_tier} tier"
            )
        return user
    
    return tier_checker


# Convenience dependency for Pro-only endpoints
require_pro_tier = require_tier("pro")
