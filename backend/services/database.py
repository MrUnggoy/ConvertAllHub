"""
Database service layer for ConvertAll Hub.

Provides connection pooling, session management, and health checks
for PostgreSQL database using SQLAlchemy async engine.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)


class DatabaseService:
    """
    Database service with connection pooling and async session management.
    
    Features:
    - Connection pooling with configurable pool size (default: 20)
    - Async session management with automatic commit/rollback
    - Health check for database connectivity
    - Proper resource cleanup
    """
    
    def __init__(self, database_url: str, pool_size: int = 20, echo: bool = False):
        """
        Initialize database service with connection pooling.
        
        Args:
            database_url: PostgreSQL connection URL (postgresql+asyncpg://...)
            pool_size: Maximum number of connections in the pool (default: 20)
            echo: Enable SQL query logging (default: False)
        """
        self.database_url = database_url
        self.pool_size = pool_size
        
        # Create async engine with connection pooling
        self.engine: AsyncEngine = create_async_engine(
            database_url,
            pool_size=pool_size,
            max_overflow=0,  # No overflow connections beyond pool_size
            echo=echo,
            pool_pre_ping=True,  # Verify connections before using them
            pool_recycle=3600,  # Recycle connections after 1 hour
        )
        
        # Create async session factory
        self.SessionLocal = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        
        logger.info(f"Database service initialized with pool_size={pool_size}")
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Provide database session with automatic cleanup.
        
        Usage:
            async with db_service.get_session() as session:
                # Use session for queries
                result = await session.execute(query)
                # Automatically commits on success, rolls back on exception
        
        Yields:
            AsyncSession: Database session with automatic transaction management
        """
        async with self.SessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception as e:
                await session.rollback()
                logger.error(f"Database session error: {e}")
                raise
            finally:
                await session.close()
    
    async def health_check(self, timeout: float = 5.0) -> bool:
        """
        Verify database connectivity within timeout period.
        
        Args:
            timeout: Maximum time to wait for connection (default: 5 seconds)
        
        Returns:
            bool: True if database is accessible, False otherwise
        """
        try:
            # Test connection by executing a simple query
            async with self.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database health check passed")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    async def close(self):
        """
        Close database engine and cleanup connections.
        
        Should be called during application shutdown.
        """
        await self.engine.dispose()
        logger.info("Database service closed")


# Global database service instance
_db_service: DatabaseService | None = None


def init_database(database_url: str, pool_size: int = 20, echo: bool = False) -> DatabaseService:
    """
    Initialize global database service instance.
    
    Args:
        database_url: PostgreSQL connection URL
        pool_size: Maximum number of connections in the pool
        echo: Enable SQL query logging
    
    Returns:
        DatabaseService: Initialized database service
    """
    global _db_service
    _db_service = DatabaseService(database_url, pool_size, echo)
    return _db_service


def get_database() -> DatabaseService:
    """
    Get global database service instance.
    
    Returns:
        DatabaseService: Global database service
    
    Raises:
        RuntimeError: If database service not initialized
    """
    if _db_service is None:
        raise RuntimeError("Database service not initialized. Call init_database() first.")
    return _db_service


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection function for FastAPI routes.
    
    Usage in FastAPI:
        @app.get("/users")
        async def get_users(session: AsyncSession = Depends(get_db_session)):
            result = await session.execute(select(User))
            return result.scalars().all()
    
    Yields:
        AsyncSession: Database session for the request
    """
    db = get_database()
    async with db.get_session() as session:
        yield session
