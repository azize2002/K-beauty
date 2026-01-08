# 🗄️ SCHÉMA DE BASE DE DONNÉES - K-BEAUTY

## 📌 TYPE DE BASE DE DONNÉES
**MongoDB** (NoSQL Document Database)

---

## 📊 COLLECTIONS

### 1️⃣ **products** (Produits)
```json
{
  "id": "uuid",
  "name": "string",
  "brand": "string",
  "category": "string",
  "description": "string | null",
  "price": "float",                    // Prix en EUR
  "price_tnd": "int",                  // Prix en TND
  "original_price": "float | null",    // Prix original EUR
  "original_price_tnd": "int | null",  // Prix original TND
  "discount_percentage": "int | null", // % de réduction
  "volume": "string | null",
  "image_url": "string",
  "rating": "float | null",
  "review_count": "int | null",
  "is_new": "boolean",
  "is_bestseller": "boolean",          // Marqué par admin
  "in_stock": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Index recommandés :**
- `brand` (pour filtrage)
- `category` (pour filtrage)
- `is_bestseller` (pour page d'accueil)
- `name` (pour recherche)

---

### 2️⃣ **categories** (Catégories)
```json
{
  "id": "uuid",
  "name": "string",        // Ex: "Sérums"
  "slug": "string",        // Ex: "Serum"
  "image_url": "string"
}
```

**Index recommandés :**
- `slug` (unique)

---

### 3️⃣ **brands** (Marques)
```json
{
  "id": "uuid",
  "name": "string",        // Ex: "ANUA"
  "slug": "string",        // Ex: "anua"
  "logo_url": "string"
}
```

**Index recommandés :**
- `slug` (unique)
- `name` (pour recherche)

---

### 4️⃣ **users** (Utilisateurs)
```json
{
  "id": "uuid",
  "email": "string",               // Unique
  "hashed_password": "string",     // BCrypt hash
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "role": "client | admin",        // Rôle utilisateur
  "is_active": "boolean",
  "is_verified": "boolean",        // Email vérifié
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Index recommandés :**
- `email` (unique)
- `role` (pour admin queries)

---

### 5️⃣ **addresses** (Adresses de livraison)
```json
{
  "id": "uuid",
  "user_id": "string",             // Référence users.id
  "full_name": "string",
  "phone": "string",
  "address_line1": "string",
  "address_line2": "string | null",
  "city": "string",
  "postal_code": "string",
  "governorate": "string",         // Gouvernorat tunisien
  "is_default": "boolean",
  "created_at": "datetime"
}
```

**Index recommandés :**
- `user_id` (pour récupérer adresses d'un user)

---

### 6️⃣ **orders** (Commandes)
```json
{
  "id": "uuid",
  "order_number": "string",        // Ex: "ORD-20250107-0001"
  "user_id": "string",             // Référence users.id
  
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "product_image": "string",
      "brand": "string",
      "quantity": "int",
      "unit_price_tnd": "int",
      "total_price_tnd": "int"
    }
  ],
  
  "subtotal_tnd": "int",
  "delivery_fee_tnd": "int",       // Frais de livraison
  "discount_tnd": "int",
  "total_tnd": "int",
  
  "shipping_address": {
    "full_name": "string",
    "phone": "string",
    "address_line1": "string",
    "address_line2": "string | null",
    "city": "string",
    "postal_code": "string",
    "governorate": "string"
  },
  
  "phone": "string",
  "delivery_notes": "string | null",
  "payment_method": "cash_on_delivery | card",
  "status": "pending | confirmed | preparing | shipped | delivered | cancelled",
  
  "created_at": "datetime",
  "updated_at": "datetime",
  "confirmed_at": "datetime | null",
  "delivered_at": "datetime | null"
}
```

**Index recommandés :**
- `order_number` (unique)
- `user_id` (pour historique client)
- `status` (pour admin dashboard)
- `created_at` (pour tri)

---

### 7️⃣ **promotions** (Promotions - Gestion Admin)
```json
{
  "id": "uuid",
  "product_id": "string",          // Référence products.id
  "discount_percentage": "int",    // 10, 20, 30, etc.
  "is_active": "boolean",
  "start_date": "datetime | null",
  "end_date": "datetime | null",
  "created_by": "string",          // Admin user_id
  "created_at": "datetime"
}
```

**Index recommandés :**
- `product_id` (pour trouver promo d'un produit)
- `is_active` (pour filtrer promos actives)

---

## 🔐 GOUVERNORATS TUNISIENS (Pour validation)
```python
GOVERNORATES = [
    "Tunis", "Ariana", "Ben Arous", "Manouba",
    "Nabeul", "Zaghouan", "Bizerte",
    "Béja", "Jendouba", "Le Kef", "Siliana",
    "Kairouan", "Kasserine", "Sidi Bouzid",
    "Sousse", "Monastir", "Mahdia", "Sfax",
    "Gafsa", "Tozeur", "Kébili",
    "Gabès", "Médenine", "Tataouine"
]
```

---

## 🚀 DÉPLOIEMENT

### Variables d'environnement requises :
```env
# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/kbeauty
DATABASE_NAME=kbeauty

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
API_URL=https://api.kbeauty.tn
FRONTEND_URL=https://kbeauty.tn

# Email (futur)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 📦 COMMANDES D'INITIALISATION

### 1. Installer les dépendances
```bash
pip install pymongo motor bcrypt python-jose[cryptography] passlib
```

### 2. Créer les index
```python
# À exécuter une fois en production
db.users.create_index("email", unique=True)
db.orders.create_index("order_number", unique=True)
db.brands.create_index("slug", unique=True)
db.categories.create_index("slug", unique=True)
```

### 3. Créer le premier admin
```python
# Script à exécuter après déploiement
python scripts/create_admin.py
```

---

## 🔄 MIGRATIONS FUTURES

Si vous devez ajouter des champs :
```python
# Exemple : Ajouter un champ à tous les produits
db.products.update_many(
    {},
    {"$set": {"new_field": "default_value"}}
)
```

---

## 📊 STATISTIQUES IMPORTANTES (Pour Admin Dashboard)

### Requêtes utiles :
```python
# Total des ventes
total_sales = db.orders.aggregate([
    {"$match": {"status": "delivered"}},
    {"$group": {"_id": None, "total": {"$sum": "$total_tnd"}}}
])

# Produits les plus vendus
top_products = db.orders.aggregate([
    {"$unwind": "$items"},
    {"$group": {
        "_id": "$items.product_id",
        "total_quantity": {"$sum": "$items.quantity"}
    }},
    {"$sort": {"total_quantity": -1}},
    {"$limit": 10}
])

# Nombre de commandes par statut
orders_by_status = db.orders.aggregate([
    {"$group": {"_id": "$status", "count": {"$sum": 1}}}
])
```

---

## 🔒 SÉCURITÉ

### À implémenter :
- ✅ Hash des mots de passe (BCrypt)
- ✅ JWT tokens pour authentification
- ✅ Validation des données (Pydantic)
- ⚠️ Rate limiting (à ajouter)
- ⚠️ HTTPS obligatoire en production
- ⚠️ Sanitisation des inputs

---

## 📱 INTÉGRATION GLOVO (Futur)

**API Endpoints à préparer :**
```python
POST /api/delivery/calculate-fee
POST /api/delivery/create-order
GET /api/delivery/track/{order_id}
```

**Champs à ajouter dans Order :**
- `glovo_order_id`: string | null
- `tracking_url`: string | null
- `estimated_delivery`: datetime | null

---

## 📞 SUPPORT

Pour toute question sur le schéma de données :
- 📧 dev@kbeauty.tn
- 📱 +216 XX XXX XXX

---

**Dernière mise à jour :** 07 Janvier 2026
**Version :** 1.0.0