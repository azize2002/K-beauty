import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">K-BEAUTY</h3>
            <p className="text-stone mb-6">Le luxe accessible de la beauté coréenne</p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-stone hover:text-gold transition-colors duration-200"><Instagram size={20} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-stone hover:text-gold transition-colors duration-200"><Facebook size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-stone hover:text-gold transition-colors duration-200">Accueil</Link></li>
              <li><Link to="/products" className="text-stone hover:text-gold transition-colors duration-200">Produits</Link></li>
              <li><Link to="/brands" className="text-stone hover:text-gold transition-colors duration-200">Marques</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Informations</h4>
            <ul className="space-y-3">
              <li><Link to="/shipping" className="text-stone hover:text-gold transition-colors duration-200">Livraison</Link></li>
              <li><Link to="/terms" className="text-stone hover:text-gold transition-colors duration-200">CGV</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Contact</h4>
            <ul className="space-y-3 text-stone">
              <li><a href="mailto:contact@kbeauty.tn" className="hover:text-gold transition-colors duration-200">contact@kbeauty.tn</a></li>
              <li>Tunis, Tunisie</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-stone/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-stone text-sm">© 2025 K-Beauty. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
   );
};

export default Footer;
