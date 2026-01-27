import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, token, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (token && isAdmin) {
      fetch('' + process.env.REACT_APP_API_URL + '/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoadingStats(false);
        })
        .catch(err => {
          console.error('Erreur:', err);
          setLoadingStats(false);
        });
    }
  }, [token, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-stone">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard size={32} className="text-gold" />
          <h1 className="text-3xl font-light text-charcoal">Panel Admin</h1>
        </div>

        {loadingStats ? (
          <p className="text-stone">Chargement des statistiques...</p>
        ) : stats ? (
          <>
            {/* Stats Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock size={24} className="text-yellow-500" />
                  <span className="text-3xl font-bold text-charcoal">{stats.pending_orders}</span>
                </div>
                <p className="text-stone text-sm">Commandes en attente</p>
              </div>

              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingBag size={24} className="text-blue-500" />
                  <span className="text-3xl font-bold text-charcoal">{stats.total_orders}</span>
                </div>
                <p className="text-stone text-sm">Total commandes</p>
              </div>

              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={24} className="text-green-500" />
                  <span className="text-3xl font-bold text-gold">{stats.total_revenue} TND</span>
                </div>
                <p className="text-stone text-sm">Chiffre d'affaires (livrées)</p>
              </div>

              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={24} className="text-purple-500" />
                  <span className="text-3xl font-bold text-charcoal">{stats.potential_revenue} TND</span>
                </div>
                <p className="text-stone text-sm">CA potentiel (en cours)</p>
              </div>
            </div>

            {/* Stats Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package size={24} className="text-gold" />
                  <span className="text-3xl font-bold text-charcoal">{stats.total_products}</span>
                </div>
                <p className="text-stone text-sm">Produits</p>
              </div>

              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users size={24} className="text-indigo-500" />
                  <span className="text-3xl font-bold text-charcoal">{stats.total_users}</span>
                </div>
                <p className="text-stone text-sm">Clients inscrits</p>
              </div>

              <div className="bg-white rounded-lg border border-marble p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle size={24} className="text-green-500" />
                  <span className="text-3xl font-bold text-charcoal">{stats.delivered_orders}</span>
                </div>
                <p className="text-stone text-sm">Commandes livrées</p>
              </div>
            </div>

            {/* Top 8 Produits */}
            {stats.top_products && stats.top_products.length > 0 && (
              <div className="bg-white rounded-lg border border-marble p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy size={24} className="text-gold" />
                  <h2 className="text-xl font-medium text-charcoal">Top 8 Produits les plus vendus</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.top_products.map((product, index) => (
                    <div key={product._id} className="flex items-center gap-3 p-3 bg-marble/20 rounded-lg">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-gold text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-marble text-charcoal'
                      }`}>
                        {index + 1}
                      </span>
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal line-clamp-1">{product.product_name}</p>
                        <p className="text-xs text-stone">{product.brand}</p>
                        <p className="text-xs text-gold font-semibold">{product.total_sold} vendus</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-red-500">Erreur de chargement</p>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/orders"
            className="bg-white rounded-lg border border-marble p-6 hover:border-gold transition-colors flex items-center gap-4"
          >
            <ShoppingBag size={32} className="text-gold" />
            <div>
              <h3 className="font-medium text-charcoal">Gérer les commandes</h3>
              <p className="text-sm text-stone">Voir et modifier les statuts</p>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white rounded-lg border border-marble p-6 hover:border-gold transition-colors flex items-center gap-4"
          >
            <Package size={32} className="text-gold" />
            <div>
              <h3 className="font-medium text-charcoal">Gérer les produits</h3>
              <p className="text-sm text-stone">Ajouter, modifier, supprimer</p>
            </div>
          </Link>

          <Link
            to="/admin/clients"
            className="bg-white rounded-lg border border-marble p-6 hover:border-gold transition-colors flex items-center gap-4"
          >
            <Users size={32} className="text-gold" />
            <div>
              <h3 className="font-medium text-charcoal">Voir les clients</h3>
              <p className="text-sm text-stone">Coordonnées et historique</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;