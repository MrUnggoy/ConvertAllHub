# Design Document: Database and Stripe Payment Integration

## Overview

This design specifies the technical implementation for integrating persistent database storage and Stripe payment processing into ConvertAll Hub. The system will transform the current stateless file conversion platform into a full-featured SaaS application with user accounts, usage tracking, subscription management, and conversion history.

The implementation follows a three-tier architecture:
- **Frontend (React + Vite)**: User interface deployed on AWS Amplify
- **Backend (FastAPI)**: REST API server deployed on AWS (EC2/ECS/Lambda)
- **Database (PostgreSQL)**: Managed database on AWS RDS with automated backups

Key capabilities:
- User registration and JWT-based authentication
- PostgreSQL database with proper schema design and migrations
- Stripe Checkout for subscription payments
- Stripe webhook processing for subscription lifecycle events
- Usage tracking with tier-based limits (Free: 10 conversions/month, Pro: unlimited)
- Conversion history with 90-day retention
- Secure credential management via AWS Secrets Manager

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Amplify                              │
│                    React Frontend (Vite)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Pages   │  │ Tool Pages   │  │ Account Page │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (AWS)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer                              │  │
│  │  /auth  /conversions  /subscriptions  /webhooks          │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼──────────┐  ┌──────────────────────────────┐  │
│  │  Authentication        │  │  Subscription Manager        │  │
│  │  Service               │  │  (Stripe Integration)        │  │
│  └────────────┬───────────┘  └──────────┬───────────────────┘  │
│               │                          │                       │
│  ┌────────────▼──────────┐  ┌───────────▼──────────────────┐  │
│  │  Usage Tracker        │  │  Database Service            │  │
│  │  Service              │  │  (SQLAlchemy ORM)            │  │
│  └────────────┬───────────┘  └───────────┬──────────────────┘  │
└───────────────┼──────────────────────────┼─────────────────────┘
                │                          │
                │         ┌────────────────▼────────────────┐
                │         │   AWS RDS PostgreSQL            │
                │         │   - users                       │
                │         │   - conversions                 │
                │         │   - subscriptions               │
                │         │   - usage_tracking              │
                │         └─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Stripe API                                  │
│  - Checkout Sessions                                             │
│  - Customer Portal                                               │
│  - Webhooks                                                      │
│  - Subscription Management                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**User Registration Flow:**
1. User submits email/password to `/api/auth/register`
2. Backend validates input, hashes password with bcrypt
3. Creates user record in PostgreSQL with `free` tier
4. Returns JWT token for immediate login

**Conversion Flow (Authenticated):**
1. User uploads file with JWT token
2. Backend validates token, checks usage limits via Usage Tracker
3. If within limits, processes conversion and records to database
4. Returns conversion result and updated usage stats

**Subscription Upgrade Flow:**
1. User clicks "Upgrade to Pro" in frontend
2. Frontend calls `/api/subscriptions/create-checkout`
3. Backend creates Stripe Checkout Session, stores pending state
4. User redirected to Stripe hosted checkout
5. On success, Stripe webhook notifies backend
6. Backend updates user tier to `pro` in database
7. Frontend polls or receives update, shows Pro features

**Webhook Processing Flow:**
1. Stripe sends webhook to `/api/webhooks/stripe`
2. Backend verifies signature using Stripe webhook secret
3. Processes event (payment success, subscription cancelled, etc.)
4. Updates database atomically within transaction
5. Returns 200 OK to Stripe (idempotent handling)

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- JWT storage in localStorage
- Stripe.js for checkout redirect

**Backend:**
- FastAPI 0.104+ (Python 3.11+)
- SQLAlchemy 2.0 ORM
- Alembic for database migrations
- Pydantic v2 for validation
- python-jose for JWT handling
- stripe-python SDK
- asyncpg for async PostgreSQL

**Database:**
- PostgreSQL 15+ on AWS RDS
- Connection pooling (max 20 connections)
- Automated daily backups (30-day retention)
- Point-in-time recovery (7 days)

**Infrastructure:**
- AWS Amplify (frontend hosting)
- AWS RDS (PostgreSQL database)
- AWS Secrets Manager (credentials)
- AWS EC2/ECS/Lambda (backend hosting options)

## Components and Interfaces

### Database Service Layer

**Module:** `backend/services/database.py`

Provides database connection management and session handling.

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager

class DatabaseService:
    def __init__(self, database_url: str, pool_size: int = 20):
        self.engine = create_async_engine(
            database_url,
            pool_size=pool_size,
            max_overflow=0,
            echo=False
        )
        self.SessionLocal = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
    
    @asynccontextmanager
    async def get_session(self) -> AsyncSession:
        """Provide database session with automatic cleanup"""
        async with self.SessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
    
    async def health_check(self) -> bool:
        """Verify database connectivity"""
        # Implementation checks connection within 5 seconds
