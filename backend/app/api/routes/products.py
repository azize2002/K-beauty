"""Product routes - Reading from MongoDB with STRICT Search."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pymongo import MongoClient
from pathlib import Path
import json
import unicodedata
from difflib import SequenceMatcher
from app.models.product import Product
from app.schemas.product import ProductListResponse, BrandWithCount, CategoryWithCount

router = APIRouter()

# Connexion MongoDB synchrone
mongo_client = MongoClient("mongodb://localhost:27017")
db = mongo_client.kbeauty


# ============================================
# MAPPINGS STRICTS
# ============================================

# Catégories : terme recherché -> catégorie MongoDB exacte
CATEGORY_MAPPINGS = {
    # Sérums
    'serum': 'Serum',
    'serums': 'Serum',
    'sérum': 'Serum',
    'sérums': 'Serum',
    'seurm': 'Serum',  # Faute courante
    
    # Crèmes / Moisturizers
    'creme': 'Moisturizer',
    'crème': 'Moisturizer',
    'cremes': 'Moisturizer',
    'cream': 'Moisturizer',
    'moisturizer': 'Moisturizer',
    'hydratant': 'Moisturizer',
    
    # Nettoyants
    'nettoyant': 'Foam Cleanser',
    'nettoyants': 'Foam Cleanser',
    'cleanser': 'Foam Cleanser',
    'foam': 'Foam Cleanser',
    'mousse': 'Foam Cleanser',
    
    # Masques
    'masque': 'Sheet Mask',
    'masques': 'Sheet Mask',
    'mask': 'Sheet Mask',
    'masks': 'Sheet Mask',
    'sheet mask': 'Sheet Mask',
    
    # Solaire
    'solaire': 'Sunscreen',
    'sunscreen': 'Sunscreen',
    'spf': 'Sunscreen',
    'sun': 'Sunscreen',
    'protection': 'Sunscreen',
    
    # Toners
    'toner': 'Toner',
    'toners': 'Toner',
    'tonique': 'Toner',
    'toniques': 'Toner',
    'lotion': 'Toner',
    
    # Essences
    'essence': 'Essence',
    'essences': 'Essence',
    
    # Ampoules
    'ampoule': 'Ampoule',
    'ampoules': 'Ampoule',
    
    # Eye care
    'eye': 'Eye Cream',
    'yeux': 'Eye Cream',
    'contour': 'Eye Cream',
    'eye cream': 'Eye Cream',
    
    # Cleansing Oil
    'huile': 'Cleansing Oil',
    'oil': 'Cleansing Oil',
    'cleansing oil': 'Cleansing Oil',
    
    # Pads
    'pads': 'Toner Pads',
    'pad': 'Toner Pads',
    'toner pads': 'Toner Pads',
    
    # Peeling
    'peeling': 'Peeling Gel',
    'exfoliant': 'Peeling Gel',
    'gommage': 'Peeling Gel',
}

# Marques : variantes -> nom exact dans MongoDB
BRAND_MAPPINGS = {
    'cosrx': 'COSRX',
    'cos rx': 'COSRX',
    'cosrc': 'COSRX',
    
    'anua': 'ANUA',
    'annua': 'ANUA',
    'anuua': 'ANUA',
    
    'beauty of joseon': 'BEAUTY OF JOSEON',
    'boj': 'BEAUTY OF JOSEON',
    'joseon': 'BEAUTY OF JOSEON',
    
    'isntree': 'ISNTREE',
    'isn tree': 'ISNTREE',
    
    'mixsoon': 'MIXSOON',
    'mix soon': 'MIXSOON',
    
    'some by mi': 'SOME BY MI',
    'somebymi': 'SOME BY MI',
    
    'tirtir': 'TIRTIR',
    'tir tir': 'TIRTIR',
    
    'skin1004': 'SKIN1004',
    'skin 1004': 'SKIN1004',
    
    'numbuzin': 'NUMBUZIN',
    'numbuzine': 'NUMBUZIN',
    
    'torriden': 'TORRIDEN',
    'toridenn': 'TORRIDEN',
    
    'medicube': 'MEDICUBE',
    'medi cube': 'MEDICUBE',
    
    'round lab': 'ROUND LAB',
    'roundlab': 'ROUND LAB',
    
    'heimish': 'HEIMISH',
    'haruharu': 'HARUHARU WONDER',
    'haruharu wonder': 'HARUHARU WONDER',
    'klairs': 'DEAR KLAIRS',
    'dear klairs': 'DEAR KLAIRS',
    'purito': 'PURITO',
    'benton': 'BENTON',
    'iunik': 'IUNIK',
    'by wishtrend': 'BY WISHTREND',
    'wishtrend': 'BY WISHTREND',
}


def normalize_text(text):
    """Retire les accents d'un texte."""
    if not text:
        return ""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    ).lower()


