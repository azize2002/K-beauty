import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  if (!product) return null;

  const { 
    id, 
    name, 
    brand, 
    price_tnd,
    price,
    original_price_tnd,
    original_price,
    discount_percentage,
    image_url, 
    volume,
    is_new,
    in_stock 
  } = product;

  const displayPrice = price_tnd || price || 0;
  const displayOriginalPrice = original_price_tnd || original_price || displayPrice;
  
  const discountValue = Number(discount_percentage) || 0;
  const hasDiscount = discountValue > 0 && displayOriginalPrice > displayPrice;
  
  const inCart = isInCart(id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!in_stock) return;
    
    addToCart(product);
    setShowModal(true);
  };

  const handleGoToCart = () => {
    setShowModal(false);
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    setShowModal(false);
  };

  return (
    <>
      <Link to={`/products/${id}`} className="group block h-full">
        <div className="bg-white border border-marble rounded-lg p-3 md:p-4 transition-all duration-300 hover:shadow-lg relative h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg mb-3 bg-marble/30">
            <img 
              src={image_url || '/images/products/placeholder.png'} 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              onError={(e) => { 
                e.target.src = '/images/products/placeholder.png'; 
              }} 
            />
            
            {(is_new || hasDiscount) && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {is_new && (
                  <div className="bg-gold text-charcoal px-2 py-1 rounded text-xs font-semibold">
                    Nouveau
                  </div>
                )}
                {hasDiscount && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    -{discountValue}%
                  </div>
                )}
              </div>
            )}

            {!in_stock && (
              <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">Rupture de stock</span>
              </div>
            )}
          </div>

          {/* Info produit */}
          <div className="space-y-1 flex-1 flex flex-col">
            {brand && (
              <p className="text-xs text-stone uppercase tracking-wide">{brand}</p>
            )}
            <h3 className="text-charcoal font-medium text-xs md:text-sm line-clamp-2 min-h-[32px] md:min-h-[40px]">
              {name}
            </h3>
            {volume && (
              <p className="text-xs text-stone">{volume}</p>
            )}
            
            {/* Prix */}
            <div className="flex items-baseline gap-2 pt-2 mt-auto">
              <span className="text-gold font-bold text-base md:text-lg">{displayPrice} TND</span>
              {hasDiscount && (
                <span className="text-xs text-stone line-through">
                  {displayOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Bouton Ajouter au panier - RESPONSIVE */}
          <button
            onClick={handleAddToCart}
            disabled={!in_stock}
            className={`
              w-full mt-3 md:mt-4 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm
              flex items-center justify-center gap-1.5 md:gap-2
              transition-all duration-200
              ${!in_stock 
                ? 'bg-marble text-stone cursor-not-allowed' 
                : inCart
                  ? 'bg-gold/20 text-gold border border-gold'
                  : 'bg-gold text-charcoal hover:bg-gold/90'
              }
            `}
          >
            <ShoppingCart size={16} className="flex-shrink-0" />
            <span className="truncate">
              {inCart ? 'Dans le panier' : 'Ajouter'}
            </span>
          </button>
        </div>
      </Link>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl relative">
            <button
              onClick={handleContinueShopping}
              className="absolute top-3 right-3 text-stone hover:text-charcoal"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Ajouté au panier !
              </h3>
              <p className="text-stone text-sm line-clamp-2">
                {name}
              </p>
              <p className="text-gold font-semibold mt-1">
                {displayPrice} TND
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleGoToCart}
                className="w-full bg-gold text-charcoal py-2.5 rounded-lg font-semibold text-sm hover:bg-gold/90 transition-colors"
              >
                Voir le panier
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full border border-gold text-gold py-2.5 rounded-lg font-semibold text-sm hover:bg-gold/10 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;