import json
from pathlib import Path

def fix_json_promos():
    # Chemin vers products.json
    json_path = Path(__file__).parent.parent / "data" / "products.json"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    products = data.get("products", [])
    
    for product in products:
        # Mettre discount à 0
        product["discount_percentage"] = 0
        # Égaliser les prix
        if "original_price" in product:
            product["price"] = product["original_price"]
    
    # Sauvegarder
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {len(products)} produits mis à jour dans products.json")
    print("🔄 Redémarrez le backend pour appliquer les changements!")

if __name__ == "__main__":
    fix_json_promos()