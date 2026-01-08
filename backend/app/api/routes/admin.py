"""Admin routes."""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from app.db.connection import get_database
from app.api.routes.auth import get_current_user
from app.models.order import OrderStatus

router = APIRouter(prefix="/api/admin", tags=["admin"])


# Middleware pour vérifier si l'utilisateur est admin
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


# Schemas
class UpdateOrderStatus(BaseModel):
    status: str


class ProductCreate(BaseModel):
    name: str
    brand: str
    category: str
    price_tnd: int
    original_price_tnd: Optional[int] = None
    discount_percentage: Optional[int] = 0
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    volume: Optional[str] = ""
    in_stock: Optional[bool] = True
    is_new: Optional[bool] = False
    is_bestseller: Optional[bool] = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price_tnd: Optional[int] = None
    original_price_tnd: Optional[int] = None
    discount_percentage: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    volume: Optional[str] = None
    in_stock: Optional[bool] = None
    is_new: Optional[bool] = None
    is_bestseller: Optional[bool] = None


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_dashboard(admin: dict = Depends(require_admin)):
    """Get admin dashboard statistics."""
    db = await get_database()
    
    # Total des commandes
    total_orders = await db.orders.count_documents({})
    
    # Commandes par statut
    pending_orders = await db.orders.count_documents({"status": "pending"})
    confirmed_orders = await db.orders.count_documents({"status": "confirmed"})
    delivered_orders = await db.orders.count_documents({"status": "delivered"})
    
    # Chiffre d'affaires (commandes livrées)
    pipeline = [
        {"$match": {"status": "delivered"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_tnd"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Chiffre d'affaires potentiel (toutes commandes sauf annulées)
    pipeline_potential = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_tnd"}}}
    ]
    potential_result = await db.orders.aggregate(pipeline_potential).to_list(1)
    potential_revenue = potential_result[0]["total"] if potential_result else 0
    
    # Nombre de produits
    total_products = await db.products.count_documents({})
    
    # Nombre d'utilisateurs (clients uniquement)
    total_users = await db.users.count_documents({"role": "client"})
    
    # Top 8 produits les plus vendus
    top_products_pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_id",
            "product_name": {"$first": "$items.product_name"},
            "product_image": {"$first": "$items.product_image"},
            "brand": {"$first": "$items.brand"},
            "total_sold": {"$sum": "$items.quantity"}
        }},
        {"$sort": {"total_sold": -1}},
        {"$limit": 8}
    ]
    top_products = await db.orders.aggregate(top_products_pipeline).to_list(8)
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "delivered_orders": delivered_orders,
        "total_revenue": total_revenue,
        "potential_revenue": potential_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "top_products": top_products
    }


# ==================== COMMANDES ====================

@router.get("/orders")
async def get_all_orders(
    status: Optional[str] = None,
    limit: int = 50,
    admin: dict = Depends(require_admin)
):
    """Get all orders (admin only)."""
    db = await get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query).sort("created_at", -1).to_list(limit)
    
    for order in orders:
        order.pop("_id", None)
    
    return orders


@router.get("/orders/{order_id}")
async def get_order_details(order_id: str, admin: dict = Depends(require_admin)):
    """Get order details (admin only)."""
    db = await get_database()
    
    order = await db.orders.find_one({"id": order_id})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    order.pop("_id", None)
    return order


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    data: UpdateOrderStatus,
    admin: dict = Depends(require_admin)
):
    """Update order status (admin only)."""
    db = await get_database()
    
    valid_statuses = [s.value for s in OrderStatus]
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}"
        )
    
    update_data = {
        "status": data.status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if data.status == "confirmed":
        update_data["confirmed_at"] = datetime.now(timezone.utc)
    elif data.status == "delivered":
        update_data["delivered_at"] = datetime.now(timezone.utc)
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commande non trouvée"
        )
    
    return {"message": "Statut mis à jour", "status": data.status}


# ==================== PRODUITS ====================

@router.get("/products")
async def get_all_products_admin(
    limit: int = 200,
    admin: dict = Depends(require_admin)
):
    """Get all products (admin only)."""
    db = await get_database()
    
    products = await db.products.find({}).to_list(limit)
    
    for product in products:
        product.pop("_id", None)
    
    return products


