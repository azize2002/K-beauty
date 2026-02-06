import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  Star,
  Sparkles,
  Search,
  Percent,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';

const AdminProducts = () => {
  const { isAuthenticated, isAdmin, token, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price_tnd: '',
    original_price_tnd: '',
    discount_percentage: 0,
    description: '',
    image_url: '',
    format: '',
    in_stock: true,
    is_new: false,
    is_bestseller: false,
    quantity: 10
  });

  const categories = [
    'Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Sunscreen', 
    'Mask', 'Eye Care', 'Lip Care', 'Essence', 'Ampoule',
    'Foam Cleanser', 'Cleansing Oil', 'Cleansing Balm', 
    'Toner Pads', 'Sheet Mask', 'Sleeping Mask', 'Eye Patch',
    'Peeling Gel', 'Gel Cream', 'Eye Cream', 'Other'
  ];

  useEffect(() => {
    if (token && isAdmin) {
      fetchProducts();
    }
  }, [token, isAdmin]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Erreur API');
      }
      const data = await res.json();
      // S'assurer que data est un tableau
      setProducts(Array.isArray(data) ? data : []);
      setLoadingProducts(false);
    } catch (err) {
      console.error('Erreur:', err);
      setProducts([]);
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      price_tnd: '',
      original_price_tnd: '',
      discount_percentage: 0,
      description: '',
      image_url: '',
      format: '',
      in_stock: true,
      is_new: false,
      is_bestseller: false,
      quantity: 10
    });
    setError('');
  };

  // ADD PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.brand || !formData.category || !formData.price_tnd) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price_tnd: parseInt(formData.price_tnd),
          original_price_tnd: parseInt(formData.original_price_tnd || formData.price_tnd),
          discount_percentage: parseInt(formData.discount_percentage) || 0,
          quantity: parseInt(formData.quantity) || 10
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.detail || 'Erreur lors de l\'ajout');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  // EDIT PRODUCT
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      price_tnd: product.price_tnd || '',
      original_price_tnd: product.original_price_tnd || '',
      discount_percentage: product.discount_percentage || 0,
      description: product.description || '',
      image_url: product.image_url || '',
      format: product.format || '',
      in_stock: product.in_stock !== false,
      is_new: product.is_new || false,
      is_bestseller: product.is_bestseller || false,
      quantity: product.quantity || 10
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price_tnd: parseInt(formData.price_tnd),
          original_price_tnd: parseInt(formData.original_price_tnd || formData.price_tnd),
          discount_percentage: parseInt(formData.discount_percentage) || 0,
          quantity: parseInt(formData.quantity) || 10
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.detail || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  // DELETE PRODUCT
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // TOGGLE BESTSELLER
  const toggleBestseller = async (product) => {
    try {
      await fetch(`${API_URL}/api/admin/products/${product.id}/toggle-bestseller`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // TOGGLE NEW
  const toggleNew = async (product) => {
    try {
      await fetch(`${API_URL}/api/admin/products/${product.id}/toggle-new`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // TOGGLE STOCK
  const toggleStock = async (product) => {
    try {
      await fetch(`${API_URL}/api/admin/products/${product.id}/toggle-stock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Filtrer les produits (avec garde)
  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-stone">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-ivory py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span>Retour au dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-gold" />
            <h1 className="text-3xl font-light text-charcoal">Gestion des Produits</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Plus size={20} />
            Ajouter un produit
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            type="text"
            placeholder="Rechercher par nom ou marque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-marble rounded-lg focus:outline-none focus:border-gold"
          />
        </div>

        {/* Products Count */}
        <p className="text-stone mb-4">{filteredProducts.length} produit(s)</p>

        {/* Products Grid */}
        {loadingProducts ? (
          <p className="text-stone">Chargement des produits...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg border border-marble p-4">
                {/* Image */}
                <div className="relative mb-3">
                  <img
                    src={product.image_url || '/images/products/placeholder.png'}
                    alt={product.name}
                    className="w-full h-40 object-contain bg-marble/20 rounded"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_bestseller && (
                      <span className="bg-gold text-white text-xs px-2 py-1 rounded">Best-seller</span>
                    )}
                    {product.is_new && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Nouveau</span>
                    )}
                    {product.discount_percentage > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">-{product.discount_percentage}%</span>
                    )}
                  </div>
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                      <span className="text-white font-medium">Rupture de stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <p className="text-xs text-gold font-medium">{product.brand}</p>
                <h3 className="text-sm font-medium text-charcoal line-clamp-2 mb-2">{product.name}</h3>
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gold">{product.price_tnd} TND</span>
                  {product.discount_percentage > 0 && product.original_price_tnd > 0 && (
                    <span className="text-sm text-stone line-through">{product.original_price_tnd} TND</span>
                  )}
                </div>

                {/* Quantity */}
                <p className="text-xs text-stone mb-3">Stock: {product.quantity || 0} unités</p>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => toggleBestseller(product)}
                    className={`p-2 rounded ${product.is_bestseller ? 'bg-gold text-white' : 'bg-marble text-stone'}`}
                    title="Best-seller"
                  >
                    <Star size={16} />
                  </button>
                  <button
                    onClick={() => toggleNew(product)}
                    className={`p-2 rounded ${product.is_new ? 'bg-blue-500 text-white' : 'bg-marble text-stone'}`}
                    title="Nouveau"
                  >
                    <Sparkles size={16} />
                  </button>
                  <button
                    onClick={() => toggleStock(product)}
                    className={`p-2 rounded ${product.in_stock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    title="En stock"
                  >
                    <Package size={16} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-gold text-gold rounded hover:bg-gold hover:text-white transition-colors"
                  >
                    <Pencil size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="flex items-center justify-center p-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-marble">
                <h2 className="text-xl font-medium text-charcoal">Ajouter un produit</h2>
                <button onClick={() => setShowAddModal(false)} className="text-stone hover:text-charcoal">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-4 space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Nom *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Marque *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Catégorie *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Format</label>
                    <input
                      type="text"
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      placeholder="Ex: 50ml, 100g..."
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Prix (TND) *</label>
                    <input
                      type="number"
                      name="price_tnd"
                      value={formData.price_tnd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Prix original (TND)</label>
                    <input
                      type="number"
                      name="original_price_tnd"
                      value={formData.original_price_tnd}
                      onChange={handleInputChange}
                      placeholder="Si différent"
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Promo (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount_percentage"
                        value={formData.discount_percentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      />
                      <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Quantité en stock</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">URL de l'image</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="/images/products/..."
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={formData.in_stock}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">En stock</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">Nouveau</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={formData.is_bestseller}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">Best-seller</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 border border-marble text-stone rounded hover:bg-marble transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gold text-white rounded hover:bg-gold/90 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-marble">
                <h2 className="text-xl font-medium text-charcoal">Modifier le produit</h2>
                <button onClick={() => setShowEditModal(false)} className="text-stone hover:text-charcoal">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditProduct} className="p-4 space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Nom *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Marque *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Catégorie *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Format</label>
                    <input
                      type="text"
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      placeholder="Ex: 50ml, 100g..."
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-stone mb-1">Prix (TND) *</label>
                    <input
                      type="number"
                      name="price_tnd"
                      value={formData.price_tnd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Prix original (TND)</label>
                    <input
                      type="number"
                      name="original_price_tnd"
                      value={formData.original_price_tnd}
                      onChange={handleInputChange}
                      placeholder="Si différent"
                      className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone mb-1">Promo (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount_percentage"
                        value={formData.discount_percentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                      />
                      <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Quantité en stock</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">URL de l'image</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="/images/products/..."
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-marble rounded focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={formData.in_stock}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">En stock</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">Nouveau</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={formData.is_bestseller}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">Best-seller</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 border border-marble text-stone rounded hover:bg-marble transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gold text-white rounded hover:bg-gold/90 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-xl font-medium text-charcoal mb-4">Supprimer le produit ?</h2>
              <p className="text-stone mb-6">
                Êtes-vous sûr de vouloir supprimer <strong>"{selectedProduct.name}"</strong> ? 
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 border border-marble text-stone rounded hover:bg-marble transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;