```

### Authentication Service

**Module:** `backend/services/auth_service.py`

Handles user registration, login, and JWT token management.

```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

class AuthService:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain: str, hashed: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain, hashed)
    
    def create_access_token(self, user_id: int, expires_delta: timedelta = None) -> str:
        """Create JWT access token"""
        # Default 7-day expiration
        expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
        payload = {"sub": str(user_id), "exp": expire}
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> int:
        """Verify JWT and return user_id"""
        # Raises JWTError if invalid/expired
```

### Usage Tracker Service

**Module:** `backend/services/usage_tracker.py`

Tracks conversion usage and enforces tier-based limits.

```python
from datetime import datetime
from sqlalchemy import select, func

class UsageTracker:
    FREE_TIER_LIMIT = 10
    
    async def check_can_convert(self, session: AsyncSession, user_id: int, tier: str) -> bool:
        """Check if user can perform conversion"""
        if tier == "pro":
            return True
        
        # Count conversions this month for free tier
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
        count = await self._count_conversions_since(session, user_id, month_start)
        return count < self.FREE_TIER_LIMIT
    
    async def record_conversion(
        self,
        session: AsyncSession,
        user_id: int,
        conversion_type: str,
        file_size: int,
        status: str
    ) -> int:
        """Record conversion to database, return conversion_id"""
        # Creates conversion record with timestamp
    
    async def get_usage_stats(self, session: AsyncSession, user_id: int) -> dict:
        """Get current month usage statistics"""
        # Returns: {used: int, limit: int, resets_at: datetime}
```

### Stripe Integration Service

**Module:** `backend/services/stripe_service.py`

Manages Stripe API interactions for subscriptions.

```python
import stripe
from typing import Optional

