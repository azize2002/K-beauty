import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Produit non trouvé');
        }
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return;
    addToCart(product, quantity);
    setShowModal(true);
  };

  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getProductQuantity(product.id) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-stone">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600 mb-4">Erreur: {error || 'Produit non trouvé'}</p>
          <Link to="/products" className="text-gold hover:text-gold/80">
            ← Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-stone hover:text-gold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour aux produits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-white rounded-lg p-4 border border-marble">
            <div className="aspect-square relative">
              <img
                src={product.image_url || '/images/products/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/images/products/placeholder.png';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="bg-gold text-charcoal px-3 py-1 rounded text-sm font-semibold">
                    Nouveau
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Infos produit */}
          <div className="space-y-6">
            {/* Marque */}
            <p className="text-stone uppercase tracking-wide text-sm">
              {product.brand}
            </p>

            {/* Nom */}
            <h1 className="text-3xl font-light text-charcoal">
              {product.name}
            </h1>

            {/* Volume */}
            {product.volume && (
              <p className="text-stone">{product.volume}</p>
            )}

            {/* Prix */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gold">
                {product.price_tnd} TND
              </span>
              {hasDiscount && product.original_price_tnd && (
                <span className="text-xl text-stone line-through">
                  {product.original_price_tnd} TND
                </span>
              )}
            </div>

            {/* Stock */}
            {product.in_stock ? (
              <span className="inline-block text-green-600 font-medium">
                ✓ En stock
              </span>
            ) : (
              <span className="inline-block text-red-600 font-medium">
                ✗ Rupture de stock
              </span>
            )}

            {/* Description */}
            <div className="border-t border-marble pt-6">
              <h2 className="text-lg font-medium text-charcoal mb-3">Description</h2>
              <p className="text-stone leading-relaxed">
                {product.description || 'Description à venir...'}
              </p>
            </div>

            {/* Quantité + Ajouter au panier */}
            {product.in_stock && (
              <div className="space-y-4 pt-4">
                {/* Sélecteur de quantité */}
                <div className="flex items-center gap-4">
                  <span className="text-charcoal font-medium">Quantité :</span>
                  <div className="flex items-center border border-marble rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-marble/50 transition-colors rounded-l-lg"
                    >
                      <Minus size={18} className="text-charcoal" />
                    </button>
                    <span className="px-6 py-3 text-charcoal font-medium min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-3 hover:bg-marble/50 transition-colors rounded-r-lg"
                    >
                      <Plus size={18} className="text-charcoal" />
                    </button>
                  </div>
                </div>

                {/* Bouton Ajouter */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gold text-charcoal py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gold/90 transition-colors"
                >
                  <ShoppingCart size={24} />
                  Ajouter au panier
                </button>

                {/* Info si déjà dans le panier */}
                {inCart && (
                  <p className="text-center text-stone text-sm">
                    Vous avez déjà {cartQuantity} de ce produit dans votre panier
                  </p>
                )}
              </div>
            )}

            {/* Produit en rupture */}
            {!product.in_stock && (
              <button
                disabled
                className="w-full bg-marble text-stone py-4 rounded-lg font-semibold text-lg cursor-not-allowed"
              >
                Produit indisponible
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL : Ajouté au panier */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Produit ajouté au panier !
              </h3>
              <p className="text-stone">
                {product.name} ({quantity} x {product.price_tnd} TND)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/cart"
                className="w-full bg-gold text-charcoal py-3 rounded-lg font-semibold text-center hover:bg-gold/90 transition-colors"
              >
                Voir le panier
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="w-full border border-gold text-gold py-3 rounded-lg font-semibold hover:bg-gold/10 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;