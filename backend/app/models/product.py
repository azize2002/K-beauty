"""Product model."""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid

class Product(BaseModel):
    """Product model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    brand: str
    category: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = None
    volume: Optional[str] = None
    image_url: str
    rating: Optional[float] = None
    review_count: Optional[int] = None
    is_new: bool = False
    is_bestseller: bool = False  # ✅ NOUVEAU CHAMP
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))