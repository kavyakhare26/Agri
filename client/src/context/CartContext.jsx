import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  const persist = (newItems) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addToCart = useCallback((resource, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === resource._id);
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i._id === resource._id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      } else {
        updated = [...prev, { ...resource, quantity: qty }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i._id !== id);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => {
      const updated = prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i));
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
