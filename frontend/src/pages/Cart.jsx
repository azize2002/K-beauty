import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getSubtotal, 
    getTotal, 
    clearCart 
  } = useCart();

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 100 ? 0 : 7;
  const total = getTotal(deliveryFee);

  // Si le panier est vide
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-charcoal text-center mb-12">
            Mon Panier
          </h1>
          
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg p-12 border border-marble">
              <ShoppingBag size={64} className="mx-auto text-stone mb-4" />
              <p className="text-charcoal text-lg mb-2">Votre panier est vide</p>
              <p className="text-stone text-sm mb-6">
                Découvrez nos produits K-Beauty et ajoutez vos favoris !
              </p>
              <Link 
                to="/products" 
                className="inline-block bg-gold text-charcoal px-6 py-3 rounded-lg font-medium hover:bg-gold/90 transition-colors"
              >
                Découvrir nos produits
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-charcoal">
            Mon Panier ({cart.length} {cart.length === 1 ? 'article' : 'articles'})
          </h1>
          <Link 
            to="/products" 
            className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Continuer mes achats</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
            
            {/* Bouton vider le panier */}
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                  clearCart();
                }
              }}
              className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 mt-4"
            >
              <Trash2 size={16} />
              Vider le panier
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-marble p-6 sticky top-24">
              <h2 className="text-xl font-medium text-charcoal mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-charcoal">
                  <span>Sous-total</span>
                  <span className="font-medium">{subtotal} TND</span>
                </div>
                
                <div className="flex justify-between text-charcoal">
                  <span>Livraison</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      `${deliveryFee} TND`
                    )}
                  </span>
                </div>

                {subtotal < 100 && (
                  <p className="text-xs text-stone bg-marble/50 p-3 rounded">
                    💡 Plus que <span className="font-semibold text-gold">{100 - subtotal} TND</span> pour la livraison gratuite !
                  </p>
                )}

                <div className="border-t border-marble pt-4">
                  <div className="flex justify-between text-charcoal text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gold">{total} TND</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block text-center bg-gold text-charcoal px-6 py-3 rounded-lg font-medium hover:bg-gold/90 transition-colors">
                Passer à la caisse
              </Link>

              <p className="text-xs text-center text-stone">
                Paiement sécurisé • Livraison Glovo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour un article du panier
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const { id, name, brand, price_tnd, original_price_tnd, discount_percentage, image_url, quantity } = item;

  const itemTotal = price_tnd * quantity;
  const hasDiscount = discount_percentage && discount_percentage > 0;

  return (
    <div className="bg-white rounded-lg border border-marble p-4 flex gap-4">
      {/* Image */}
      <Link to={`/products/${id}`} className="flex-shrink-0">
        <img 
          src={image_url || '/images/products/placeholder.png'} 
          alt={name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => { 
            e.target.src = '/images/products/placeholder.png'; 
          }}
        />
      </Link>

      {/* Info produit */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${id}`}>
          <p className="text-xs text-stone uppercase tracking-wide mb-1">{brand}</p>
          <h3 className="text-charcoal font-medium mb-2 hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-gold font-bold">{price_tnd} TND</span>
          {hasDiscount && original_price_tnd && (
            <>
              <span className="text-xs text-stone line-through">{original_price_tnd} TND</span>
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                -{discount_percentage}%
              </span>
            </>
          )}
        </div>

        {/* Contrôles quantité */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-marble rounded-lg">
            <button
              onClick={() => updateQuantity(id, quantity - 1)}
              className="p-2 hover:bg-marble/50 transition-colors rounded-l-lg"
              aria-label="Diminuer la quantité"
            >
              <Minus size={16} className="text-charcoal" />
            </button>
            
            <span className="px-4 py-2 text-charcoal font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            
            <button
              onClick={() => updateQuantity(id, quantity + 1)}
              className="p-2 hover:bg-marble/50 transition-colors rounded-r-lg"
              aria-label="Augmenter la quantité"
            >
              <Plus size={16} className="text-charcoal" />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            aria-label="Retirer du panier"
          >
            <Trash2 size={18} className="text-stone group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Prix total de la ligne */}
      <div className="flex-shrink-0 text-right">
        <p className="text-charcoal font-bold text-lg">{itemTotal} TND</p>
      </div>
    </div>
  );
};

export default Cart;