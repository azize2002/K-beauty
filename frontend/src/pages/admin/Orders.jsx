import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  { value: 'preparing', label: 'En préparation', color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-700' },
];

const AdminOrders = () => {
  const { isAuthenticated, isAdmin, token, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    let url = 'http://localhost:8000/api/admin/orders';
    if (filterStatus) {
      url += `?status=${filterStatus}`;
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    if (token && isAdmin) {
      fetchOrders();
    }
  }, [token, isAdmin, filterStatus]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Attendre que l'auth soit chargée
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-stone">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link to="/admin" className="inline-flex items-center gap-2 text-stone hover:text-gold mb-6">
          <ArrowLeft size={20} />
          Retour au dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-charcoal">Gestion des commandes</h1>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-marble rounded-lg focus:outline-none focus:border-gold"
          >
            <option value="">Toutes les commandes</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <p className="text-stone">Chargement...</p>
        ) : orders.length === 0 ? (
          <p className="text-stone">Aucune commande</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-marble p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-semibold text-gold text-lg">{order.order_number}</span>
                      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-charcoal">{order.total_tnd} TND</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-stone">Client</p>
                      <p className="text-charcoal">{order.shipping_address?.full_name}</p>
                      <p className="text-charcoal">{order.user_phone}</p>
                    </div>
                    <div>
                      <p className="text-stone">Adresse</p>
                      <p className="text-charcoal">{order.shipping_address?.address_line1}</p>
                      <p className="text-charcoal">{order.shipping_address?.city}, {order.shipping_address?.governorate}</p>
                    </div>
                    <div>
                      <p className="text-stone">Date</p>
                      <p className="text-charcoal">{formatDate(order.created_at)}</p>
                      <p className="text-charcoal">{order.items?.length} article(s)</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-marble pt-4 mb-4">
                    <p className="text-sm text-stone mb-2">Articles :</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="text-xs bg-marble/50 px-2 py-1 rounded">
                          {item.product_name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(status => (
                      <button
                        key={status.value}
                        onClick={() => updateStatus(order.id, status.value)}
                        disabled={order.status === status.value}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          order.status === status.value
                            ? 'bg-gold text-white'
                            : 'bg-marble/50 text-charcoal hover:bg-gold/20'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;