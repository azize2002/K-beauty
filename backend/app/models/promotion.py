"""Promotion model for admin management."""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid

class Promotion(BaseModel):
    """Promotion model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    discount_percentage: int  # 10, 20, 30, etc.
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by: str  # Admin user ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PromotionCreate(BaseModel):
    """Promotion creation model."""
    product_id: str
    discount_percentage: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None