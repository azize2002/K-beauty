import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductCard from '../components/product/ProductCard';

const Favorites = () => {
  const { favorites, removeFromFavorites, favoritesCount } = useFavorites();

  return (
    <div className="min-h-screen bg-ivory py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart size={32} className="text-red-500" fill="currentColor" />
          <h1 className="text-2xl md:text-3xl font-light text-charcoal">
            Mes Favoris
          </h1>
          {favoritesCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              {favoritesCount}
            </span>
          )}
        </div>

        {favorites.length === 0 ? (
          /* État vide */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-marble/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-stone" />
            </div>
            <h2 className="text-xl font-medium text-charcoal mb-2">
              Votre liste de favoris est vide
            </h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Explorez nos produits et cliquez sur le ❤️ pour sauvegarder vos coups de cœur !
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gold text-charcoal px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <>
            {/* Grille des favoris */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {favorites.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Lien retour */}
            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-medium transition-colors"
              >
                <ArrowLeft size={18} />
                Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;