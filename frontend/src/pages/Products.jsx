import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [didYouMean, setDidYouMean] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    let apiUrl = `${API_BASE_URL}/api/products?limit=200`;
    
    if (category) {
      apiUrl += `&category=${encodeURIComponent(category)}`;
    }
    if (brand) {
      apiUrl += `&brand=${encodeURIComponent(brand)}`;
    }
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    setLoading(true);
    setDidYouMean([]);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }
        return response.json();
      })
      .then(data => {
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);
        setLoading(false);

        // Si recherche et 0 résultats, chercher des suggestions
        if (search && fetchedProducts.length === 0) {
          fetchDidYouMean(search);
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [searchParams]);

  const fetchDidYouMean = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/did-you-mean?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setDidYouMean(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionClick = (term) => {
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const getPageTitle = () => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    if (category) {
      const categoryNames = {
        'Serum': 'Sérums',
        'Moisturizer': 'Crèmes',
        'Foam Cleanser': 'Nettoyants',
        'Sheet Mask': 'Masques',
        'Sunscreen': 'Protection Solaire',
        'Toner': 'Toners',
        'serum': 'Sérums',
        'moisturizer': 'Crèmes',
        'foam cleanser': 'Nettoyants',
        'sheet mask': 'Masques',
        'sunscreen': 'Protection Solaire',
        'toner': 'Toners',
        'Cleanser': 'Nettoyants',
        'cleanser': 'Nettoyants',
        'Mask': 'Masques',
        'mask': 'Masques',
        'Essence': 'Essences',
        'essence': 'Essences',
        'Ampoule': 'Ampoules',
        'ampoule': 'Ampoules',
        'Eye Care': 'Soins des Yeux',
        'eye care': 'Soins des Yeux',
        'Eye Cream': 'Crèmes Contour des Yeux',
        'eye cream': 'Crèmes Contour des Yeux',
        'Lip Care': 'Soins des Lèvres',
        'lip care': 'Soins des Lèvres',
        'Sleeping Mask': 'Masques de Nuit',
        'sleeping mask': 'Masques de Nuit',
        'Toner Pads': 'Pads Toniques',
        'toner pads': 'Pads Toniques',
        'Cleansing Oil': 'Huiles Démaquillantes',
        'cleansing oil': 'Huiles Démaquillantes',
        'Cleansing Balm': 'Baumes Démaquillants',
        'cleansing balm': 'Baumes Démaquillants',
        'Gel Cream': 'Gel-Crèmes',
        'gel cream': 'Gel-Crèmes',
        'Peeling Gel': 'Gels Exfoliants',
        'peeling gel': 'Gels Exfoliants',
        'Eye Patch': 'Patchs Yeux',
        'eye patch': 'Patchs Yeux',
      };
      return categoryNames[category] || category;
    }
    if (brand) return brand;
    if (search) return `Résultats pour "${search}"`;
    return 'Tous nos Produits';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-light text-charcoal text-center mb-12">
            {getPageTitle()}
          </h1>
          <div className="flex justify-center">
            <div className="animate-spin w-10 h-10 border-3 border-gold border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-light text-charcoal text-center mb-12">
            {getPageTitle()}
          </h1>
          <p className="text-center text-red-600">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  const search = searchParams.get('search');

  return (
    <div className="min-h-screen bg-ivory py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-light text-charcoal text-center mb-4 md:mb-8">
          {getPageTitle()}
        </h1>
        
        <p className="text-center text-stone mb-6 md:mb-8 text-sm md:text-base">
          {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
        </p>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-marble/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-stone" />
            </div>
            
            <h2 className="text-xl font-medium text-charcoal mb-2">
              Aucun produit trouvé
            </h2>
            
            {search && (
              <p className="text-stone mb-6">
                Aucun résultat pour "<span className="font-medium">{search}</span>"
              </p>
            )}

            {/* Suggestions "Vouliez-vous dire..." */}
            {didYouMean.length > 0 && (
              <div className="mt-8 p-6 bg-white rounded-xl border border-marble max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4 text-gold">
                  <AlertCircle size={20} />
                  <span className="font-medium">Vouliez-vous dire ?</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {didYouMean.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-charcoal rounded-full transition-colors font-medium capitalize"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions populaires si pas de "did you mean" */}
            {didYouMean.length === 0 && (
              <div className="mt-8">
                <p className="text-stone mb-4">Essayez avec :</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Serum', 'Sunscreen', 'COSRX', 'ANUA', 'Moisturizer'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-4 py-2 bg-marble/50 hover:bg-gold/20 text-charcoal rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;