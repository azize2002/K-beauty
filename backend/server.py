"""Main application entry point."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
from app.core.config import CORS_ORIGINS, LOG_LEVEL
from app.db.connection import close_database
from app.api.routes import api_router
from app.api.routes.products import load_products_from_json

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI()

# Include API router
app.include_router(api_router)

# Serve static files (images) from frontend/public/images
images_path = Path(__file__).parent.parent / "frontend" / "public" / "images"
if images_path.exists():
    app.mount("/images", StaticFiles(directory=str(images_path)), name="images")
    logger.info(f"Serving static images from: {images_path}")
else:
    logger.warning(f"Images directory not found at: {images_path}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Load products from JSON file at startup."""
    count = load_products_from_json()
    logger.info(f"Loaded {count} products from JSON file")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown."""
    await close_database()
    logger.info("Application shutdown complete")