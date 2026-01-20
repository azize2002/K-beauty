import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Images de catégories avec les VRAIES catégories de la DB
  const categories = [
    { name: 'Sérums', slug: 'Serum', image: '/images/categories/serums.png' },
    { name: 'Crèmes', slug: 'Moisturizer', image: '/images/categories/cremes.png' },
    { name: 'Nettoyants', slug: 'Foam Cleanser', image: '/images/categories/nettoyants.png' },
    { name: 'Masques', slug: 'Sheet Mask', image: '/images/categories/masques.png' },
    { name: 'Protection Solaire', slug: 'Sunscreen', image: '/images/categories/protection-solaire.png' },
    { name: 'Toners', slug: 'Toner', image: '/images/categories/toners.png' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, brandsRes] = await Promise.all([
          fetch('http://localhost:8000/api/products/bestsellers?limit=8'),
          fetch('http://localhost:8000/api/brands'),
        ]);
        const productsData = await productsRes.json();
        const brandsData = await brandsRes.json();
        setFeaturedProducts(productsData || []);
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Section */}
      <section className="relative h-screen max-h-[800px] min-h-[600px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero/photoherokbeauty.jpeg')" }}
        >
          <div className="absolute inset-0 bg-charcoal/40" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-4xl md:text-6xl font-light text-ivory mb-4">
            K-Beauty, le luxe accessible
          </h1>
          <p className="text-lg md:text-xl text-ivory/90 mb-8 max-w-2xl">
            L'authenticité au cœur de nos sélections
          </p>
          <Link
            to="/products"
            className="bg-gold text-charcoal px-8 py-3 font-medium hover:bg-gold/90 transition-colors duration-200"
          >
            Découvrir
          </Link>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-marble py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center">
          <p className="text-charcoal font-medium">
            <span className="text-gold">-10%</span> sur votre 1ère commande
          </p>
          <p className="text-charcoal font-medium">
            Livraison gratuite dès <span className="text-gold">100 TND</span>
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light text-charcoal text-center mb-12">
            Nos Catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group bg-white border border-marble rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="text-charcoal font-medium group-hover:text-gold transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center text-gold hover:text-gold/80 font-medium transition-colors"
            >
              Voir tout <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light text-charcoal text-center mb-12">
            Best-sellers
          </h2>
          {loading ? (
            <p className="text-center text-stone">Chargement...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center text-gold hover:text-gold/80 font-medium transition-colors"
            >
              Voir tout <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light text-charcoal text-center mb-12">
            Nos Marques Partenaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {brands.slice(0, 10).map((brand) => (
              <Link
                key={brand.name || brand}
                to={`/products?brand=${brand.name || brand}`}
                className="bg-white border border-marble rounded-lg p-4 text-center hover:shadow-lg hover:border-gold transition-all duration-200"
              >
                <p className="text-charcoal font-medium text-sm">
                  {brand.name || brand}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;