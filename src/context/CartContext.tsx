"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface GearItem {
  id: string;
  name: string;
  category: "Camera" | "Lenses" | "Lighting" | "Audio" | "Grip";
  dailyRate: number;
  image: string;
  specs: string[];
}

interface CartItem extends GearItem {
  days: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: GearItem) => void;
  removeFromCart: (id: string) => void;
  updateDays: (id: string, days: number) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  totalEstimate: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("onset_rental_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // LocalStorage fallback
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("onset_rental_cart", JSON.stringify(cart));
    } catch {
      // LocalStorage fallback
    }
  }, [cart]);

  const addToCart = (item: GearItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, days: 1, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateDays = (id: string, days: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, days: Math.max(1, days) } : i))
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalEstimate = cart.reduce(
    (sum, item) => sum + item.dailyRate * item.days * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateDays,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalEstimate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
