"""Product schemas for API responses."""
from pydantic import BaseModel
from typing import List, Optional
from app.models.product import Product
from app.models.brand import Brand
from app.models.category import Category


class ProductListResponse(BaseModel):
    """Response model for product list with pagination."""
    products: List[Product]
    total: int
    limit: int
    offset: int


class BrandWithCount(BaseModel):
    """Brand model with product count."""
    name: str
    slug: str
    logo_url: str
    product_count: int


class CategoryWithCount(BaseModel):
    """Category model with product count."""
    name: str
    slug: str
    image_url: str
    product_count: int

