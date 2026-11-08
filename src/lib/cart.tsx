"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  supplier: string;
  quantity: number;
};

import { PROMO_CODES, FREE_SHIPPING_AT } from "./promos";

export { PROMO_CODES, FREE_SHIPPING_AT };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  promo: { code: string; label: string; rate: number } | null;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem("vendora-cart-v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.items)) setItems(parsed.items);
          if (parsed.promoCode) setPromoCode(parsed.promoCode);
        }
      } catch {
        /* corrupted storage — start fresh */
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("vendora-cart-v1", JSON.stringify({ items, promoCode }));
  }, [items, promoCode, hydrated]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, qty) } : i))
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setPromoCode(null);
  }, []);

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = PROMO_CODES[normalized];
    if (!found) return { ok: false, message: `“${normalized}” isn’t a valid code.` };
    setPromoCode(normalized);
    return { ok: true, message: found.label };
  }, []);

  const removePromo = useCallback(() => setPromoCode(null), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const promo = promoCode
      ? { code: promoCode, ...PROMO_CODES[promoCode] }
      : null;
    const discount = promo ? (subtotal * promo.rate) : 0;
    const total = Math.max(0, subtotal - discount);
    return {
      items,
      count,
      subtotal,
      discount,
      promo,
      total,
      isOpen,
      openCart,
      closeCart,
      add,
      remove,
      setQty,
      clear,
      applyPromo,
      removePromo,
    };
  }, [items, promoCode, isOpen, openCart, closeCart, add, remove, setQty, clear, applyPromo, removePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
