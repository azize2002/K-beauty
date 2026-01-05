"""Product routes."""
from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import json
from typing import List, Optional
from datetime import datetime

from app.models.product import Product
from app.schemas.product import ProductListResponse, BrandWithCount, CategoryWithCount

router = APIRouter()

# In-memory storage for products
products_store: List[dict] = []


def load_products_from_json():
    """Load products from JSON file."""
    global products_store
    
    # Get the path to products.json relative to this file
    backend_dir = Path(__file__).parent.parent.parent.parent
    products_file = backend_dir / "data" / "products.json"
    
    try:
        with open(products_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            products = data.get("products", [])
            
            # Convert datetime strings to datetime objects and map fields
            for product in products:
                # Map "format" to "volume" if format exists and volume doesn't
                if "format" in product and "volume" not in product:
                    product["volume"] = product["format"]
                
                if "created_at" in product and isinstance(product["created_at"], str):
                    try:
                        product["created_at"] = datetime.fromisoformat(product["created_at"].replace("Z", "+00:00"))
                    except (ValueError, AttributeError):
                        pass  # Keep as string if parsing fails
                if "updated_at" in product and isinstance(product["updated_at"], str):
                    try:
                        product["updated_at"] = datetime.fromisoformat(product["updated_at"].replace("Z", "+00:00"))
                    except (ValueError, AttributeError):
                        pass  # Keep as string if parsing fails
            
            products_store = products
        return len(products_store)
    except FileNotFoundError:
        print(f"Warning: Products file not found at {products_file}")
        products_store = []
        return 0
    except json.JSONDecodeError as e:
        print(f"Error parsing products.json: {e}")
        products_store = []
        return 0




@router.get("/products", response_model=ProductListResponse)
async def get_products(
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    min_price: Optional[int] = Query(None, description="Minimum price filter"),
    max_price: Optional[int] = Query(None, description="Maximum price filter"),
    search: Optional[str] = Query(None, description="Search in product name"),
    limit: int = Query(20, ge=1, le=500, description="Number of products to return"),
    offset: int = Query(0, ge=0, description="Number of products to skip")
):
    """Get all products with optional filters."""
    # Filter products
    filtered_products = products_store.copy()
    
    if brand:
        filtered_products = [p for p in filtered_products if p.get("brand", "").lower() == brand.lower()]
    
    if category:
        filtered_products = [p for p in filtered_products if p.get("category", "").lower() == category.lower()]
    
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p.get("price", 0) >= min_price]
    
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p.get("price", float("inf")) <= max_price]
    
    if search:
        search_lower = search.lower()
        filtered_products = [
            p for p in filtered_products 
            if search_lower in p.get("name", "").lower()
        ]
    
    # Get total count before pagination
    total = len(filtered_products)
    
    # Apply pagination
    paginated_products = filtered_products[offset:offset + limit]
    
    # Convert to Pydantic models
    product_models = [Product(**product) for product in paginated_products]
    
    return ProductListResponse(
        products=product_models,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID."""
    product = next((p for p in products_store if p.get("id") == product_id), None)
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Product(**product)


@router.get("/brands", response_model=List[BrandWithCount])
async def get_brands():
    """Get all unique brands with product count."""
    # Count products per brand
    brand_counts = {}
    for product in products_store:
        brand_name = product.get("brand")
        if brand_name:
            brand_counts[brand_name] = brand_counts.get(brand_name, 0) + 1
    
    # Create brand objects with counts
    brands = []
    for brand_name in sorted(brand_counts.keys()):
        brand = BrandWithCount(
            name=brand_name,
            slug=brand_name.lower().replace(" ", "-"),
            logo_url="",  # Logo URL would need to be stored separately
            product_count=brand_counts[brand_name]
        )
        brands.append(brand)
    
    return brands


@router.get("/categories", response_model=List[CategoryWithCount])
async def get_categories():
    """Get all unique categories with product count."""
    # Count products per category
    category_counts = {}
    for product in products_store:
        category_name = product.get("category")
        if category_name:
            category_counts[category_name] = category_counts.get(category_name, 0) + 1
    
    # Create category objects with counts
    categories = []
    for category_name in sorted(category_counts.keys()):
        category = CategoryWithCount(
            name=category_name,
            slug=category_name.lower().replace(" ", "-"),
            image_url="",  # Image URL would need to be stored separately
            product_count=category_counts[category_name]
        )
        categories.append(category)
    
    return categories
