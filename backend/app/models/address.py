"""Address model."""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import Optional
import uuid

class Address(BaseModel):
    """Shipping address model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    postal_code: str
    governorate: str  # Gouvernorat en Tunisie
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddressCreate(BaseModel):
    """Address creation model."""
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    postal_code: str
    governorate: str
    is_default: bool = False