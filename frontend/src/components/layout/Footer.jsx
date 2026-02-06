import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';

// Icône TikTok personnalisée (Lucide n'a pas TikTok)
const TikTokIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">K-BEAUTY</h3>
            <p className="text-stone mb-6">Le luxe accessible de la beauté coréenne</p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/kbeauty.tn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-stone hover:text-gold transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com/kbeauty.tn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-stone hover:text-gold transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://tiktok.com/@kbeauty.tn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-stone hover:text-gold transition-colors duration-200"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
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