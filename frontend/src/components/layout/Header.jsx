import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
        <Link to="/" className="text-2xl font-semibold text-charcoal tracking-wide">K-BEAUTY</Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path) ? 'text-gold border-b-2 border-gold' : 'text-charcoal hover:text-gold'}`}>{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-charcoal hover:text-gold transition-colors duration-200"><Search size={20} /></button>
          <Link to="/cart" className="relative text-charcoal hover:text-gold transition-colors duration-200">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
          </Link>
          <button className="text-charcoal hover:text-gold transition-colors duration-200"><User size={20} /></button>
          <button className="md:hidden text-charcoal hover:text-gold transition-colors duration-200" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-ivory border-t border-marble">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path) ? 'text-gold' : 'text-charcoal hover:text-gold'}`}>{link.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
