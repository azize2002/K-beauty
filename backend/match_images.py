"""Script to automatically match product images with products in JSON."""
import json
from pathlib import Path
from difflib import SequenceMatcher
import re

def normalize_name(name):
    """Normalize product names for matching."""
    # Remove special characters and extra spaces
    name = re.sub(r'[^\w\s-]', '', name)
    name = ' '.join(name.split())
    return name.lower()

def similarity(a, b):
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()

def match_images():
    """Match images with products in JSON."""
    # Paths
    backend_dir = Path(__file__).parent
    products_file = backend_dir / "data" / "products.json"
    images_dir = backend_dir.parent / "frontend" / "public" / "images" / "products"
    
    # Load products
    with open(products_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        products = data.get("products", [])
    
    # Get list of image files (exclude placeholder)
    image_files = [f.name for f in images_dir.glob("*.png") if f.name != "placeholder.png"]
    
    print(f"📦 Total products: {len(products)}")
    print(f"🖼️  Total images: {len(image_files)}")
    print(f"\n{'='*80}\n")
    
    matched = 0
    updated = 0
    
    for product in products:
        product_name = product.get("name", "")
        brand = product.get("brand", "")
        current_image = product.get("image_url", "")
        
        # Skip if already has a non-placeholder image
        if current_image and "placeholder" not in current_image:
            matched += 1
            continue
        
        # Try to find matching image
        best_match = None
        best_score = 0
        
        # Construct expected filename
        expected_filename = f"{brand}_{product_name}.png"
        
        for image_file in image_files:
            # Direct match
            if image_file == expected_filename:
                best_match = image_file
                best_score = 1.0
                break
            
            # Fuzzy match
            score = similarity(image_file, expected_filename)
            if score > best_score:
                best_score = score
                best_match = image_file
        
        # Update if good match found (threshold 0.7)
        if best_match and best_score >= 0.7:
            product["image_url"] = f"/images/products/{best_match}"
            updated += 1
            print(f"✅ MATCHED ({best_score:.2f})")
            print(f"   Product: {brand} - {product_name}")
            print(f"   Image:   {best_match}\n")
        else:
            print(f"❌ NO MATCH")
            print(f"   Product: {brand} - {product_name}")
            print(f"   Expected: {expected_filename}")
            if best_match:
                print(f"   Best try: {best_match} (score: {best_score:.2f})\n")
            else:
                print()
    
    # Save updated JSON
    with open(products_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}")
    print(f"📊 SUMMARY:")
    print(f"   Already matched: {matched}")
    print(f"   Newly matched:   {updated}")
    print(f"   Still missing:   {len(products) - matched - updated}")
    print(f"   Total products:  {len(products)}")
    print(f"\n✅ products.json updated!")

if __name__ == "__main__":
    match_images()