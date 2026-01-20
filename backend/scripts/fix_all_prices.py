import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_all_prices():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.kbeauty
    
    # Mettre à jour TOUS les champs de prix et promo
    result = await db.products.update_many(
        {},
        [
            {"$set": {
                "discount_percentage": 0,
                "price": "$original_price",
                "price_tnd": "$original_price_tnd"
            }}
        ]
    )
    
    print(f"✅ {result.modified_count} produits mis à jour")
    
    # Vérification
    sample = await db.products.find_one({}, {"name": 1, "price": 1, "original_price": 1, "price_tnd": 1, "original_price_tnd": 1, "discount_percentage": 1})
    print(f"📦 Exemple: {sample}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_all_prices())