@router.post("/products")
async def create_product(
    product_data: ProductCreate,
    admin: dict = Depends(require_admin)
):
    """Create a new product (admin only)."""
    db = await get_database()
    
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Calculer le prix si promo
    original_price = product_data.original_price_tnd or product_data.price_tnd
    if product_data.discount_percentage and product_data.discount_percentage > 0:
        price = int(original_price * (1 - product_data.discount_percentage / 100))
    else:
        price = product_data.price_tnd
    
    product = {
        "id": product_id,
        "name": product_data.name,
        "brand": product_data.brand,
        "category": product_data.category,
        "price_tnd": price,
        "original_price_tnd": original_price,
        "discount_percentage": product_data.discount_percentage or 0,
        "description": product_data.description or "",
        "image_url": product_data.image_url or "",
        "volume": product_data.volume or "",
        "in_stock": product_data.in_stock if product_data.in_stock is not None else True,
        "is_new": product_data.is_new or False,
        "is_bestseller": product_data.is_bestseller or False,
        "created_at": now,
        "updated_at": now
    }
    
    await db.products.insert_one(product)
    
    product.pop("_id", None)
    return product


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    admin: dict = Depends(require_admin)
):
    """Update product (admin only)."""
    db = await get_database()
    
    # Get current product
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    update_data = {"updated_at": datetime.now(timezone.utc)}
    
    # Update fields if provided
    if data.name is not None:
        update_data["name"] = data.name
    if data.brand is not None:
        update_data["brand"] = data.brand
    if data.category is not None:
        update_data["category"] = data.category
    if data.description is not None:
        update_data["description"] = data.description
    if data.image_url is not None:
        update_data["image_url"] = data.image_url
    if data.volume is not None:
        update_data["volume"] = data.volume
    if data.in_stock is not None:
        update_data["in_stock"] = data.in_stock
    if data.is_new is not None:
        update_data["is_new"] = data.is_new
    if data.is_bestseller is not None:
        update_data["is_bestseller"] = data.is_bestseller
    
    # Handle price and promo
    if data.original_price_tnd is not None:
        update_data["original_price_tnd"] = data.original_price_tnd
    if data.discount_percentage is not None:
        update_data["discount_percentage"] = data.discount_percentage
    if data.price_tnd is not None:
        update_data["price_tnd"] = data.price_tnd
    
    # Recalculate price if promo changed
    if data.discount_percentage is not None:
        original = data.original_price_tnd or product.get("original_price_tnd") or product.get("price_tnd")
        if data.discount_percentage > 0:
            update_data["price_tnd"] = int(original * (1 - data.discount_percentage / 100))
            update_data["original_price_tnd"] = original
        else:
            update_data["price_tnd"] = original
            update_data["discount_percentage"] = 0
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    return {"message": "Produit mis à jour"}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    """Delete a product (admin only)."""
    db = await get_database()
    
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    return {"message": "Produit supprimé"}


@router.post("/products/{product_id}/toggle-bestseller")
async def toggle_bestseller(product_id: str, admin: dict = Depends(require_admin)):
    """Toggle product bestseller status."""
    db = await get_database()
    
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    new_status = not product.get("is_bestseller", False)
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_bestseller": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Statut best-seller mis à jour", "is_bestseller": new_status}


@router.post("/products/{product_id}/toggle-new")
async def toggle_new(product_id: str, admin: dict = Depends(require_admin)):
    """Toggle product new status."""
    db = await get_database()
    
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    new_status = not product.get("is_new", False)
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_new": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Statut nouveau mis à jour", "is_new": new_status}


@router.post("/products/{product_id}/toggle-stock")
async def toggle_stock(product_id: str, admin: dict = Depends(require_admin)):
    """Toggle product stock status."""
    db = await get_database()
    
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    new_status = not product.get("in_stock", True)
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"in_stock": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Statut stock mis à jour", "in_stock": new_status}


# ==================== CLIENTS ====================

@router.get("/clients")
async def get_all_clients(admin: dict = Depends(require_admin)):
    """Get all clients (admin only)."""
    db = await get_database()
    
    # Get all clients
    clients = await db.users.find({"role": "client"}).to_list(100)
    
    result = []
    for client in clients:
        # Count orders for each client
        orders_count = await db.orders.count_documents({"user_id": client["id"]})
        
        # Calculate total spent
        pipeline = [
            {"$match": {"user_id": client["id"], "status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_tnd"}}}
        ]
        total_result = await db.orders.aggregate(pipeline).to_list(1)
        total_spent = total_result[0]["total"] if total_result else 0
        
        result.append({
            "id": client["id"],
            "email": client["email"],
            "first_name": client["first_name"],
            "last_name": client["last_name"],
            "phone": client["phone"],
            "created_at": client["created_at"],
            "orders_count": orders_count,
            "total_spent": total_spent
        })
    
    return result


@router.get("/clients/{client_id}")
async def get_client_details(client_id: str, admin: dict = Depends(require_admin)):
    """Get client details with orders (admin only)."""
    db = await get_database()
    
    client = await db.users.find_one({"id": client_id, "role": "client"})
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    # Get client orders
    orders = await db.orders.find({"user_id": client_id}).sort("created_at", -1).to_list(50)
    
    for order in orders:
        order.pop("_id", None)
    
    return {
        "id": client["id"],
        "email": client["email"],
        "first_name": client["first_name"],
        "last_name": client["last_name"],
        "phone": client["phone"],
        "created_at": client["created_at"],
        "orders": orders
    }