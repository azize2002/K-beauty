import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, ShoppingBag, Package, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const Profile = () => {
  const { user, isAuthenticated, logout, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [changedOrders, setChangedOrders] = useState(new Set());

  // Charger les commandes
  useEffect(() => {
    if (token) {
      fetch('' + process.env.REACT_APP_API_URL + '/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Non autorisé');
          }
          return res.json();
        })
        .then(data => {
          // S'assurer que data est bien un tableau
          const ordersArray = Array.isArray(data) ? data : [];
          setOrders(ordersArray);
          
          // Récupérer les statuts vus précédemment
          const previousStatuses = JSON.parse(localStorage.getItem('kbeauty_seen_statuses') || '{}');
          
          // Détecter les commandes avec changement de statut
          const changed = new Set();
          ordersArray.forEach(order => {
            if (previousStatuses[order.id] && previousStatuses[order.id] !== order.status) {
              changed.add(order.id);
            }
          });
          setChangedOrders(changed);
          
          // Marquer tous les statuts comme vus
          const seenStatuses = {};
          ordersArray.forEach(order => {
            seenStatuses[order.id] = order.status;
          });
          localStorage.setItem('kbeauty_seen_statuses', JSON.stringify(seenStatuses));
          
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error('Erreur:', err);
          setOrders([]); // Initialiser à tableau vide en cas d'erreur
          setLoadingOrders(false);
        });
    } else {
      setLoadingOrders(false);
    }
  }, [token]);

  // Rediriger si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': { text: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      'confirmed': { text: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
      'preparing': { text: 'En préparation', color: 'bg-purple-100 text-purple-700' },
      'shipped': { text: 'Expédiée', color: 'bg-indigo-100 text-indigo-700' },
      'delivered': { text: 'Livrée', color: 'bg-green-100 text-green-700' },
      'cancelled': { text: 'Annulée', color: 'bg-red-100 text-red-700' },
    };
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-light text-charcoal text-center mb-12">
          Mon Profil
        </h1>

        {/* Infos utilisateur */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-charcoal">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-stone text-sm">
                {user?.role === 'admin' ? 'Administrateur' : 'Client'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-charcoal">
              <Mail size={20} className="text-stone" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-charcoal">
              <Phone size={20} className="text-stone" />
              <span>{user?.phone || 'Non renseigné'}</span>
            </div>
          </div>
        </div>

        {/* Mes commandes */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Package size={24} className="text-gold" />
            <h2 className="text-xl font-medium text-charcoal">Mes commandes</h2>
          </div>

          {loadingOrders ? (
            <p className="text-stone text-center py-4">Chargement...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={48} className="mx-auto text-stone mb-3" />
              <p className="text-stone">Aucune commande pour le moment</p>
              <Link
                to="/products"
                className="inline-block mt-4 text-gold hover:text-gold/80 font-medium"
              >
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = getStatusLabel(order.status);
                const hasChanged = changedOrders.has(order.id);
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className={`block border rounded-lg p-4 hover:border-gold hover:shadow-md transition-all cursor-pointer group ${
                      hasChanged ? 'border-gold bg-gold/5' : 'border-marble'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gold">{order.order_number}</span>
                        {hasChanged && (
                          <span className="text-xs bg-gold text-white px-2 py-0.5 rounded-full animate-pulse">
                            Mise à jour
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                        <ChevronRight size={18} className="text-stone group-hover:text-gold transition-colors" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-stone">
                        <Clock size={14} />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <span className="font-medium text-charcoal">
                        {order.total_tnd} TND
                      </span>
                    </div>
                    <p className="text-xs text-stone mt-2">
                      {order.items_count} article{order.items_count > 1 ? 's' : ''}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Lien Admin (si admin) */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-3 bg-gold text-charcoal rounded-lg p-4 hover:bg-gold/90 transition-colors font-semibold"
            >
              <Package size={20} />
              <span>Panel Administrateur</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="flex items-center gap-3 bg-white rounded-lg border border-marble p-4 hover:border-gold transition-colors"
          >
            <ShoppingBag size={20} className="text-gold" />
            <span className="text-charcoal">Mon Panier</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-white rounded-lg border border-red-200 p-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut size={20} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;