def get_category_match(search_term):
    """Retourne la catégorie MongoDB si le terme correspond à une catégorie."""
    normalized = normalize_text(search_term)
    return CATEGORY_MAPPINGS.get(normalized)


def get_brand_match(search_term):
    """Retourne la marque MongoDB si le terme correspond à une marque."""
    normalized = normalize_text(search_term)
    return BRAND_MAPPINGS.get(normalized)


def fuzzy_ratio(s1, s2):
    """Calcule le ratio de similarité entre deux strings."""
    return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()


def search_products_strict(search_term, all_products):
    """
    Recherche STRICTE avec priorité claire :
    1. Match exact de catégorie
    2. Match exact de marque
    3. Match dans le nom du produit
    """
    if not search_term:
        return all_products
    
    search_lower = search_term.lower().strip()
    search_normalized = normalize_text(search_term)
    
    # 1. Vérifier si c'est une catégorie
    category_match = get_category_match(search_term)
    if category_match:
        # Retourner UNIQUEMENT les produits de cette catégorie
        return [p for p in all_products if p.get('category', '').lower() == category_match.lower()]
    
    # 2. Vérifier si c'est une marque
    brand_match = get_brand_match(search_term)
    if brand_match:
        # Retourner UNIQUEMENT les produits de cette marque
        return [p for p in all_products if p.get('brand', '').upper() == brand_match.upper()]
    
    # 3. Recherche dans le nom ET la marque (pas la description)
    results = []
    
    for product in all_products:
        name = product.get('name', '').lower()
        brand = product.get('brand', '').lower()
        name_normalized = normalize_text(name)
        brand_normalized = normalize_text(brand)
        
        score = 0
        
        # Match exact dans le nom (priorité haute)
        if search_lower in name or search_normalized in name_normalized:
            score = 100
            # Bonus si au début
            if name.startswith(search_lower) or name_normalized.startswith(search_normalized):
                score += 50
        
        # Match exact dans la marque
        elif search_lower in brand or search_normalized in brand_normalized:
            score = 80
            # Bonus si match exact de marque
            if brand == search_lower or brand_normalized == search_normalized:
                score += 40
        
        # Fuzzy match sur le nom (seuil élevé pour éviter faux positifs)
        elif len(search_term) >= 3:
            # Vérifier chaque mot du nom
            name_words = name.split()
            for word in name_words:
                ratio = fuzzy_ratio(search_normalized, normalize_text(word))
                if ratio > 0.8:  # Seuil strict
                    score = int(ratio * 60)
                    break
            
            # Fuzzy sur la marque
            if score == 0:
                ratio = fuzzy_ratio(search_normalized, brand_normalized)
                if ratio > 0.8:
                    score = int(ratio * 50)
        
        if score > 0:
            results.append((product, score))
    
    # Trier par score décroissant
    results.sort(key=lambda x: x[1], reverse=True)
    
    return [p for p, _ in results]


