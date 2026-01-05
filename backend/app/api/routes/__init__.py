"""API routes package."""
from fastapi import APIRouter
from . import status, products, categories, brands, cart, orders, users, reviews, diagnostic

api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(status.router, tags=["status"])
api_router.include_router(products.router, tags=["products"])
api_router.include_router(categories.router, tags=["categories"])
api_router.include_router(brands.router, tags=["brands"])
api_router.include_router(cart.router, tags=["cart"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(reviews.router, tags=["reviews"])
api_router.include_router(diagnostic.router, tags=["diagnostic"])

