#!/usr/bin/env python3
"""
Script d'import des produits K-Beauty dans MongoDB
Format JSON: { "metadata": {...}, "products": [...] }
"""

import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

async def import_products():
    # Connexion MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.kbeauty
    
    # Charger le fichier JSON (chemin relatif depuis scripts/)
    json_path = "../data/products.json"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extraire les produits du tableau "products"
    products_list = data.get("products", [])
    print(f"📦 {len(products_list)} produits trouvés dans le fichier JSON")
    
    if not products_list:
        print("❌ Aucun produit trouvé!")
        return
    
    # Supprimer les anciens produits
    await db.products.delete_many({})
    print("🗑️  Anciens produits supprimés")
    
    # Préparer les produits pour l'import
    products_to_insert = []
    now = datetime.now(timezone.utc)
    
    for product in products_list:
        clean_product = {
            "id": product.get("id"),
            "ref": product.get("ref"),
            "name": product.get("name"),
            "brand": product.get("brand"),
            "category": product.get("category"),
            "category_fr": product.get("category_fr"),
            "format": product.get("format"),
            "price_tnd": product.get("price", 0),
            "original_price_tnd": product.get("original_price", product.get("price", 0)),
            "discount_percentage": product.get("discount_percentage", 0),
            "price_eur": product.get("price_eur"),
            "description": product.get("description", ""),
            "image_url": product.get("image_url", "/images/products/placeholder.png"),
            "image_file": product.get("image_file"),
            "in_stock": product.get("in_stock", True),
            "is_new": product.get("is_new", False),
            "is_bestseller": product.get("is_bestseller", False),
            "rating": product.get("rating"),
            "review_count": product.get("review_count", 0),
            "created_at": now,
            "updated_at": now
        }
        products_to_insert.append(clean_product)
    
    # Insérer tous les produits
    result = await db.products.insert_many(products_to_insert)
    print(f"✅ {len(result.inserted_ids)} produits importés avec succès!")
    
    # Vérification
    count = await db.products.count_documents({})
    print(f"📊 Total produits en base: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(import_products())