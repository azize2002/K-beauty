"""Script to reset admin password."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.connection import get_database
from app.core.security import get_password_hash
from datetime import datetime, timezone
import uuid


async def reset_admin():
    """Reset or create admin user."""
    db = await get_database()
    
    # Delete existing admin
    await db.users.delete_one({"email": "admin@kbeauty.tn"})
    print("🗑️  Ancien admin supprimé (si existant)")
    
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
    
    print("✅ Admin recréé avec succès!")
    print("📧 Email: admin@kbeauty.tn")
    print("🔑 Mot de passe: Admin2026!")


if __name__ == "__main__":
    asyncio.run(reset_admin())