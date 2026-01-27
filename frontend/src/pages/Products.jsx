import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

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

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }
        return response.json();
      })
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [searchParams]);

  const getPageTitle = () => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    if (category) {
      const categoryNames = {
        'serum': 'Sérums',
        'moisturizer': 'Crèmes',
        'cleanser': 'Nettoyants',
        'mask': 'Masques',
        'sunscreen': 'Protection Solaire',
        'toner': 'Toners'
      };
      return categoryNames[category] || 'Catégorie';
    }
    if (brand) return `Marque : ${brand}`;
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
          <p className="text-center text-stone">Chargement des produits...</p>
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
          <p className="text-center text-stone">Aucun produit trouvé pour cette sélection.</p>
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