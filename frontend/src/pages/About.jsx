import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Leaf, Sparkles, Truck, Shield, MessageCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gold/10 via-ivory to-rose-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-6">
            Bienvenue chez <span className="text-gold font-medium">K-Beauty</span>
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-8"></div>
          <p className="text-lg text-stone leading-relaxed max-w-2xl mx-auto">
            Votre destination en Tunisie pour les meilleurs produits de beauté coréenne. 
            Nous sélectionnons avec soin des soins authentiques pour révéler l'éclat naturel de votre peau.
          </p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-light text-charcoal mb-6">
                Notre Histoire
              </h2>
              <div className="w-16 h-0.5 bg-gold mb-6"></div>
              <p className="text-stone mb-4 leading-relaxed">
                Passionnés par la beauté coréenne et ses rituels de soins ancestraux, 
                nous avons créé K-Beauty Tunisia pour partager cette philosophie unique 
                avec les Tunisiennes et Tunisiens.
              </p>
              <p className="text-stone mb-4 leading-relaxed">
                La K-Beauty, c'est bien plus qu'une routine beauté : c'est un art de vivre 
                qui privilégie la prévention, l'hydratation et le respect de la peau. 
                Chaque produit que nous proposons a été soigneusement sélectionné pour 
                son efficacité et la qualité de ses ingrédients.
              </p>
              <p className="text-stone leading-relaxed">
                Notre mission ? Vous accompagner dans votre parcours skincare avec des 
                produits authentiques, des conseils personnalisés et un service irréprochable.
              </p>
            </div>
            <div className="relative">
              {/* Image thématique K-Beauty */}
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-square">
                <img 
                  src="/images/about-hero.svg" 
                  alt="K-Beauty Skincare"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/categories/serums.jpg';
                  }}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                    <Sparkles className="text-gold" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">+180</p>
                    <p className="text-xs text-stone">Produits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-charcoal mb-4">Nos Valeurs</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="text-gold" size={36} />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">Naturalité</h3>
              <p className="text-stone text-sm leading-relaxed">
                Des formules enrichies en ingrédients naturels : centella asiatica, 
                mucine d'escargot, propolis, thé vert, riz fermenté...
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-gold" size={36} />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">Authenticité</h3>
              <p className="text-stone text-sm leading-relaxed">
                100% de produits originaux importés directement de Corée du Sud. 
                Nous garantissons l'authenticité de chaque article.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-gold" size={36} />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">Bienveillance</h3>
              <p className="text-stone text-sm leading-relaxed">
                Une approche douce et respectueuse de la peau. Pas de promesses 
                irréalistes, juste des soins efficaces et des conseils sincères.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-charcoal mb-4">Pourquoi K-Beauty Tunisia ?</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-marble hover:border-gold/30 transition-colors">
              <Truck className="text-gold mb-4" size={28} />
              <h3 className="font-medium text-charcoal mb-2">Livraison Rapide</h3>
              <p className="text-sm text-stone">
                Livraison partout en Tunisie sous 24-72h
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-marble hover:border-gold/30 transition-colors">
              <Shield className="text-gold mb-4" size={28} />
              <h3 className="font-medium text-charcoal mb-2">Produits Authentiques</h3>
              <p className="text-sm text-stone">
                Garantie 100% originaux de Corée du Sud
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-marble hover:border-gold/30 transition-colors">
              <MessageCircle className="text-gold mb-4" size={28} />
              <h3 className="font-medium text-charcoal mb-2">Conseils Experts</h3>
              <p className="text-sm text-stone">
                Une équipe passionnée pour vous guider
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-marble hover:border-gold/30 transition-colors">
              <Sparkles className="text-gold mb-4" size={28} />
              <h3 className="font-medium text-charcoal mb-2">+180 Produits</h3>
              <p className="text-sm text-stone">
                Large sélection des meilleures marques
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-charcoal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light text-white mb-4">
            Prête à révéler votre éclat ?
          </h2>
          <p className="text-white/70 mb-8">
            Découvrez notre sélection de produits et commencez votre routine K-Beauty dès aujourd'hui.
          </p>
          <Link
            to="/products"
            className="inline-block bg-gold text-charcoal px-8 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
          >
            Découvrir nos produits
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone mb-2">Une question ? Contactez-nous</p>
          <p className="text-charcoal font-medium">
            📧 contact@kbeauty.tn &nbsp;•&nbsp; 📱 +216 XX XXX XXX
          </p>
          <p className="text-stone text-sm mt-4">
            Suivez-nous sur Instagram : @kbeauty.tunisia
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;