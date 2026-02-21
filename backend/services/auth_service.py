"""
Authentication service for ConvertAll Hub.

Provides password hashing with bcrypt and JWT token creation/verification
for user authentication. Implements secure token-based authentication with
configurable expiration (default: 7 days).
"""

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service handling password hashing and JWT tokens.
    
    Features:
    - Password hashing with bcrypt (secure, slow hashing algorithm)
    - JWT token creation with configurable expiration
    - Token verification with expiration checking
    - Secure token payload handling
    """
    
    def __init__(self, secret_key: str, algorithm: str = "HS256", token_expire_days: int = 7):
        """
        Initialize authentication service.
        
        Args:
            secret_key: Secret key for JWT signing (should be strong random string)
            algorithm: JWT signing algorithm (default: HS256)
            token_expire_days: Default token expiration in days (default: 7)
        """
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.token_expire_days = token_expire_days
        
        # Initialize password hashing context with bcrypt
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12  # Cost factor for bcrypt (higher = more secure but slower)
        )
        
        logger.info(f"AuthService initialized with algorithm={algorithm}, token_expire_days={token_expire_days}")
    
    def hash_password(self, password: str) -> str:
        """
        Hash password using bcrypt.
        
        Args:
            password: Plain text password to hash
        
        Returns:
            str: Hashed password suitable for database storage
        """
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify password against hash.
        
        Args:
            plain_password: Plain text password to verify
            hashed_password: Hashed password from database
        
        Returns:
            bool: True if password matches, False otherwise
        """
        try:
            return self.pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def create_access_token(
        self,
        user_id: int,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token for user.
        
        Args:
            user_id: User ID to encode in token
            expires_delta: Optional custom expiration time (default: 7 days)
        
        Returns:
            str: Encoded JWT token
        """
        # Calculate expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=self.token_expire_days)
        
        # Create token payload
        payload = {
            "sub": str(user_id),  # Subject: user ID
            "exp": expire,  # Expiration time
            "iat": datetime.utcnow()  # Issued at time
        }
        
        # Encode and return token
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        logger.debug(f"Created access token for user_id={user_id}, expires={expire}")
        return token
    
    def verify_token(self, token: str) -> int:
        """
        Verify JWT token and extract user ID.
        
        Args:
            token: JWT token to verify
        
        Returns:
            int: User ID from token
        
        Raises:
            JWTError: If token is invalid, expired, or malformed
        """
        try:
            # Decode token and verify signature + expiration
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # Extract user ID from subject claim
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                raise JWTError("Token missing 'sub' claim")
            
            user_id = int(user_id_str)
            logger.debug(f"Verified token for user_id={user_id}")
            return user_id
            
        except JWTError as e:
            logger.warning(f"Token verification failed: {e}")
            raise
        except ValueError as e:
            logger.error(f"Invalid user_id in token: {e}")
            raise JWTError("Invalid user_id in token")
    
    def decode_token_without_verification(self, token: str) -> dict:
        """
        Decode token without verification (for debugging/inspection only).
        
        WARNING: Do not use for authentication! This does not verify signature.
        
        Args:
            token: JWT token to decode
        
        Returns:
            dict: Token payload
        """
        try:
            return jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_signature": False}
            )
        except Exception as e:
            logger.error(f"Token decode error: {e}")
            return {}


# Global authentication service instance
_auth_service: Optional[AuthService] = None


def init_auth_service(secret_key: str, algorithm: str = "HS256", token_expire_days: int = 7) -> AuthService:
    """
    Initialize global authentication service instance.
    
    Args:
        secret_key: Secret key for JWT signing
        algorithm: JWT signing algorithm
        token_expire_days: Default token expiration in days
    
    Returns:
        AuthService: Initialized authentication service
    """
    global _auth_service
    _auth_service = AuthService(secret_key, algorithm, token_expire_days)
    return _auth_service


def get_auth_service() -> AuthService:
    """
    Get global authentication service instance.
    
    Returns:
        AuthService: Global authentication service
    
    Raises:
        RuntimeError: If authentication service not initialized
    """
    if _auth_service is None:
        raise RuntimeError("Authentication service not initialized. Call init_auth_service() first.")
    return _auth_service