def get_search_suggestions(search_term, all_products):
    """Génère des suggestions de recherche."""
    if not search_term or len(search_term) < 2:
        return [], [], []
    
    search_lower = search_term.lower()
    search_normalized = normalize_text(search_term)
    
    suggestions = []
    brands = set()
    categories = set()
    
    # Suggestions de catégories
    for term, category in CATEGORY_MAPPINGS.items():
        if search_lower in term or search_normalized in normalize_text(term):
            categories.add(category)
    
    # Suggestions de marques
    for term, brand in BRAND_MAPPINGS.items():
        if search_lower in term or search_normalized in normalize_text(term):
            brands.add(brand)
    
    # Suggestions depuis les produits
    for product in all_products:
        name = product.get('name', '')
        brand = product.get('brand', '')
        
        name_lower = name.lower()
        brand_lower = brand.lower()
        
        # Match dans le nom
        if search_lower in name_lower or search_normalized in normalize_text(name_lower):
            suggestions.append(name[:60])
            if brand:
                brands.add(brand)
        
        # Match dans la marque
        elif search_lower in brand_lower or search_normalized in normalize_text(brand_lower):
            brands.add(brand)
    
    # Dédupliquer et limiter
    suggestions = list(dict.fromkeys(suggestions))[:8]
    brands = list(brands)[:5]
    categories = list(categories)[:5]
    
    return suggestions, list(brands), list(categories)


def load_products_from_json():
    """Load products from JSON file into MongoDB if collection is empty."""
    count = db.products.count_documents({})
    
    if count == 0:
        json_path = Path(__file__).parent.parent.parent.parent / "data" / "products.json"
        
        if not json_path.exists():
            print(f"⚠️  JSON file not found at: {json_path}")
            return 0
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        products = data.get('products', [])
        
        if products:
            docs = []
            for p in products:
                doc = {
                    "id": p.get("id"),
                    "ref": p.get("ref"),
                    "name": p.get("name"),
                    "brand": p.get("brand"),
                    "category": p.get("category"),
                    "category_fr": p.get("category_fr"),
                    "format": p.get("format"),
                    "price_tnd": p.get("price", p.get("price_tnd", 0)),
                    "original_price_tnd": p.get("original_price", p.get("original_price_tnd", 0)),
                    "discount_percentage": p.get("discount_percentage", 0),
                    "price_eur": p.get("price_eur"),
                    "image_url": p.get("image_url", "/images/products/placeholder.png"),
                    "image_file": p.get("image_file"),
                    "in_stock": p.get("in_stock", True),
                    "is_new": p.get("is_new", False),
                    "is_bestseller": p.get("is_bestseller", False),
                    "rating": p.get("rating"),
                    "review_count": p.get("review_count", 0),
                    "description": p.get("description", ""),
                    "description_short": p.get("description_short", ""),
                    "created_at": p.get("created_at"),
                    "updated_at": p.get("updated_at"),
                }
                docs.append(doc)
            
            db.products.insert_many(docs)
            count = len(docs)
            print(f"✅ Imported {count} products from JSON into MongoDB")
        else:
            print("⚠️  No products found in JSON file")
    
    print(f"✅ Products API configured to read from MongoDB ({count} products)")
    return count


# ============================================
# ROUTES API
# ============================================

