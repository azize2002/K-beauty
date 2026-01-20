import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Truck, Clock, AlertTriangle, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (token && id) {
      fetchOrder();
    }
  }, [token, id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Commande non trouvée');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de l\'annulation');
      }

      // Rafraîchir la commande
      await fetchOrder();
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Rediriger si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-stone">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-600 mb-4">Erreur: {error || 'Commande non trouvée'}</p>
          <Link to="/profile" className="text-gold hover:text-gold/80">
            ← Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    const statuses = {
      'pending': { 
        text: 'En attente', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        description: 'Votre commande est en attente de confirmation.',
        canCancel: true
      },
      'confirmed': { 
        text: 'Confirmée', 
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        description: 'Votre commande a été confirmée et sera bientôt préparée.',
        canCancel: true
      },
      'preparing': { 
        text: 'En préparation', 
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        description: 'Votre commande est en cours de préparation.',
        canCancel: false
      },
      'shipped': { 
        text: 'Expédiée', 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        description: 'Votre commande est en route vers vous.',
        canCancel: false
      },
      'delivered': { 
        text: 'Livrée', 
        color: 'bg-green-100 text-green-700 border-green-300',
        description: 'Votre commande a été livrée avec succès.',
        canCancel: false
      },
      'cancelled': { 
        text: 'Annulée', 
        color: 'bg-red-100 text-red-700 border-red-300',
        description: 'Cette commande a été annulée.',
        canCancel: false
      },
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-700', description: '', canCancel: false };
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

  const statusInfo = getStatusInfo(order.status);

  // Timeline des statuts
  const statusTimeline = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];
  const currentStatusIndex = statusTimeline.indexOf(order.status);

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-stone hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour au profil
        </Link>

        {/* Titre et numéro */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-charcoal">Commande</h1>
            <p className="text-gold font-semibold text-lg">{order.order_number}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Message de statut */}
        <div className={`rounded-lg p-4 mb-6 border ${statusInfo.color}`}>
          <p className="text-sm">{statusInfo.description}</p>
        </div>

        {/* Timeline (sauf si annulée) */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-lg border border-marble p-6 mb-6">
            <h2 className="text-lg font-medium text-charcoal mb-4">Suivi de commande</h2>
            <div className="flex items-center justify-between">
              {statusTimeline.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const statusLabel = getStatusInfo(status).text;
                
                return (
                  <div key={status} className="flex-1 relative">
                    {/* Ligne */}
                    {index < statusTimeline.length - 1 && (
                      <div 
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          index < currentStatusIndex ? 'bg-gold' : 'bg-marble'
                        }`}
                      />
                    )}
                    
                    {/* Point */}
                    <div className="relative flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted 
                            ? 'bg-gold text-white' 
                            : 'bg-marble text-stone'
                        } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                      >
                        {isCompleted ? <Check size={16} /> : index + 1}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? 'text-gold font-medium' : 'text-stone'}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Articles */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-gold" />
            <h2 className="text-lg font-medium text-charcoal">Articles commandés</h2>
          </div>
          
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-marble last:border-0 last:pb-0">
                <img
                  src={item.product_image || '/images/products/placeholder.png'}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-xs text-stone uppercase">{item.brand}</p>
                  <p className="font-medium text-charcoal">{item.product_name}</p>
                  <p className="text-sm text-stone">Quantité: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-charcoal">{item.unit_price_tnd * item.quantity} TND</p>
                  <p className="text-xs text-stone">{item.unit_price_tnd} TND × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-marble mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Sous-total</span>
              <span className="text-charcoal">{order.subtotal_tnd} TND</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Livraison</span>
              <span className="text-charcoal">
                {order.delivery_fee_tnd === 0 ? (
                  <span className="text-green-600">Gratuite</span>
                ) : (
                  `${order.delivery_fee_tnd} TND`
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-marble">
              <span className="text-charcoal">Total</span>
              <span className="text-gold">{order.total_tnd} TND</span>
            </div>
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-gold" />
            <h2 className="text-lg font-medium text-charcoal">Adresse de livraison</h2>
          </div>
          
          <div className="text-charcoal space-y-1">
            <p className="font-medium">{order.shipping_address?.full_name}</p>
            <p>{order.shipping_address?.address_line1}</p>
            {order.shipping_address?.address_line2 && (
              <p>{order.shipping_address.address_line2}</p>
            )}
            <p>{order.shipping_address?.postal_code} {order.shipping_address?.city}</p>
            <p>{order.shipping_address?.governorate}</p>
            <p className="text-stone mt-2">Tél: {order.shipping_address?.phone}</p>
          </div>

          {order.delivery_notes && (
            <div className="mt-4 p-3 bg-marble/30 rounded-lg">
              <p className="text-sm text-stone">Note: {order.delivery_notes}</p>
            </div>
          )}
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck size={20} className="text-gold" />
            <h2 className="text-lg font-medium text-charcoal">Mode de paiement</h2>
          </div>
          <p className="text-charcoal">Paiement à la livraison</p>
        </div>

        {/* Date */}
        <div className="bg-white rounded-lg border border-marble p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-gold" />
            <h2 className="text-lg font-medium text-charcoal">Date de commande</h2>
          </div>
          <p className="text-charcoal">{formatDate(order.created_at)}</p>
        </div>

        {/* Bouton annuler */}
        {statusInfo.canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            <X size={20} />
            Annuler cette commande
          </button>
        )}
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Annuler cette commande ?
              </h3>
              <p className="text-stone">
                Cette action est irréversible. Êtes-vous sûr de vouloir annuler votre commande ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-marble text-charcoal py-3 rounded-lg font-semibold hover:bg-marble/50 transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;