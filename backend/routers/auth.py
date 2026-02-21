"""
Authentication router for ConvertAll Hub.

Provides endpoints for user registration, login, and current user information.
Implements JWT-based authentication with database persistence.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError
import logging

from models.database import User
from schemas.auth_schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    ErrorResponse
)
from services.database import get_db_session
from services.auth_service import get_auth_service
from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "User already exists"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def register(
    request: UserRegisterRequest,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Register a new user account.
    
    Creates a new user with hashed password and returns JWT token for immediate login.
    New users start with 'free' tier by default.
    
    - **email**: Valid email address (must be unique)
    - **password**: Password with 8-100 characters
    """
    try:
        auth_service = get_auth_service()
        
        # Check if user already exists
        result = await session.execute(
            select(User).where(User.email == request.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Hash password
        password_hash = auth_service.hash_password(request.password)
        
        # Create new user
        new_user = User(
            email=request.email,
            password_hash=password_hash,
            tier="free",
            email_verified=False
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        # Create access token
        access_token = auth_service.create_access_token(new_user.id)
        
        logger.info(f"User registered successfully: {new_user.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def login(
    request: UserLoginRequest,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Authenticate user and return JWT token.
    
    Validates email and password, returns JWT token valid for 7 days.
    
    - **email**: User email address
    - **password**: User password
    """
    try:
        auth_service = get_auth_service()
        
        # Find user by email
        result = await session.execute(
            select(User).where(User.email == request.email)
        )
        user = result.scalar_one_or_none()
        
        # Verify user exists and password is correct
        if not user or not auth_service.verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = auth_service.create_access_token(user.id)
        
        logger.info(f"User logged in successfully: {user.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate user"
        )


@router.get(
    "/me",
    response_model=UserResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        404: {"model": ErrorResponse, "description": "User not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_current_user_info(
    user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    Returns user profile including tier and verification status.
    
    **Authorization**: Bearer token required
    """
    try:
        logger.info(f"User info requested: {user.email}")
        return UserResponse.model_validate(user)
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )