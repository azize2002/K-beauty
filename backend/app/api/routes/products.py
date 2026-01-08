"""Product routes - Reading from MongoDB."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pymongo import MongoClient
from app.models.product import Product
from app.schemas.product import ProductListResponse, BrandWithCount, CategoryWithCount

router = APIRouter()

# Connexion MongoDB synchrone
mongo_client = MongoClient("mongodb://localhost:27017")
db = mongo_client.kbeauty


def load_products_from_json():
    """Kept for compatibility - now we use MongoDB directly."""
    count = db.products.count_documents({})
    print(f"✅ Products API configured to read from MongoDB ({count} products)")
    return count


@router.get("/products", response_model=ProductListResponse)
async def get_products(
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    min_price: Optional[int] = Query(None, description="Minimum price filter (TND)"),
    max_price: Optional[int] = Query(None, description="Maximum price filter (TND)"),
    search: Optional[str] = Query(None, description="Search in product name"),
    limit: int = Query(20, ge=1, le=500, description="Number of products to return"),
    offset: int = Query(0, ge=0, description="Number of products to skip")
):
    """Get all products with optional filters from MongoDB."""
    
    # Build query filter
    query = {}
    
    if brand:
        # Case-insensitive brand search
        query["brand"] = {"$regex": f"^{brand}$", "$options": "i"}
    
    if category:
        # Case-insensitive category search
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    if min_price is not None:
        query["price_tnd"] = {"$gte": min_price}
    
    if max_price is not None:
        if "price_tnd" in query:
            query["price_tnd"]["$lte"] = max_price
        else:
            query["price_tnd"] = {"$lte": max_price}
    
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    # Get total count
    total = db.products.count_documents(query)
    
    # Get products with pagination
    cursor = db.products.find(query).skip(offset).limit(limit)
    products = list(cursor)
    
    # Convert MongoDB documents to Product models
    product_models = []
    for p in products:
        product_data = {
            "id": p.get("id"),
            "name": p.get("name"),
            "brand": p.get("brand"),
            "category": p.get("category"),
            "price_tnd": p.get("price_tnd", 0),
            "price": p.get("price_tnd", 0),
            "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "discount_percentage": p.get("discount_percentage", 0),
            "description": p.get("description", ""),
            "image_url": p.get("image_url", "/images/products/placeholder.png"),
            "volume": p.get("format") or p.get("volume", ""),
            "in_stock": p.get("in_stock", True),
            "is_new": p.get("is_new", False),
            "is_bestseller": p.get("is_bestseller", False),
            "rating": p.get("rating"),
            "review_count": p.get("review_count", 0),
        }
        product_models.append(Product(**product_data))
    
    return ProductListResponse(
        products=product_models,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/products/bestsellers", response_model=List[Product])
async def get_bestsellers(
    limit: int = Query(8, ge=1, le=20, description="Number of bestsellers to return")
):
    """Get bestseller products only from MongoDB."""
    
    cursor = db.products.find({"is_bestseller": True}).limit(limit)
    products = list(cursor)
    
    product_models = []
    for p in products:
        product_data = {
            "id": p.get("id"),
            "name": p.get("name"),
            "brand": p.get("brand"),
            "category": p.get("category"),
            "price_tnd": p.get("price_tnd", 0),
            "price": p.get("price_tnd", 0),
            "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "discount_percentage": p.get("discount_percentage", 0),
            "description": p.get("description", ""),
            "image_url": p.get("image_url", "/images/products/placeholder.png"),
            "volume": p.get("format") or p.get("volume", ""),
            "in_stock": p.get("in_stock", True),
            "is_new": p.get("is_new", False),
            "is_bestseller": p.get("is_bestseller", False),
            "rating": p.get("rating"),
            "review_count": p.get("review_count", 0),
        }
        product_models.append(Product(**product_data))
    
    return product_models


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID from MongoDB."""
    
    p = db.products.find_one({"id": product_id})
    
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = {
        "id": p.get("id"),
        "name": p.get("name"),
        "brand": p.get("brand"),
        "category": p.get("category"),
        "price_tnd": p.get("price_tnd", 0),
        "price": p.get("price_tnd", 0),
        "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
        "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
        "discount_percentage": p.get("discount_percentage", 0),
        "description": p.get("description", ""),
        "image_url": p.get("image_url", "/images/products/placeholder.png"),
        "volume": p.get("format") or p.get("volume", ""),
        "in_stock": p.get("in_stock", True),
        "is_new": p.get("is_new", False),
        "is_bestseller": p.get("is_bestseller", False),
        "rating": p.get("rating"),
        "review_count": p.get("review_count", 0),
    }
    
    return Product(**product_data)


@router.get("/brands", response_model=List[BrandWithCount])
async def get_brands():
    """Get all unique brands with product count from MongoDB."""
    
    # Aggregation to count products per brand
    pipeline = [
        {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    result = list(db.products.aggregate(pipeline))
    
    brands = []
    for item in result:
        if item["_id"]:  # Skip None brands
            brand = BrandWithCount(
                name=item["_id"],
                slug=item["_id"].lower().replace(" ", "-"),
                logo_url="",
                product_count=item["count"]
            )
            brands.append(brand)
    
    return brands


@router.get("/categories", response_model=List[CategoryWithCount])
async def get_categories():
    """Get all unique categories with product count from MongoDB."""
    
    # Aggregation to count products per category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    result = list(db.products.aggregate(pipeline))
    
    categories = []
    for item in result:
        if item["_id"]:  # Skip None categories
            category = CategoryWithCount(
                name=item["_id"],
                slug=item["_id"].lower().replace(" ", "-"),
                image_url="",
                product_count=item["count"]
            )
            categories.append(category)
    
    return categories