import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  if (!product) return null;
  const { id, name, brand, price, original_price, image_url, format, is_new } = product;
  const hasDiscount = original_price && original_price > price;

  return (
    <Link to={`/products/${id}`} className="group block">
      <div className="bg-white border border-marble rounded-lg p-4 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden rounded-lg mb-3 bg-marble/30">
          <img src={image_url || '/images/products/placeholder.png'} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.target.src = '/images/products/placeholder.png'; }} />
          {is_new && <div className="absolute top-2 left-2 bg-gold text-charcoal px-2 py-1 rounded text-xs font-semibold">Nouveau</div>}
        </div>
        <div className="space-y-1">
          {brand && <p className="text-xs text-stone uppercase tracking-wide">{brand}</p>}
          <h3 className="text-charcoal font-medium text-sm line-clamp-2 min-h-[40px]">{name}</h3>
          {format && <p className="text-xs text-stone">{format}</p>}
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-gold font-bold text-lg">{price} TND</span>
            {hasDiscount && <span className="text-xs text-stone line-through">{original_price} TND</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
