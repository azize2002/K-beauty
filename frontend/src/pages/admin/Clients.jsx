import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Phone, ShoppingBag, Calendar, X, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminClients = () => {
  const { isAuthenticated, isAdmin, token, loading } = useAuth();
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal pour voir les détails
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchClients = () => {
    fetch('' + process.env.REACT_APP_API_URL + '/api/admin/clients', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur API');
        }
        return res.json();
      })
      .then(data => {
        // S'assurer que data est un tableau
        setClients(Array.isArray(data) ? data : []);
        setLoadingClients(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setClients([]);
        setLoadingClients(false);
      });
  };

  useEffect(() => {
    if (token && isAdmin) {
      fetchClients();
    }
  }, [token, isAdmin]);

  const openDetailModal = async (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
    setLoadingDetails(true);

    try {
      const response = await fetch(`' + process.env.REACT_APP_API_URL + '/api/admin/clients/${client.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Erreur API');
      }
      const data = await response.json();
      setClientOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error('Erreur:', err);
      setClientOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Filtrer avec garde Array.isArray
  const filteredClients = Array.isArray(clients) ? clients.filter(c =>
    c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  ) : [];

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

        <div className="flex items-center gap-3 mb-8">
          <Users size={32} className="text-gold" />
          <h1 className="text-3xl font-light text-charcoal">Gestion des clients</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full pl-4 pr-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
          />
        </div>

        {/* Clients count */}
        <p className="text-stone mb-4">{filteredClients.length} client(s)</p>

        {/* Clients List */}
        {loadingClients ? (
          <p className="text-stone">Chargement...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-stone">Aucun client trouvé</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="bg-white rounded-lg border border-marble p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                      <span className="text-gold font-semibold text-lg">
                        {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-charcoal">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-xs text-stone">
                        Client depuis {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-stone" />
                    <span className="text-charcoal truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-stone" />
                    <span className="text-charcoal">{client.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 py-3 border-t border-marble">
                  <div className="flex items-center gap-1">
                    <ShoppingBag size={14} className="text-gold" />
                    <span className="text-sm font-medium text-charcoal">{client.orders_count || 0} commande(s)</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-stone">Total: </span>
                    <span className="font-semibold text-gold">{client.total_spent || 0} TND</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => openDetailModal(client)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 border border-gold text-gold rounded-lg hover:bg-gold/10 transition-colors text-sm font-medium"
                >
                  <Eye size={16} />
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Détails Client */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-charcoal">Détails du client</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-stone hover:text-charcoal">
                <X size={24} />
              </button>
            </div>

            {/* Client Info */}
            <div className="bg-marble/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
                  <span className="text-gold font-semibold text-2xl">
                    {selectedClient.first_name?.charAt(0)}{selectedClient.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-charcoal">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </h3>
                  <p className="text-stone text-sm">
                    Client depuis {formatDate(selectedClient.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-stone" />
                  <span className="text-charcoal">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-stone" />
                  <span className="text-charcoal">{selectedClient.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-marble">
                <div>
                  <span className="text-stone text-sm">Commandes: </span>
                  <span className="font-semibold text-charcoal">{selectedClient.orders_count || 0}</span>
                </div>
                <div>
                  <span className="text-stone text-sm">Total dépensé: </span>
                  <span className="font-semibold text-gold">{selectedClient.total_spent || 0} TND</span>
                </div>
              </div>
            </div>

            {/* Orders History */}
            <h3 className="font-medium text-charcoal mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" />
              Historique des commandes
            </h3>

            {loadingDetails ? (
              <p className="text-stone text-center py-4">Chargement...</p>
            ) : clientOrders.length === 0 ? (
              <p className="text-stone text-center py-4">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {clientOrders.map(order => {
                  const status = getStatusLabel(order.status);
                  return (
                    <div
                      key={order.id}
                      className="border border-marble rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gold">{order.order_number}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-stone">
                          <Calendar size={14} />
                          <span>{formatDateTime(order.created_at)}</span>
                        </div>
                        <span className="font-medium text-charcoal">{order.total_tnd} TND</span>
                      </div>
                      
                      {/* Order Items */}
                      <div className="mt-3 pt-3 border-t border-marble">
                        <p className="text-xs text-stone mb-2">Articles :</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="text-xs bg-marble/50 px-2 py-1 rounded">
                              {item.product_name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="mt-3 pt-3 border-t border-marble text-xs text-stone">
                          <p>Livraison: {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.governorate}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 py-2 border border-marble text-charcoal rounded-lg font-medium hover:bg-marble/50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;