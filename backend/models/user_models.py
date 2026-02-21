from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum
from datetime import datetime

class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"

class User(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    tier: UserTier = UserTier.FREE
    api_key: Optional[str] = None
    subscription_id: Optional[str] = None
    created_at: datetime
    last_active: Optional[datetime] = None

class UsageStats(BaseModel):
    conversions_today: int = 0
    conversions_this_month: int = 0
    total_conversions: int = 0
    last_conversion: Optional[datetime] = None

class UserWithStats(User):
    usage_stats: UsageStats

class AuthRequest(BaseModel):
    email: Optional[EmailStr] = None
    api_key: Optional[str] = None

class AuthResponse(BaseModel):
    user: User
    access_token: Optional[str] = None
    expires_in: Optional[int] = None