import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Brands = () => {
  const [brandsWithProducts, setBrandsWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandsWithProducts = async () => {
      try {
        // Récupérer les marques
        const brandsRes = await fetch('http://localhost:8000/api/brands');
        const brands = await brandsRes.json();

        // Pour chaque marque, récupérer un produit représentatif
        const brandsWithProductsData = await Promise.all(
          brands.map(async (brand) => {
            try {
              const productsRes = await fetch(
                `http://localhost:8000/api/products?brand=${encodeURIComponent(brand.name)}&limit=1`
              );
              const productsData = await productsRes.json();
              const representativeProduct = productsData.products?.[0] || null;
              
              return {
                ...brand,
                representativeProduct,
              };
            } catch (err) {
              return { ...brand, representativeProduct: null };
            }
          })
        );

        setBrandsWithProducts(brandsWithProductsData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setLoading(false);
      }
    };

    fetchBrandsWithProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-light text-charcoal text-center mb-12">
            Nos Marques
          </h1>
          <div className="flex justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <Sparkles className="text-gold mb-4" size={32} />
              <p className="text-stone">Chargement des marques...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light text-charcoal mb-4">
            Nos Marques
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6"></div>
          <p className="text-stone max-w-2xl mx-auto">
            Découvrez notre sélection de {brandsWithProducts.length} marques coréennes 
            premium, reconnues pour leur innovation et leur efficacité.
          </p>
        </div>

        {/* Grid des marques */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brandsWithProducts.map((brand) => (
            <Link
              key={brand.name}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-marble hover:border-gold/30">
                {/* Image du produit représentatif */}
                <div className="relative aspect-square bg-gradient-to-br from-marble/30 to-white overflow-hidden">
                  {brand.representativeProduct?.image_url ? (
                    <img
                      src={brand.representativeProduct.image_url}
                      alt={brand.name}
                      className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/images/products/placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="text-gold/30" size={48} />
                    </div>
                  )}
                  
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Badge nombre de produits */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-charcoal">
                      {brand.product_count} produit{brand.product_count > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* CTA au hover */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center justify-center gap-2 bg-white text-charcoal py-2 rounded-lg font-medium text-sm">
                      <span>Découvrir</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Info marque */}
                <div className="p-4 text-center border-t border-marble/50">
                  <h2 className="font-semibold text-charcoal text-lg tracking-wide group-hover:text-gold transition-colors duration-300">
                    {brand.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Section avantages */}
        <div className="mt-20 bg-white rounded-2xl p-8 md:p-12 border border-marble">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-light text-charcoal mb-2">
              Pourquoi la K-Beauty ?
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="font-medium text-charcoal mb-2">Innovation</h3>
              <p className="text-sm text-stone">
                Des formules avancées issues de la recherche coréenne en dermatologie.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="font-medium text-charcoal mb-2">Ingrédients Naturels</h3>
              <p className="text-sm text-stone">
                Des actifs naturels puissants : centella, thé vert, riz, propolis...
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-medium text-charcoal mb-2">Résultats Visibles</h3>
              <p className="text-sm text-stone">
                Une peau éclatante et hydratée grâce à des routines efficaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;