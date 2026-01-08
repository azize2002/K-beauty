"""Database connection configuration."""
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

logger = logging.getLogger(__name__)

# Configuration directe (fallback si .env ne fonctionne pas)
MONGO_URL = os.environ.get('MONGO_URL') or os.environ.get('MONGO_URI') or 'mongodb://localhost:27017'
DB_NAME = os.environ.get('DB_NAME') or 'kbeauty'

# Global database client
client: AsyncIOMotorClient = None
db = None


async def get_database():
    """Get database instance."""
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        logger.info(f"Database connection established to {DB_NAME}")
    return db


async def close_database():
    """Close database connection."""
    global client
    if client:
        client.close()
        logger.info("Database connection closed")