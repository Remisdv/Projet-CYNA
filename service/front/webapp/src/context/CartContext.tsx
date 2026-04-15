import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CartPeriodicity = 'mensuel' | 'annuel';

export interface CartItem {
  id: string;
  nom: string;
  type: 'produit' | 'service';
  prix?: number;
  prix_mensuel?: number;
  prix_annuel?: number;
  periodicity?: CartPeriodicity;
  quantity: number;
  image?: string;
  slug?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, periodicity?: CartPeriodicity) => void;
  updateQuantity: (id: string, quantity: number, periodicity?: CartPeriodicity) => void;
  updatePeriodicity: (id: string, periodicity: CartPeriodicity) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'cyna_cart';

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function getItemKey(id: string, periodicity?: CartPeriodicity) {
  return periodicity ? `${id}__${periodicity}` : id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const total = items.reduce((sum, item) => {
    let unitPrice: number | undefined = item.prix;
    if (item.type === 'service') {
      if (item.periodicity === 'annuel' && item.prix_annuel != null) {
        unitPrice = item.prix_annuel;
      } else if (item.prix_mensuel != null) {
        unitPrice = item.prix_mensuel;
      }
    }
    return sum + (unitPrice ?? 0) * item.quantity;
  }, 0);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const key = getItemKey(newItem.id, newItem.periodicity);
      const existing = prev.find(
        (i) => getItemKey(i.id, i.periodicity) === key
      );
      if (existing) {
        return prev.map((i) =>
          getItemKey(i.id, i.periodicity) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string, periodicity?: CartPeriodicity) => {
    const key = getItemKey(id, periodicity);
    setItems((prev) => prev.filter((i) => getItemKey(i.id, i.periodicity) !== key));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number, periodicity?: CartPeriodicity) => {
      const key = getItemKey(id, periodicity);
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => getItemKey(i.id, i.periodicity) !== key));
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          getItemKey(i.id, i.periodicity) === key ? { ...i, quantity } : i
        )
      );
    },
    []
  );

  const updatePeriodicity = useCallback((id: string, periodicity: CartPeriodicity) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.type === 'service' ? { ...i, periodicity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQuantity, updatePeriodicity, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
