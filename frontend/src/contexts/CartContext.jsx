import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialiser directement depuis localStorage pour éviter l'écrasement
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return [];
    
    const savedCart = localStorage.getItem('kbeauty_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('kbeauty_cart');
        return [];
      }
    }
    return [];
  });

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('kbeauty_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price_tnd: product.price_tnd,
            original_price_tnd: product.original_price_tnd,
            discount_percentage: product.discount_percentage,
            image_url: product.image_url,
            quantity: quantity,
            in_stock: product.in_stock,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price_tnd * item.quantity, 0);
  };

  const getTotal = (deliveryFee = 7) => {
    const subtotal = getSubtotal();
    return subtotal >= 100 ? subtotal : subtotal + deliveryFee;
  };

  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  const getProductQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getSubtotal,
    getTotal,
    isInCart,
    getProductQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};