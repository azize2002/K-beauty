"""Database connection configuration."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URL, DB_NAME
import logging

logger = logging.getLogger(__name__)

# Global database client
client: AsyncIOMotorClient = None
db = None


async def get_database():
    """Get database instance."""
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        logger.info("Database connection established")
    return db


async def close_database():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("Database connection closed")