class StripeService:
    def __init__(self, api_key: str, webhook_secret: str):
        stripe.api_key = api_key
        self.webhook_secret = webhook_secret
    
    async def create_checkout_session(
        self,
        customer_email: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        metadata: dict
    ) -> str:
        """Create Stripe Checkout Session, return session URL"""
        session = stripe.checkout.Session.create(
            customer_email=customer_email,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        return session.url
    
    async def create_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> str:
        """Create billing portal session, return portal URL"""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        return session.url
    
    def verify_webhook_signature(self, payload: bytes, sig_header: str) -> stripe.Event:
        """Verify webhook signature and return event"""
        return stripe.Webhook.construct_event(
            payload, sig_header, self.webhook_secret
        )
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel subscription at period end"""
        stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        return True
```

### Subscription Manager Service

**Module:** `backend/services/subscription_manager.py`

Orchestrates subscription lifecycle and database updates.

```python
from datetime import datetime

class SubscriptionManager:
    def __init__(self, stripe_service: StripeService):
        self.stripe = stripe_service
    
    async def handle_checkout_completed(
        self,
        session: AsyncSession,
        checkout_session: dict
    ):
        """Process successful checkout"""
        user_id = int(checkout_session["metadata"]["user_id"])
        customer_id = checkout_session["customer"]
        subscription_id = checkout_session["subscription"]
        
        # Update user tier to pro
        # Create subscription record
        # Store customer_id and subscription_id
    
    async def handle_payment_succeeded(
        self,
        session: AsyncSession,
        invoice: dict
    ):
        """Process successful payment"""
        # Update subscription status to active
        # Update period_end date
    
    async def handle_payment_failed(
        self,
        session: AsyncSession,
        invoice: dict
    ):
        """Process failed payment"""
        # Update subscription status to past_due
        # Keep user as pro until grace period ends
    
    async def handle_subscription_deleted(
        self,
        session: AsyncSession,
        subscription: dict
    ):
        """Process subscription cancellation"""
        # Downgrade user to free tier
        # Update subscription status to cancelled
```

### API Endpoints

**Authentication Router:** `backend/routers/auth.py`

```python
POST /api/auth/register
Request: {email: str, password: str}
Response: {access_token: str, user: {id: int, email: str, tier: str}}

POST /api/auth/login
Request: {email: str, password: str}
Response: {access_token: str, user: {id: int, email: str, tier: str}}

GET /api/auth/me
Headers: {Authorization: "Bearer <token>"}
Response: {id: int, email: str, tier: str, created_at: str}
```

**Subscriptions Router:** `backend/routers/subscriptions.py`

```python
POST /api/subscriptions/create-checkout
Headers: {Authorization: "Bearer <token>"}
Request: {plan: "monthly" | "annual"}
Response: {checkout_url: str}

POST /api/subscriptions/create-portal
Headers: {Authorization: "Bearer <token>"}
Response: {portal_url: str}

GET /api/subscriptions/status
Headers: {Authorization: "Bearer <token>"}
Response: {
    tier: str,
    status: str,
    current_period_end: str | null,
    cancel_at_period_end: bool
}

POST /api/subscriptions/cancel
Headers: {Authorization: "Bearer <token>"}
Response: {success: bool, message: str}
```

**Conversions Router:** `backend/routers/conversions.py`

```python
GET /api/conversions/usage
Headers: {Authorization: "Bearer <token>"}
Response: {used: int, limit: int | null, resets_at: str | null}

GET /api/conversions/history
Headers: {Authorization: "Bearer <token>"}
Query: {page: int = 1, limit: int = 50, type: str | null}
Response: {
    conversions: [{
        id: int,
        type: str,
        created_at: str,
        file_size: int,
        status: str
    }],
    total: int,
    page: int,
    pages: int
}
```

**Webhooks Router:** `backend/routers/webhooks.py`

```python
POST /api/webhooks/stripe
Headers: {Stripe-Signature: str}
Body: Raw Stripe webhook payload
Response: {received: true}

Supported Events:
- checkout.session.completed
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.deleted
- customer.subscription.updated
```

### Frontend Components

**Auth Context:** `src/contexts/AuthContext.tsx`

Manages authentication state across the application.

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Stores JWT in localStorage
// Provides user info to all components
// Handles token refresh logic
```

**Subscription Context:** `src/contexts/SubscriptionContext.tsx`

Manages subscription state and usage tracking.

```typescript
interface SubscriptionContextType {
  tier: 'free' | 'pro';
  usage: {used: number, limit: number | null, resets_at: string | null};
  subscriptionStatus: SubscriptionStatus | null;
  upgradeToProMonthly: () => Promise<void>;
  upgradeToProAnnual: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

// Polls usage every 5 minutes
// Updates UI when subscription changes
```

**Protected Route Component:** `src/components/ProtectedRoute.tsx`

Wraps routes requiring authentication.

```typescript
// Redirects to /login if not authenticated
// Shows loading state while checking auth
// Passes through if authenticated
```

## Data Models

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
```

**Subscriptions Table:**
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(20) NOT NULL, -- 'monthly' or 'annual'
    status VARCHAR(20) NOT NULL, -- 'active', 'past_due', 'cancelled', 'incomplete'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

**Conversions Table:**
```sql
CREATE TABLE conversions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversion_type VARCHAR(50) NOT NULL, -- 'pdf-to-image', 'image-compress', etc.
    file_size INTEGER NOT NULL, -- bytes
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'processing'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_created_at ON conversions(created_at);
CREATE INDEX idx_conversions_user_created ON conversions(user_id, created_at DESC);
```

**Usage Tracking Table:**
```sql
CREATE TABLE usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- 'YYYY-MM' format
    conversion_count INTEGER DEFAULT 0,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month_year)
);

CREATE INDEX idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
```

### SQLAlchemy Models

**User Model:** `backend/models/user.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    tier = Column(String(20), nullable=False, default="free", index=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    conversions = relationship("Conversion", back_populates="user")
    usage_tracking = relationship("UsageTracking", back_populates="user")
```

**Subscription Model:** `backend/models/subscription.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_customer_id = Column(String(255), unique=True, nullable=False, index=True)
    stripe_subscription_id = Column(String(255), unique=True)
    plan_type = Column(String(20), nullable=False)  # 'monthly' or 'annual'
    status = Column(String(20), nullable=False, index=True)
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscription")
```

**Conversion Model:** `backend/models/conversion.py`

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class Conversion(Base):
    __tablename__ = "conversions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversion_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="conversions")
```

### Pydantic Schemas

**Request/Response Models:** `backend/schemas/`

```python
# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    tier: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Subscription schemas
class CheckoutRequest(BaseModel):
    plan: Literal["monthly", "annual"]

class CheckoutResponse(BaseModel):
    checkout_url: str

class SubscriptionStatus(BaseModel):
    tier: str
    status: str | None
    current_period_end: datetime | None
    cancel_at_period_end: bool

# Conversion schemas
class UsageStats(BaseModel):
    used: int
    limit: int | None
    resets_at: datetime | None

class ConversionRecord(BaseModel):
    id: int
    type: str
    created_at: datetime
    file_size: int
    status: str

class ConversionHistory(BaseModel):
    conversions: list[ConversionRecord]
    total: int
    page: int
    pages: int
```

