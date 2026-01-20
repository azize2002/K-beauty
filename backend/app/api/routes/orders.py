"""Order routes."""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from app.db.connection import get_database
from app.api.routes.auth import get_current_user
from app.models.order import OrderStatus, PaymentMethod

router = APIRouter(prefix="/api/orders", tags=["orders"])


# Schemas
class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    brand: str
    quantity: int
    unit_price_tnd: int


class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    postal_code: str
    governorate: str


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: ShippingAddress
    delivery_notes: Optional[str] = None
    payment_method: str = "cash_on_delivery"


class OrderResponse(BaseModel):
    id: str
    order_number: str
    status: str
    total_tnd: int
    created_at: datetime


class StatusUpdate(BaseModel):
    status: str


# Helper function to generate order number
def generate_order_number():
    """Generate unique order number: ORD-YYYYMMDD-XXXX"""
    now = datetime.now(timezone.utc)
    date_part = now.strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:4].upper()
    return f"ORD-{date_part}-{random_part}"


# Routes
@router.post("/", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create a new order."""
    db = await get_database()
    
    # Validate items
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le panier est vide"
        )
    
    # Calculate totals
    subtotal = sum(item.unit_price_tnd * item.quantity for item in order_data.items)
    delivery_fee = 0 if subtotal >= 100 else 7
    total = subtotal + delivery_fee
    
    # Create order
    order_id = str(uuid.uuid4())
    order_number = generate_order_number()
    now = datetime.now(timezone.utc)
    
    order = {
        "id": order_id,
        "order_number": order_number,
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "user_phone": current_user.get("phone", ""),
        "user_name": f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip(),
        "items": [item.dict() for item in order_data.items],
        "subtotal_tnd": subtotal,
        "delivery_fee_tnd": delivery_fee,
        "discount_tnd": 0,
        "total_tnd": total,
        "shipping_address": order_data.shipping_address.dict(),
        "delivery_notes": order_data.delivery_notes,
        "payment_method": order_data.payment_method,
        "status": OrderStatus.PENDING.value,
        "status_history": [
            {
                "status": OrderStatus.PENDING.value,
                "changed_at": now,
                "changed_by": "system"
            }
        ],
        "created_at": now,
        "updated_at": now,
        "confirmed_at": None,
        "delivered_at": None
    }
    
    await db.orders.insert_one(order)
    
    return OrderResponse(
        id=order_id,
        order_number=order_number,
        status=OrderStatus.PENDING.value,
        total_tnd=total,
        created_at=now
    )


@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders."""
    db = await get_database()
    
    orders = await db.orders.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(100)
    
    return [
        {
            "id": order["id"],
            "order_number": order["order_number"],
            "status": order["status"],
            "total_tnd": order["total_tnd"],
            "items_count": len(order["items"]),
            "created_at": order["created_at"]
        }
        for order in orders
    ]


@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get order details."""
    db = await get_database()
    
    # Si admin, peut voir n'importe quelle commande
    if current_user.get("role") == "admin":
        order = await db.orders.find_one({"id": order_id})
    else:
        # Sinon, seulement ses propres commandes
        order = await db.orders.find_one({
            "id": order_id,
            "user_id": current_user["id"]
        })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    # Remove MongoDB _id
    order.pop("_id", None)
    
    return order


@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel an order (only if pending or confirmed)."""
    db = await get_database()
    
    # Trouver la commande de l'utilisateur
    order = await db.orders.find_one({
        "id": order_id,
        "user_id": current_user["id"]
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    # Vérifier si la commande peut être annulée
    cancellable_statuses = [OrderStatus.PENDING.value, OrderStatus.CONFIRMED.value]
    if order["status"] not in cancellable_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette commande ne peut plus être annulée. Elle est déjà en préparation ou livrée."
        )
    
    now = datetime.now(timezone.utc)
    
    # Mettre à jour le statut
    status_history = order.get("status_history", [])
    status_history.append({
        "status": OrderStatus.CANCELLED.value,
        "changed_at": now,
        "changed_by": "client"
    })
    
    await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "status": OrderStatus.CANCELLED.value,
                "status_history": status_history,
                "updated_at": now,
                "cancelled_at": now,
                "cancelled_by": "client"
            }
        }
    )
    
    return {"message": "Commande annulée avec succès", "status": OrderStatus.CANCELLED.value}


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str, 
    status_data: StatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update order status (admin only)."""
    db = await get_database()
    
    # Vérifier que l'utilisateur est admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Trouver la commande
    order = await db.orders.find_one({"id": order_id})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    # Valider le nouveau statut
    valid_statuses = [s.value for s in OrderStatus]
    if status_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Statut invalide. Statuts valides: {valid_statuses}"
        )
    
    now = datetime.now(timezone.utc)
    
    # Préparer les mises à jour
    updates = {
        "status": status_data.status,
        "updated_at": now
    }
    
    # Ajouter des timestamps spécifiques selon le statut
    if status_data.status == OrderStatus.CONFIRMED.value:
        updates["confirmed_at"] = now
    elif status_data.status == OrderStatus.DELIVERED.value:
        updates["delivered_at"] = now
    elif status_data.status == OrderStatus.CANCELLED.value:
        updates["cancelled_at"] = now
        updates["cancelled_by"] = "admin"
    
    # Ajouter à l'historique
    status_history = order.get("status_history", [])
    status_history.append({
        "status": status_data.status,
        "changed_at": now,
        "changed_by": f"admin:{current_user['email']}"
    })
    updates["status_history"] = status_history
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": updates}
    )
    
    return {
        "message": "Statut mis à jour avec succès",
        "order_id": order_id,
        "new_status": status_data.status
    }


@router.get("/")
async def get_all_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all orders (admin only)."""
    db = await get_database()
    
    # Vérifier que l'utilisateur est admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Construire le filtre
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(500)
    
    return [
        {
            "id": order["id"],
            "order_number": order["order_number"],
            "user_name": order.get("user_name", order.get("user_email", "Client")),
            "user_email": order["user_email"],
            "user_phone": order.get("user_phone", ""),
            "status": order["status"],
            "total_tnd": order["total_tnd"],
            "items_count": len(order["items"]),
            "items": order["items"],
            "shipping_address": order.get("shipping_address", {}),
            "delivery_notes": order.get("delivery_notes", ""),
            "created_at": order["created_at"]
        }
        for order in orders
    ]