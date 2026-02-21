from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import uuid
from datetime import datetime

from models.user_models import User, UserTier, AuthRequest, AuthResponse, UsageStats, UserWithStats

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Dummy user database (in production, this would be a real database)
dummy_users = {
    "user123": User(
        id="user123",
        email="demo@example.com",
        tier=UserTier.FREE,
        api_key="demo-api-key-123",
        created_at=datetime.now()
    ),
    "pro456": User(
        id="pro456", 
        email="pro@example.com",
        tier=UserTier.PRO,
        api_key="pro-api-key-456",
        subscription_id="sub_123",
        created_at=datetime.now()
    )
}

@router.post("/login", response_model=AuthResponse)
async def login(auth_request: AuthRequest):
    """Dummy login endpoint"""
    
    # Simulate authentication logic
    if auth_request.email == "demo@example.com":
        user = dummy_users["user123"]
    elif auth_request.email == "pro@example.com":
        user = dummy_users["pro456"]
    elif auth_request.api_key:
        # Find user by API key
        user = next((u for u in dummy_users.values() if u.api_key == auth_request.api_key), None)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid API key")
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return AuthResponse(
        user=user,
        access_token=f"dummy-token-{user.id}",
        expires_in=3600
    )

@router.get("/me", response_model=UserWithStats)
async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current user information (dummy implementation)"""
    
    if not credentials:
        # Return anonymous user for demo
        anonymous_user = User(
            id="anonymous",
            tier=UserTier.FREE,
            created_at=datetime.now()
        )
        usage_stats = UsageStats(
            conversions_today=5,
            conversions_this_month=23,
            total_conversions=156
        )
        return UserWithStats(**anonymous_user.dict(), usage_stats=usage_stats)
    
    # In a real implementation, you would validate the token
    token = credentials.credentials
    
    if "user123" in token:
        user = dummy_users["user123"]
    elif "pro456" in token:
        user = dummy_users["pro456"]
    else:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Dummy usage stats
    usage_stats = UsageStats(
        conversions_today=12 if user.tier == UserTier.PRO else 5,
        conversions_this_month=89 if user.tier == UserTier.PRO else 23,
        total_conversions=456 if user.tier == UserTier.PRO else 156,
        last_conversion=datetime.now()
    )
    
    return UserWithStats(**user.dict(), usage_stats=usage_stats)

@router.post("/register", response_model=AuthResponse)
async def register(email: str, tier: UserTier = UserTier.FREE):
    """Dummy user registration"""
    
    # Check if user already exists
    existing_user = next((u for u in dummy_users.values() if u.email == email), None)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    api_key = f"api-key-{user_id[:8]}"
    
    new_user = User(
        id=user_id,
        email=email,
        tier=tier,
        api_key=api_key,
        created_at=datetime.now()
    )
    
    dummy_users[user_id] = new_user
    
    return AuthResponse(
        user=new_user,
        access_token=f"dummy-token-{user_id}",
        expires_in=3600
    )

@router.post("/upgrade")
async def upgrade_to_pro(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dummy upgrade to Pro endpoint"""
    
    token = credentials.credentials
    user = None
    
    if "user123" in token:
        user = dummy_users["user123"]
    elif "pro456" in token:
        raise HTTPException(status_code=400, detail="User is already Pro")
    else:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Simulate upgrade
    user.tier = UserTier.PRO
    user.subscription_id = f"sub_{uuid.uuid4()}"
    
    return {"message": "Successfully upgraded to Pro", "tier": user.tier}