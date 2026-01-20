import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba",
  "Nabeul", "Zaghouan", "Bizerte",
  "Béja", "Jendouba", "Le Kef", "Siliana",
  "Kairouan", "Kasserine", "Sidi Bouzid",
  "Sousse", "Monastir", "Mahdia", "Sfax",
  "Gafsa", "Tozeur", "Kébili",
  "Gabès", "Médenine", "Tataouine"
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();

  const [step, setStep] = useState(1); // 1: Adresse, 2: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    full_name: user ? `${user.first_name} ${user.last_name}` : '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    governorate: '',
  });

  const [deliveryNotes, setDeliveryNotes] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 100 ? 0 : 7;
  const total = subtotal + deliveryFee;

  // Rediriger si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Rediriger si panier vide
  if (cart.length === 0 && step !== 2) {
    return <Navigate to="/cart" />;
  }

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    setError('');
  };

  const validateAddress = () => {
    const { full_name, phone, address_line1, city, postal_code, governorate } = shippingAddress;
    if (!full_name || !phone || !address_line1 || !city || !postal_code || !governorate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateAddress()) return;
    
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image_url,
          brand: item.brand,
          quantity: item.quantity,
          unit_price_tnd: item.price_tnd,
        })),
        shipping_address: shippingAddress,
        delivery_notes: deliveryNotes,
        payment_method: 'cash_on_delivery',
      };

      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la commande');
      }

      // Succès !
      setOrderNumber(data.order_number);
      clearCart();
      setStep(2);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ÉTAPE 2 : Confirmation
  if (step === 2) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-lg border border-marble p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-charcoal mb-2">
              Commande confirmée !
            </h1>
            
            <p className="text-stone mb-6">
              Merci pour votre commande. Vous recevrez un appel pour confirmer la livraison.
            </p>

            <div className="bg-marble/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-stone">Numéro de commande</p>
              <p className="text-xl font-bold text-gold">{orderNumber}</p>
            </div>

            <div className="space-y-3">
              <Link
                to="/profile"
                className="block w-full bg-gold text-charcoal py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                Voir mes commandes
              </Link>
              <Link
                to="/products"
                className="block w-full border border-gold text-gold py-3 rounded-lg font-semibold hover:bg-gold/10 transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-stone hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour au panier
        </Link>

        <h1 className="text-3xl font-light text-charcoal mb-8">Finaliser la commande</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adresse de livraison */}
            <div className="bg-white rounded-lg border border-marble p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-gold" />
                <h2 className="text-xl font-medium text-charcoal">Adresse de livraison</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                      placeholder="Nom et prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={shippingAddress.address_line1}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                    placeholder="Rue, numéro, immeuble..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Complément d'adresse
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    value={shippingAddress.address_line2}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                    placeholder="Appartement, étage... (optionnel)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Ville *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                      placeholder="Ville"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Gouvernorat *
                  </label>
                  <select
                    name="governorate"
                    value={shippingAddress.governorate}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="">Sélectionnez un gouvernorat</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Notes de livraison
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
                    rows={3}
                    placeholder="Instructions spéciales pour la livraison... (optionnel)"
                  />
                </div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="bg-white rounded-lg border border-marble p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck size={24} className="text-gold" />
                <h2 className="text-xl font-medium text-charcoal">Mode de paiement</h2>
              </div>

              <div className="p-4 border-2 border-gold bg-gold/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <Truck size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Paiement à la livraison</p>
                    <p className="text-sm text-stone">
                      Payez en espèces à la réception de votre commande
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton Commander */}
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-gold text-charcoal py-4 rounded-lg font-semibold text-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-marble p-6 sticky top-24">
              <h2 className="text-lg font-medium text-charcoal mb-4">
                Récapitulatif
              </h2>

              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-charcoal">
                      {item.price_tnd * item.quantity} TND
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-marble pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Sous-total</span>
                  <span className="text-charcoal">{subtotal} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Livraison</span>
                  <span className="text-charcoal">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      `${deliveryFee} TND`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-marble">
                  <span className="text-charcoal">Total</span>
                  <span className="text-gold">{total} TND</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="text-xs text-stone mt-4 text-center">
                  Plus que <span className="text-gold font-medium">{100 - subtotal} TND</span> pour la livraison gratuite !
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;