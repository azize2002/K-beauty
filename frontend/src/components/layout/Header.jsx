import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User, Heart, Clock, TrendingUp } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Hook pour debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Hook pour vérifier les notifications de commandes
const useOrderNotifications = (token, isAuthenticated) => {
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setHasNotifications(false);
      return;
    }

    const checkNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) return;
        
        const orders = await response.json();
        const seenStatuses = JSON.parse(localStorage.getItem('kbeauty_seen_statuses') || '{}');
        
        let hasChanges = false;
        for (const order of orders) {
          const lastSeen = seenStatuses[order.id];
          if (lastSeen && lastSeen !== order.status) {
            hasChanges = true;
            break;
          }
        }
        
        setHasNotifications(hasChanges);
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  return hasNotifications;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { favoritesCount } = useFavorites();

  const cartCount = getCartCount();
  const hasNotifications = useOrderNotifications(token, isAuthenticated);
  
  // Debounce la recherche pour éviter trop d'appels API
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Charger les recherches récentes au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('kbeauty_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Fetch suggestions quand la recherche change
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
      setBrands([]);
      setCategories([]);
    }
  }, [debouncedSearch]);

  const fetchSuggestions = async (query) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setBrands(data.brands || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    setIsLoadingSuggestions(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/products', label: 'Produits' },
    { path: '/brands', label: 'Marques' },
    { path: '/about', label: 'À propos' },
  ];

  const isActive = (path) => location.pathname === path;

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kbeauty_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (term) => {
    saveRecentSearch(term);
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleBrandClick = (brand) => {
    saveRecentSearch(brand);
    navigate(`/products?brand=${encodeURIComponent(brand)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const popularSearches = ['Serum', 'Sunscreen', 'COSRX', 'ANUA', 'Toner', 'Cream'];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-ivory border-b border-marble transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-semibold text-charcoal tracking-wide">
            K-BEAUTY
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Recherche */}
            <button 
              onClick={toggleSearch}
              className="text-charcoal hover:text-gold transition-colors duration-200"
            >
              <Search size={20} />
            </button>

            {/* Favoris */}
            <Link
              to="/favorites"
              className="relative text-charcoal hover:text-red-500 transition-colors duration-200"
            >
              <Heart size={20} />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Panier */}
            <Link
              to="/cart"
              className="relative text-charcoal hover:text-gold transition-colors duration-200"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Profil */}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className="relative text-charcoal hover:text-gold transition-colors duration-200 flex items-center gap-1"
            >
              <User size={20} />
              {isAuthenticated && hasNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              {isAuthenticated && (
                <span className="hidden md:inline text-sm font-medium">
                  {user?.first_name}
                </span>
              )}
            </Link>

            {/* Menu Mobile */}
            <button
              className="md:hidden text-charcoal hover:text-gold transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-ivory border-t border-marble">
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path) ? 'text-gold' : 'text-charcoal hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/favorites"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-charcoal hover:text-gold flex items-center gap-2"
              >
                <Heart size={16} />
                Mes Favoris {favoritesCount > 0 && `(${favoritesCount})`}
              </Link>
              <Link
                to={isAuthenticated ? '/profile' : '/login'}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-charcoal hover:text-gold"
              >
                {isAuthenticated ? 'Mon Profil' : 'Connexion'}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de recherche avancée */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
          />
          
          {/* Barre de recherche */}
          <div className="relative w-full max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="w-full px-6 py-4 pr-14 text-lg bg-white rounded-xl shadow-2xl border-2 border-transparent focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gold hover:text-gold/80 transition-colors"
              >
                <Search size={24} />
              </button>
            </form>
            
            {/* Résultats de recherche / Suggestions */}
            <div className="mt-2 bg-white rounded-xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto">
              
              {/* Loading */}
              {isLoadingSuggestions && searchQuery.length >= 2 && (
                <div className="p-4 text-center text-stone">
                  <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {/* Suggestions de produits */}
              {!isLoadingSuggestions && suggestions.length > 0 && (
                <div className="p-4 border-b border-marble">
                  <p className="text-xs text-stone uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Search size={14} />
                    Suggestions
                  </p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-charcoal hover:bg-gold/10 rounded-lg transition-colors text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Marques trouvées */}
              {!isLoadingSuggestions && brands.length > 0 && (
                <div className="p-4 border-b border-marble">
                  <p className="text-xs text-stone uppercase tracking-wide mb-3">Marques</p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand, index) => (
                      <button
                        key={index}
                        onClick={() => handleBrandClick(brand)}
                        className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-charcoal text-sm rounded-full transition-colors font-medium"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Catégories trouvées */}
              {!isLoadingSuggestions && categories.length > 0 && (
                <div className="p-4 border-b border-marble">
                  <p className="text-xs text-stone uppercase tracking-wide mb-3">Catégories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleCategoryClick(category)}
                        className="px-3 py-1.5 bg-marble/50 hover:bg-gold/20 text-charcoal text-sm rounded-full transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pas de résultats pour une recherche */}
              {!isLoadingSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && brands.length === 0 && (
                <div className="p-4 text-center text-stone">
                  <p>Aucune suggestion pour "{searchQuery}"</p>
                  <p className="text-sm mt-1">Appuyez sur Entrée pour rechercher</p>
                </div>
              )}

              {/* Recherches récentes */}
              {searchQuery.length < 2 && recentSearches.length > 0 && (
                <div className="p-4 border-b border-marble">
                  <p className="text-xs text-stone uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Clock size={14} />
                    Recherches récentes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1.5 bg-marble/30 hover:bg-gold/20 text-charcoal text-sm rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recherches populaires */}
              {searchQuery.length < 2 && (
                <div className="p-4">
                  <p className="text-xs text-stone uppercase tracking-wide mb-3 flex items-center gap-2">
                    <TrendingUp size={14} />
                    Recherches populaires
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1.5 bg-marble/50 hover:bg-gold/20 text-charcoal text-sm rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;