@router.get("/products", response_model=ProductListResponse)
async def get_products(
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    min_price: Optional[int] = Query(None, description="Minimum price filter (TND)"),
    max_price: Optional[int] = Query(None, description="Maximum price filter (TND)"),
    search: Optional[str] = Query(None, description="Search in product name, brand, category"),
    limit: int = Query(20, ge=1, le=500, description="Number of products to return"),
    offset: int = Query(0, ge=0, description="Number of products to skip")
):
    """Get all products with optional filters and STRICT search."""
    
    # Build base query filter
    query = {}
    
    if brand:
        query["brand"] = {"$regex": f"^{brand}$", "$options": "i"}
    
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    if min_price is not None:
        query["price_tnd"] = {"$gte": min_price}
    
    if max_price is not None:
        if "price_tnd" in query:
            query["price_tnd"]["$lte"] = max_price
        else:
            query["price_tnd"] = {"$lte": max_price}
    
    # Si recherche, utiliser le système STRICT
    if search:
        # Récupérer tous les produits de base
        base_products = list(db.products.find(query))
        
        # Appliquer la recherche stricte
        filtered_products = search_products_strict(search, base_products)
        
        total = len(filtered_products)
        
        # Pagination
        paginated_products = filtered_products[offset:offset + limit]
        
        # Convertir en modèles Product
        product_models = []
        for p in paginated_products:
            product_data = {
                "id": p.get("id"),
                "name": p.get("name"),
                "brand": p.get("brand"),
                "category": p.get("category"),
                "price_tnd": p.get("price_tnd", 0),
                "price": p.get("price_tnd", 0),
                "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
                "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
                "discount_percentage": p.get("discount_percentage", 0),
                "description": p.get("description", ""),
                "image_url": p.get("image_url", "/images/products/placeholder.png"),
                "volume": p.get("format") or p.get("volume", ""),
                "in_stock": p.get("in_stock", True),
                "is_new": p.get("is_new", False),
                "is_bestseller": p.get("is_bestseller", False),
                "rating": p.get("rating"),
                "review_count": p.get("review_count", 0),
            }
            product_models.append(Product(**product_data))
        
        return ProductListResponse(
            products=product_models,
            total=total,
            limit=limit,
            offset=offset
        )
    
    # Sans recherche, requête MongoDB standard
    total = db.products.count_documents(query)
    cursor = db.products.find(query).skip(offset).limit(limit)
    products = list(cursor)
    
    product_models = []
    for p in products:
        product_data = {
            "id": p.get("id"),
            "name": p.get("name"),
            "brand": p.get("brand"),
            "category": p.get("category"),
            "price_tnd": p.get("price_tnd", 0),
            "price": p.get("price_tnd", 0),
            "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "discount_percentage": p.get("discount_percentage", 0),
            "description": p.get("description", ""),
            "image_url": p.get("image_url", "/images/products/placeholder.png"),
            "volume": p.get("format") or p.get("volume", ""),
            "in_stock": p.get("in_stock", True),
            "is_new": p.get("is_new", False),
            "is_bestseller": p.get("is_bestseller", False),
            "rating": p.get("rating"),
            "review_count": p.get("review_count", 0),
        }
        product_models.append(Product(**product_data))
    
    return ProductListResponse(
        products=product_models,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/search/suggestions")
async def get_suggestions(
    q: str = Query(..., min_length=2, description="Search query")
):
    """Get search suggestions for autocomplete."""
    
    all_products = list(db.products.find({}))
    suggestions, brands, categories = get_search_suggestions(q, all_products)
    
    return {
        "suggestions": suggestions,
        "brands": brands,
        "categories": categories
    }


@router.get("/search/did-you-mean")
async def did_you_mean(
    q: str = Query(..., min_length=2, description="Search query")
):
    """Suggest corrections for misspelled search queries."""
    
    q_normalized = normalize_text(q)
    suggestions = []
    
    # Chercher dans les catégories connues
    for term, category in CATEGORY_MAPPINGS.items():
        ratio = fuzzy_ratio(q_normalized, term)
        if 0.5 < ratio < 1.0:
            suggestions.append((category, ratio))
    
    # Chercher dans les marques connues
    for term, brand in BRAND_MAPPINGS.items():
        ratio = fuzzy_ratio(q_normalized, term)
        if 0.5 < ratio < 1.0:
            suggestions.append((brand, ratio))
    
    # Chercher dans les noms de produits
    all_products = list(db.products.find({}, {"name": 1, "brand": 1}))
    for product in all_products:
        name = product.get('name', '')
        for word in name.split():
            if len(word) > 3:
                ratio = fuzzy_ratio(q_normalized, normalize_text(word))
                if 0.6 < ratio < 1.0:
                    suggestions.append((word, ratio))
    
    # Trier par similarité et dédupliquer
    suggestions.sort(key=lambda x: x[1], reverse=True)
    seen = set()
    unique_suggestions = []
    for term, _ in suggestions:
        term_lower = term.lower()
        if term_lower not in seen:
            seen.add(term_lower)
            unique_suggestions.append(term)
        if len(unique_suggestions) >= 5:
            break
    
    return {
        "original_query": q,
        "suggestions": unique_suggestions
    }


@router.get("/products/bestsellers", response_model=List[Product])
async def get_bestsellers(
    limit: int = Query(8, ge=1, le=20, description="Number of bestsellers to return")
):
    """Get bestseller products only from MongoDB."""
    
    cursor = db.products.find({"is_bestseller": True}).limit(limit)
    products = list(cursor)
    
    product_models = []
    for p in products:
        product_data = {
            "id": p.get("id"),
            "name": p.get("name"),
            "brand": p.get("brand"),
            "category": p.get("category"),
            "price_tnd": p.get("price_tnd", 0),
            "price": p.get("price_tnd", 0),
            "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
            "discount_percentage": p.get("discount_percentage", 0),
            "description": p.get("description", ""),
            "image_url": p.get("image_url", "/images/products/placeholder.png"),
            "volume": p.get("format") or p.get("volume", ""),
            "in_stock": p.get("in_stock", True),
            "is_new": p.get("is_new", False),
            "is_bestseller": p.get("is_bestseller", False),
            "rating": p.get("rating"),
            "review_count": p.get("review_count", 0),
        }
        product_models.append(Product(**product_data))
    
    return product_models


@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID from MongoDB."""
    
    p = db.products.find_one({"id": product_id})
    
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = {
        "id": p.get("id"),
        "name": p.get("name"),
        "brand": p.get("brand"),
        "category": p.get("category"),
        "price_tnd": p.get("price_tnd", 0),
        "price": p.get("price_tnd", 0),
        "original_price_tnd": p.get("original_price_tnd", p.get("price_tnd", 0)),
        "original_price": p.get("original_price_tnd", p.get("price_tnd", 0)),
        "discount_percentage": p.get("discount_percentage", 0),
        "description": p.get("description", ""),
        "image_url": p.get("image_url", "/images/products/placeholder.png"),
        "volume": p.get("format") or p.get("volume", ""),
        "in_stock": p.get("in_stock", True),
        "is_new": p.get("is_new", False),
        "is_bestseller": p.get("is_bestseller", False),
        "rating": p.get("rating"),
        "review_count": p.get("review_count", 0),
    }
    
    return Product(**product_data)


@router.get("/brands", response_model=List[BrandWithCount])
async def get_brands():
    """Get all unique brands with product count from MongoDB."""
    
    pipeline = [
        {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    result = list(db.products.aggregate(pipeline))
    
    brands = []
    for item in result:
        if item["_id"]:
            brand = BrandWithCount(
                name=item["_id"],
                slug=item["_id"].lower().replace(" ", "-"),
                logo_url="",
                product_count=item["count"]
            )
            brands.append(brand)
    
    return brands


@router.get("/categories", response_model=List[CategoryWithCount])
async def get_categories():
    """Get all unique categories with product count from MongoDB."""
    
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    result = list(db.products.aggregate(pipeline))
    
    categories = []
    for item in result:
        if item["_id"]:
            category = CategoryWithCount(
                name=item["_id"],
                slug=item["_id"].lower().replace(" ", "-"),
                image_url="",
                product_count=item["count"]
            )
            categories.append(category)
    
    return categories