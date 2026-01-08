"""Main application entry point."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import logging
from pathlib import Path

from app.core.config import CORS_ORIGINS, LOG_LEVEL
from app.db.connection import close_database
from app.api.routes import api_router
from app.api.routes.auth import router as auth_router
from app.api.routes.products import load_products_from_json
from app.api.routes.orders import router as orders_router
from app.api.routes.admin import router as admin_router
# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(
    title="K-Beauty API",
    description="API for K-Beauty e-commerce platform",
    version="1.0.0"
)

# Add CORS middleware FIRST (before routes)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(admin_router)
# Serve static files (images) from frontend/public/images
images_path = Path(__file__).parent.parent / "frontend" / "public" / "images"
if images_path.exists():
    app.mount("/images", StaticFiles(directory=str(images_path)), name="images")
    logger.info(f"✅ Serving static images from: {images_path}")
else:
    logger.warning(f"⚠️  Images directory not found at: {images_path}")


@app.on_event("startup")
async def startup_event():
    """Load products from JSON file at startup."""
    try:
        count = load_products_from_json()
        logger.info(f"✅ Loaded {count} products from JSON file with TND pricing")
    except Exception as e:
        logger.error(f"❌ Error loading products: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown."""
    await close_database()
    logger.info("Application shutdown complete")


# Root endpoint for testing
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "K-Beauty API is running",
        "docs": "/docs",
        "api": "/api"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}