import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Charger les favoris depuis localStorage au démarrage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('kbeauty_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Erreur parsing favoris:', error);
        setFavorites([]);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('kbeauty_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Ajouter aux favoris
  const addToFavorites = (product) => {
    setFavorites(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev; // Déjà dans les favoris
      }
      return [...prev, product];
    });
  };

  // Retirer des favoris
  const removeFromFavorites = (productId) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
  };

  // Toggle favori
  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  // Vérifier si un produit est en favori
  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  // Nombre de favoris
  const favoritesCount = favorites.length;

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoritesCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};