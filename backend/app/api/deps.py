"""Common API dependencies."""
from app.db.connection import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return await get_database()

