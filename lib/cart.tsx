"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartLine, LastOrder, FulfillMode, MenuItem } from "@/lib/types";

const LAST_KEY = "lineasur.lastorder.v1";

interface CartShape {
  cart: CartLine[];
  lastOrder: LastOrder | null;
  addToCart: (item: MenuItem, qty: number, notes: string, mods?: CartLine["mods"]) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  saveLastOrder: (mode: FulfillMode) => void;
  repeatLastOrder: (menu: MenuItem[]) => void;
  resetCart: () => void;
}

const CartContext = createContext<CartShape | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const lo = localStorage.getItem(LAST_KEY);
      if (lo) setLastOrder(JSON.parse(lo) as LastOrder);
    } catch { /* ignore */ }
  }, []);

  const addToCart = useCallback((item: MenuItem, qty: number, notes: string, mods?: CartLine["mods"]) => {
    setCart((prev) => {
      const modsKey = JSON.stringify(mods ?? []);
      const existing = prev.find(
        (l) => l.item.id === item.id && l.notes === notes && JSON.stringify(l.mods ?? []) === modsKey
      );
      if (existing) return prev.map((l) => (l === existing ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { item, qty, notes, mods }];
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setCart((prev) => prev.map((l) => (l.item.id === id ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((l) => l.item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const saveLastOrder = useCallback((mode: FulfillMode) => {
    setCart((prev) => {
      const snap: LastOrder = {
        mode,
        at: Date.now(),
        lines: prev.map((l) => ({ id: l.item.id, qty: l.qty, notes: l.notes })),
      };
      try { localStorage.setItem(LAST_KEY, JSON.stringify(snap)); } catch { /* quota */ }
      setLastOrder(snap);
      return prev;
    });
  }, []);

  const repeatLastOrder = useCallback((menu: MenuItem[]) => {
    if (!lastOrder) return;
    const rebuilt: CartLine[] = [];
    for (const l of lastOrder.lines) {
      const item = menu.find((m) => m.id === l.id && m.available);
      if (item) rebuilt.push({ item, qty: l.qty, notes: l.notes });
    }
    setCart(rebuilt);
  }, [lastOrder]);

  const resetCart = useCallback(() => {
    try { localStorage.removeItem(LAST_KEY); } catch { /* ignore */ }
    setCart([]);
    setLastOrder(null);
  }, []);

  return (
    <CartContext.Provider value={{
      cart, lastOrder,
      addToCart, updateQty, removeFromCart, clearCart,
      saveLastOrder, repeatLastOrder, resetCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartShape {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
