import React, { useState, useEffect } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Appel API pour récupérer TOUS les produits (limit=200 au lieu de 20 par défaut)
    fetch('http://localhost:8000/api/products?limit=200')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }
        return response.json();
      })
      .then(data => {
        // L'API retourne {products: [...]}
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-charcoal text-center mb-12">
            Nos Produits
          </h1>
          <p className="text-center text-stone">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-charcoal text-center mb-12">
            Nos Produits
          </h1>
          <p className="text-center text-red-600">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light text-charcoal text-center mb-12">
          Nos Produits
        </h1>
        
        <p className="text-center text-stone mb-8">
          {products.length} produits disponibles
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={`http://localhost:8000${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                ) : (
                  <span className="text-gray-400">Pas d'image</span>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-charcoal mb-1 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-stone mb-2">
                  {product.brand}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    {product.discount_percentage > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-rose-600">
                          {product.price}€
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {product.original_price}€
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-charcoal">
                        {product.price}€
                      </span>
                    )}
                  </div>
                  
                  {product.discount_percentage > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-xs px-2 py-1 rounded">
                      -{product.discount_percentage}%
                    </span>
                  )}
                </div>
                
                {product.in_stock ? (
                  <span className="inline-block mt-2 text-xs text-green-600">
                    En stock
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-xs text-red-600">
                    Rupture de stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;