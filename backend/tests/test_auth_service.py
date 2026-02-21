"""
Unit tests for authentication service.

Tests password hashing, JWT token creation/verification, and token expiration.
"""

import pytest
from datetime import timedelta
from jose import JWTError

from services.auth_service import AuthService


class TestAuthService:
    """Test suite for AuthService."""
    
    @pytest.fixture
    def auth_service(self):
        """Create AuthService instance for testing."""
        return AuthService(
            secret_key="test-secret-key-for-testing-only",
            algorithm="HS256",
            token_expire_days=7
        )
    
    def test_hash_password(self, auth_service):
        """Test password hashing produces different hashes for same password."""
        password = "SecurePassword123!"
        
        hash1 = auth_service.hash_password(password)
        hash2 = auth_service.hash_password(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        assert len(hash1) > 0
        assert len(hash2) > 0
    
    def test_verify_password_correct(self, auth_service):
        """Test password verification with correct password."""
        password = "SecurePassword123!"
        password_hash = auth_service.hash_password(password)
        
        assert auth_service.verify_password(password, password_hash) is True
    
    def test_verify_password_incorrect(self, auth_service):
        """Test password verification with incorrect password."""
        password = "SecurePassword123!"
        wrong_password = "WrongPassword456!"
        password_hash = auth_service.hash_password(password)
        
        assert auth_service.verify_password(wrong_password, password_hash) is False
    
    def test_create_access_token(self, auth_service):
        """Test JWT token creation."""
        user_id = 123
        
        token = auth_service.create_access_token(user_id)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_verify_token_valid(self, auth_service):
        """Test JWT token verification with valid token."""
        user_id = 123
        
        token = auth_service.create_access_token(user_id)
        verified_user_id = auth_service.verify_token(token)
        
        assert verified_user_id == user_id
    
    def test_verify_token_invalid(self, auth_service):
        """Test JWT token verification with invalid token."""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(JWTError):
            auth_service.verify_token(invalid_token)
    
    def test_verify_token_wrong_secret(self, auth_service):
        """Test JWT token verification with token signed by different secret."""
        user_id = 123
        
        # Create token with different secret
        other_service = AuthService(
            secret_key="different-secret-key",
            algorithm="HS256"
        )
        token = other_service.create_access_token(user_id)
        
        # Verification should fail
        with pytest.raises(JWTError):
            auth_service.verify_token(token)
    
    def test_create_token_custom_expiration(self, auth_service):
        """Test JWT token creation with custom expiration."""
        user_id = 123
        expires_delta = timedelta(days=1)
        
        token = auth_service.create_access_token(user_id, expires_delta)
        verified_user_id = auth_service.verify_token(token)
        
        assert verified_user_id == user_id
    
    def test_token_contains_user_id(self, auth_service):
        """Test that decoded token contains correct user_id."""
        user_id = 456
        
        token = auth_service.create_access_token(user_id)
        payload = auth_service.decode_token_without_verification(token)
        
        assert payload.get("sub") == str(user_id)
        assert "exp" in payload
        assert "iat" in payload
