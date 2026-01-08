import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def add_quantity():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.kbeauty
    
    # Ajouter quantity: 10 à tous les produits
    result = await db.products.update_many(
        {},
        {"$set": {"quantity": 10}}
    )
    
    print(f"✅ {result.modified_count} produits mis à jour (quantity: 10)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_quantity())