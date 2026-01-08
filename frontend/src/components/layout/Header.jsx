import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/products', label: 'Produits' },
    { path: '/brands', label: 'Marques' },
    { path: '/about', label: 'À propos' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
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
          <button className="text-charcoal hover:text-gold transition-colors duration-200">
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
            className="text-charcoal hover:text-gold transition-colors duration-200 flex items-center gap-1"
          >
            <User size={20} />
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
  );
};

export default Header;