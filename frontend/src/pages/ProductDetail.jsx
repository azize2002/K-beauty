import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Check, ArrowLeft, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Composant pour le contenu tronqué avec "Voir plus"
const TruncatedContent = ({ content, maxLines = 6 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = React.useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = 24; // approximate line height
      const maxHeight = lineHeight * maxLines;
      setNeedsTruncation(contentRef.current.scrollHeight > maxHeight + 10);
    }
  }, [content, maxLines]);

  if (typeof content !== 'string') {
    return <div>{content}</div>;
  }

  return (
    <div>
      <div 
        ref={contentRef}
        className={`text-stone leading-relaxed whitespace-pre-line text-sm transition-all duration-300 ${
          !isExpanded && needsTruncation ? 'line-clamp-6' : ''
        }`}
        style={!isExpanded && needsTruncation ? { 
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : {}}
      >
        {content}
      </div>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-gold hover:text-gold/80 font-medium flex items-center gap-1 transition-colors text-sm"
        >
          {isExpanded ? (
            <>
              Voir moins <ChevronUp size={16} />
            </>
          ) : (
            <>
              Voir plus <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Produit non trouvé');
        }
        return response.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return;
    addToCart(product, quantity);
    setShowModal(true);
  };

  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getProductQuantity(product.id) : 0;

  // Parser la description pour extraire les sections
  const parseDescription = (description) => {
    if (!description) return {};
    
    const sections = {
      description: '',
      actifs: '',
      pourQui: '',
      avantages: ''
    };

    const text = description;
    
    // Trouver où commence la première section spéciale
    let mainDescEnd = text.length;
    const markers = ['À utiliser en cas de', 'Public :', '\n\n**Composition', 'Atouts formulation', '**Composition'];
    for (const marker of markers) {
      const idx = text.indexOf(marker);
      if (idx !== -1 && idx < mainDescEnd) {
        mainDescEnd = idx;
      }
    }

    // Description principale
    sections.description = text.substring(0, mainDescEnd).trim();

    // Extraire "Pour qui" - tout entre "À utiliser" ou "Public" et "**Composition" ou "Atouts"
    const pourQuiMatch = text.match(/(À utiliser en cas de[\s\S]*?)(?=\*\*Composition|Atouts formulation|$)/i);
    const publicMatch = text.match(/(Public\s*:[\s\S]*?)(?=\*\*Composition|Atouts formulation|$)/i);
    
    if (pourQuiMatch) {
      sections.pourQui = pourQuiMatch[1].trim();
    }
    if (publicMatch) {
      sections.pourQui = (sections.pourQui ? sections.pourQui + '\n\n' : '') + publicMatch[1].trim();
    }

    // Extraire "Actifs clés"
    const actifsMatch = text.match(/\*\*Composition:?\*\*\s*([\s\S]*?)(?=Atouts formulation|$)/i);
    if (actifsMatch) {
      sections.actifs = actifsMatch[1].trim();
    }

    // Extraire "Avantages"
    const avantagesMatch = text.match(/Atouts formulation\s*:?\s*([\s\S]*?)$/i);
    if (avantagesMatch) {
      sections.avantages = avantagesMatch[1].trim();
    }

    return sections;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-stone">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600 mb-4">Erreur: {error || 'Produit non trouvé'}</p>
          <Link to="/products" className="text-gold hover:text-gold/80">
            ← Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const discountValue = Number(product.discount_percentage) || 0;
  const hasDiscount = discountValue > 0;
  
  const originalPrice = Number(product.original_price_tnd) || 0;
  const currentPrice = Number(product.price_tnd) || 0;
  const hasOriginalPrice = originalPrice > 0 && originalPrice > currentPrice;

  const description = product.description || '';
  const parsedSections = parseDescription(description);

  // Définir les tabs
  const allTabs = [
    { id: 'description', label: 'DESCRIPTION', content: parsedSections.description || description || 'Description à venir...' },
    { id: 'actifs', label: 'ACTIFS CLÉS', content: parsedSections.actifs },
    { id: 'pourQui', label: 'POUR QUI ?', content: parsedSections.pourQui },
    { id: 'avantages', label: 'LES AVANTAGES', content: parsedSections.avantages },
    { id: 'livraison', label: 'LIVRAISON', content: 'livraison' }
  ];

  const tabs = allTabs.filter(tab => tab.content);

  const getTabContent = () => {
    if (activeTab === 'livraison') {
      return (
        <div className="space-y-3 text-stone text-sm">
          <p>🚚 <strong>Livraison standard</strong> : 3-5 jours ouvrés</p>
          <p>📦 <strong>Livraison gratuite</strong> dès 100 TND d'achat</p>
          <p>🔄 <strong>Retours</strong> : 14 jours pour changer d'avis</p>
        </div>
      );
    }
    const tab = tabs.find(t => t.id === activeTab);
    return tab?.content || '';
  };

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-stone hover:text-gold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour aux produits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image produit - STICKY sur desktop */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-lg p-4 border border-marble">
              <div className="aspect-square relative">
                <img
                  src={product.image_url || '/images/products/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/products/placeholder.png';
                  }}
                />
                
                {(product.is_new === true || hasDiscount) && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_new === true && (
                      <span className="bg-gold text-charcoal px-3 py-1 rounded text-sm font-semibold">
                        Nouveau
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                        -{discountValue}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Infos produit */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-stone uppercase tracking-wide text-sm">
                {product.brand}
              </p>
            )}

            <h1 className="text-3xl font-light text-charcoal">
              {product.name}
            </h1>

            {product.volume && (
              <p className="text-stone">{product.volume}</p>
            )}

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gold">
                {currentPrice} TND
              </span>
              {hasDiscount && hasOriginalPrice && (
                <span className="text-xl text-stone line-through">
                  {originalPrice} TND
                </span>
              )}
            </div>

            {product.in_stock ? (
              <span className="inline-block text-green-600 font-medium">
                ✓ En stock
              </span>
            ) : (
              <span className="inline-block text-red-600 font-medium">
                ✗ Rupture de stock
              </span>
            )}

            {/* TABS HORIZONTAUX DORÉS */}
            <div className="border-t border-marble pt-6">
              {/* Tabs navigation */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-bold tracking-wide border-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gold text-charcoal border-gold'
                        : 'bg-white text-charcoal border-gold hover:bg-gold/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content avec troncature */}
              <div className="p-4 bg-white border border-marble rounded">
                {activeTab === 'livraison' ? (
                  getTabContent()
                ) : (
                  <TruncatedContent content={getTabContent()} maxLines={8} />
                )}
              </div>
            </div>

            {/* Bouton Ajouter au panier */}
            {product.in_stock ? (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <span className="text-charcoal font-medium">Quantité :</span>
                  <div className="flex items-center border border-marble rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-marble/50 transition-colors rounded-l-lg"
                    >
                      <Minus size={18} className="text-charcoal" />
                    </button>
                    <span className="px-6 py-3 text-charcoal font-medium min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-3 hover:bg-marble/50 transition-colors rounded-r-lg"
                    >
                      <Plus size={18} className="text-charcoal" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gold text-charcoal py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gold/90 transition-colors"
                >
                  <ShoppingCart size={24} />
                  Ajouter au panier
                </button>

                {inCart && cartQuantity > 0 && (
                  <p className="text-center text-stone text-sm">
                    Vous avez déjà {cartQuantity} de ce produit dans votre panier
                  </p>
                )}
              </div>
            ) : (
              <button
                disabled
                className="w-full bg-marble text-stone py-4 rounded-lg font-semibold text-lg cursor-not-allowed"
              >
                Produit indisponible
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Produit ajouté au panier !
              </h3>
              <p className="text-stone">
                {product.name} ({quantity} x {currentPrice} TND)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/cart"
                className="w-full bg-gold text-charcoal py-3 rounded-lg font-semibold text-center hover:bg-gold/90 transition-colors"
              >
                Voir le panier
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="w-full border border-gold text-gold py-3 rounded-lg font-semibold hover:bg-gold/10 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;