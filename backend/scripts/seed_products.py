"""Script to seed products in the database."""
import json
import os
import sys
from pathlib import Path
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

# Get MongoDB connection string from environment
MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = os.environ.get('DB_NAME', 'kbeauty')

if not MONGO_URI:
    logger.error("MONGO_URI environment variable is not set")
    sys.exit(1)

# Path to products.json
PRODUCTS_JSON_PATH = Path(__file__).parent.parent / 'data' / 'products.json'


def load_products():
    """Load products from JSON file."""
    try:
        with open(PRODUCTS_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        products = data.get('products', [])
        logger.info(f"Loaded {len(products)} products from {PRODUCTS_JSON_PATH}")
        return products
    except FileNotFoundError:
        logger.error(f"Products file not found: {PRODUCTS_JSON_PATH}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON file: {e}")
        sys.exit(1)


def connect_to_mongodb():
    """Connect to MongoDB and return database instance."""
    try:
        client = MongoClient(MONGO_URI)
        # Test connection
        client.admin.command('ping')
        db = client[DB_NAME]
        logger.info(f"Connected to MongoDB: {DB_NAME}")
        return client, db
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)


def create_indexes(collection):
    """Create indexes on brand, category, and price."""
    try:
        # Create index on brand
        collection.create_index("brand", name="brand_idx")
        logger.info("Created index on 'brand'")
        
        # Create index on category
        collection.create_index("category", name="category_idx")
        logger.info("Created index on 'category'")
        
        # Create index on price
        collection.create_index("price", name="price_idx")
        logger.info("Created index on 'price'")
        
        # Create compound index for common queries (optional but useful)
        collection.create_index([("brand", 1), ("category", 1)], name="brand_category_idx")
        logger.info("Created compound index on 'brand' and 'category'")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise


def seed_products(db):
    """Seed products into the database with upsert."""
    collection = db['products']
    
    # Load products
    products = load_products()
    
    if not products:
        logger.warning("No products to insert")
        return 0
    
    # Create indexes
    logger.info("Creating indexes...")
    create_indexes(collection)
    
    # Insert/update products with upsert
    inserted_count = 0
    updated_count = 0
    
    logger.info("Inserting/updating products...")
    for product in products:
        try:
            # Use product id as the unique identifier for upsert
            product_id = product.get('id')
            if not product_id:
                logger.warning(f"Product missing id, skipping: {product.get('name', 'Unknown')}")
                continue
            
            # Prepare product document
            # Convert datetime strings to datetime objects if needed
            # MongoDB will handle the rest
            result = collection.update_one(
                {'id': product_id},
                {'$set': product},
                upsert=True
            )
            
            if result.upserted_id:
                inserted_count += 1
            else:
                updated_count += 1
                
        except Exception as e:
            logger.error(f"Error inserting product {product.get('name', 'Unknown')}: {e}")
            continue
    
    total_processed = inserted_count + updated_count
    logger.info(f"Seeding completed:")
    logger.info(f"  - Products inserted: {inserted_count}")
    logger.info(f"  - Products updated: {updated_count}")
    logger.info(f"  - Total processed: {total_processed}")
    
    return inserted_count


def main():
    """Main function to run the seeding script."""
    logger.info("Starting product seeding script...")
    
    # Connect to MongoDB
    client, db = connect_to_mongodb()
    
    try:
        # Seed products
        inserted_count = seed_products(db)
        
        logger.info(f"Successfully seeded {inserted_count} products")
        
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        sys.exit(1)
    finally:
        # Close connection
        client.close()
        logger.info("Database connection closed")


if __name__ == '__main__':
    main()
