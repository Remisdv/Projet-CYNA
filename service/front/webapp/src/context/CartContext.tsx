import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { trackEvent } from '../services/tracking';
import {
  useServerCart,
  useAddToServerCart,
  useUpdateServerCartItem,
  useRemoveServerCartItem,
  useClearServerCart,
  useMergeCart,
} from '../features/cart/hooks/useServerCart';

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
  /** Server-side cart item ID (only when authenticated) */
  serverItemId?: string;
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [localItems, setLocalItems] = useState<CartItem[]>(loadFromStorage);
  const mergedRef = useRef(false);

  // Server cart hooks
  const { data: serverItems } = useServerCart(isAuthenticated);
  const addToServer = useAddToServerCart();
  const updateServer = useUpdateServerCartItem();
  const removeFromServer = useRemoveServerCartItem();
  const clearServer = useClearServerCart();
  const mergeServer = useMergeCart();

  // Persist localStorage on every local change (only when not authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(CART_KEY, JSON.stringify(localItems));
    }
  }, [localItems, isAuthenticated]);

  // Merge localStorage → server on login
  useEffect(() => {
    if (!isAuthenticated || authLoading || mergedRef.current) return;
    if (localItems.length === 0) {
      mergedRef.current = true;
      return;
    }

    const serverPayload = localItems.map((i) => ({
      productId: i.id,
      productName: i.nom,
      productType: i.type,
      quantity: i.quantity,
      prix: i.prix,
      prixMensuel: i.prix_mensuel,
      prixAnnuel: i.prix_annuel,
      periodicity: i.periodicity ?? '',
      image: i.image,
    }));

    mergeServer.mutate(serverPayload, {
      onSuccess: () => {
        setLocalItems([]);
        localStorage.removeItem(CART_KEY);
        mergedRef.current = true;
      },
    });
  }, [isAuthenticated, authLoading]);

  // Reset merge flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      mergedRef.current = false;
    }
  }, [isAuthenticated]);

  // Build the displayed items: server items when auth, local when not
  const items: CartItem[] = isAuthenticated
    ? (serverItems ?? []).map((si) => ({
      id: si.productId,
      nom: si.productName,
      type: si.productType as 'produit' | 'service',
      prix: si.prix ? Number(si.prix) : undefined,
      prix_mensuel: si.prixMensuel ? Number(si.prixMensuel) : undefined,
      prix_annuel: si.prixAnnuel ? Number(si.prixAnnuel) : undefined,
      periodicity: (si.periodicity as CartPeriodicity) || undefined,
      quantity: si.quantity,
      image: si.image,
      serverItemId: si.id,
    }))
    : localItems;

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

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'>) => {
      trackEvent('CART_ADD', undefined, { productId: newItem.id, productName: newItem.nom });
      if (isAuthenticated) {
        const payload: Record<string, unknown> = {
          productId: newItem.id,
          productName: newItem.nom,
          productType: newItem.type,
          quantity: 1,
          periodicity: newItem.periodicity ?? '',
          image: newItem.image,
        };
        if (newItem.prix != null) payload.prix = Number(newItem.prix);
        if (newItem.prix_mensuel != null) payload.prixMensuel = Number(newItem.prix_mensuel);
        if (newItem.prix_annuel != null) payload.prixAnnuel = Number(newItem.prix_annuel);
        addToServer.mutate(payload as any);
      } else {
        setLocalItems((prev) => {
          const key = getItemKey(newItem.id, newItem.periodicity);
          const existing = prev.find((i) => getItemKey(i.id, i.periodicity) === key);
          if (existing) {
            return prev.map((i) =>
              getItemKey(i.id, i.periodicity) === key ? { ...i, quantity: i.quantity + 1 } : i,
            );
          }
          return [...prev, { ...newItem, quantity: 1 }];
        });
      }
    },
    [isAuthenticated, addToServer],
  );

  const removeItem = useCallback(
    (id: string, periodicity?: CartPeriodicity) => {
      if (isAuthenticated) {
        const item = items.find(
          (i) => i.id === id && (periodicity ? i.periodicity === periodicity : true),
        );
        if (item?.serverItemId) removeFromServer.mutate(item.serverItemId);
      } else {
        const key = getItemKey(id, periodicity);
        setLocalItems((prev) => prev.filter((i) => getItemKey(i.id, i.periodicity) !== key));
      }
    },
    [isAuthenticated, items, removeFromServer],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number, periodicity?: CartPeriodicity) => {
      if (isAuthenticated) {
        const item = items.find(
          (i) => i.id === id && (periodicity ? i.periodicity === periodicity : true),
        );
        if (item?.serverItemId) {
          if (quantity <= 0) {
            removeFromServer.mutate(item.serverItemId);
          } else {
            updateServer.mutate({ id: item.serverItemId, quantity });
          }
        }
      } else {
        const key = getItemKey(id, periodicity);
        if (quantity <= 0) {
          setLocalItems((prev) => prev.filter((i) => getItemKey(i.id, i.periodicity) !== key));
          return;
        }
        setLocalItems((prev) =>
          prev.map((i) => (getItemKey(i.id, i.periodicity) === key ? { ...i, quantity } : i)),
        );
      }
    },
    [isAuthenticated, items, updateServer, removeFromServer],
  );

  const updatePeriodicity = useCallback(
    (id: string, periodicity: CartPeriodicity) => {
      if (!isAuthenticated) {
        setLocalItems((prev) =>
          prev.map((i) => (i.id === id && i.type === 'service' ? { ...i, periodicity } : i)),
        );
      }
      // For server cart, periodicity change requires remove + re-add (different key)
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      clearServer.mutate();
    } else {
      setLocalItems([]);
    }
  }, [isAuthenticated, clearServer]);

  const isInCart = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        updatePeriodicity,
        clearCart,
        isInCart,
      }}
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
