import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

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
        const response = await fetch('http://localhost:8000/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) return;
        
        const orders = await response.json();
        
        // Récupérer les statuts vus depuis localStorage
        const seenStatuses = JSON.parse(localStorage.getItem('kbeauty_seen_statuses') || '{}');
        
        // Vérifier s'il y a des changements
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
    
    // Vérifier toutes les 30 secondes
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
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { isAuthenticated, user, token } = useAuth();

  const cartCount = getCartCount();
  const hasNotifications = useOrderNotifications(token, isAuthenticated);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus sur l'input quand la recherche s'ouvre
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Fermer la recherche avec Escape
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

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

            {/* Panier avec badge */}
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

            {/* Profil / Login */}
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
              {/* Login/Profile dans menu mobile */}
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

      {/* Modal de recherche */}
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
            
            {/* Suggestions rapides */}
            <div className="mt-4 bg-white rounded-xl shadow-xl p-4">
              <p className="text-xs text-stone uppercase tracking-wide mb-3">Recherches populaires</p>
              <div className="flex flex-wrap gap-2">
                {['Serum', 'Cream', 'ANUA', 'COSRX', 'Sunscreen', 'Toner'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      navigate(`/products?search=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-marble/50 hover:bg-gold/20 text-charcoal text-sm rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;