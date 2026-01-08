"""Script to create an admin user."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.connection import get_database
from app.core.security import get_password_hash
from datetime import datetime, timezone
import uuid


async def create_admin():
    """Create admin user."""
    db = await get_database()
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": "admin@kbeauty.tn"})
    if existing:
        print("❌ Admin already exists!")
        return
    
    # Create admin
    admin_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    admin = {
        "id": admin_id,
        "email": "admin@kbeauty.tn",
        "hashed_password": get_password_hash("Admin2026!"),
        "first_name": "Admin",
        "last_name": "K-Beauty",
        "phone": "+216 00 000 000",
        "role": "admin",
        "is_active": True,
        "is_verified": True,
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(admin)
    
    print("✅ Admin créé avec succès!")
    print("📧 Email: admin@kbeauty.tn")
    print("🔑 Mot de passe: Admin2026!")


if __name__ == "__main__":
    asyncio.run(create_admin())