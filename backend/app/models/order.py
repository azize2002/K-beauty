"""Order models."""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
from typing import List, Optional
from enum import Enum
import uuid

class OrderStatus(str, Enum):
    """Order status."""
    PENDING = "pending"           # En attente
    CONFIRMED = "confirmed"       # Confirmée
    PREPARING = "preparing"       # En préparation
    SHIPPED = "shipped"           # Expédiée
    DELIVERED = "delivered"       # Livrée
    CANCELLED = "cancelled"       # Annulée

class PaymentMethod(str, Enum):
    """Payment methods."""
    CASH_ON_DELIVERY = "cash_on_delivery"  # Paiement à la livraison
    CARD = "card"                          # Carte bancaire (futur)

class OrderItem(BaseModel):
    """Order item model."""
    product_id: str
    product_name: str
    product_image: str
    brand: str
    quantity: int
    unit_price_tnd: int
    total_price_tnd: int

class Order(BaseModel):
    """Order model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str  # Format: ORD-20250107-XXXX
    user_id: str
    
    # Items
    items: List[OrderItem]
    
    # Pricing
    subtotal_tnd: int
    delivery_fee_tnd: int = 7  # Frais de livraison (à ajuster)
    discount_tnd: int = 0
    total_tnd: int
    
    # Shipping
    shipping_address: dict  # Address complète
    phone: str
    delivery_notes: Optional[str] = None
    
    # Payment
    payment_method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY
    
    # Status
    status: OrderStatus = OrderStatus.PENDING
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    confirmed_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class OrderCreate(BaseModel):
    """Order creation model."""
    items: List[OrderItem]
    shipping_address: dict
    phone: str
    delivery_notes: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY

class OrderStatusUpdate(BaseModel):
    """Order status update model."""
    status: OrderStatus