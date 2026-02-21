"""
SQLAlchemy database models for ConvertAll Hub.

This module defines the database schema using SQLAlchemy ORM for:
- User accounts and authentication
- Subscriptions and Stripe integration
- Conversion history tracking
- Usage tracking for tier-based limits
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    """User account model with authentication and subscription information."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    tier = Column(String(20), nullable=False, default="free", index=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversions = relationship("Conversion", back_populates="user", cascade="all, delete-orphan")
    usage_tracking = relationship("UsageTracking", back_populates="user", cascade="all, delete-orphan")


class Subscription(Base):
    """Subscription model for Stripe payment integration."""
    
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stripe_customer_id = Column(String(255), unique=True, nullable=False, index=True)
    stripe_subscription_id = Column(String(255), unique=True)
    plan_type = Column(String(20), nullable=False)  # 'monthly' or 'annual'
    status = Column(String(20), nullable=False, index=True)  # 'active', 'past_due', 'cancelled', 'incomplete'
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="subscription")


class Conversion(Base):
    """Conversion history model for tracking file conversions."""
    
    __tablename__ = "conversions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversion_type = Column(String(50), nullable=False)  # 'pdf-to-image', 'image-compress', etc.
    file_size = Column(Integer, nullable=False)  # bytes
    status = Column(String(20), nullable=False)  # 'success', 'failed', 'processing'
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="conversions")
    
    # Composite index for efficient user conversion history queries
    __table_args__ = (
        Index('idx_conversions_user_created', 'user_id', 'created_at'),
    )


class UsageTracking(Base):
    """Usage tracking model for enforcing tier-based conversion limits."""
    
    __tablename__ = "usage_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month_year = Column(String(7), nullable=False)  # 'YYYY-MM' format
    conversion_count = Column(Integer, default=0, nullable=False)
    last_reset = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="usage_tracking")
    
    # Composite unique constraint and indexes
    __table_args__ = (
        UniqueConstraint('user_id', 'month_year', name='uq_user_month'),
        Index('idx_usage_tracking_user_month', 'user_id', 'month_year'),
    )
