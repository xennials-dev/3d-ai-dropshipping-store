"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Trash2,
  Minus,
  Plus,
  Tag,
  Truck,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useCart, FREE_SHIPPING_AT } from "@/lib/cart";

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    subtotal,
    discount,
    total,
    count,
    promo,
    applyPromo,
    removePromo,
    setQty,
    remove,
  } = useCart();

  const [code, setCode] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  const shipProgress = Math.min(1, subtotal / FREE_SHIPPING_AT);
  const away = Math.max(0, FREE_SHIPPING_AT - subtotal);

  const submitPromo = () => {
    if (!code.trim()) return;
    const result = applyPromo(code);
    setPromoMsg(result);
    if (result.ok) setCode("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "104%" }}
            animate={{ x: 0 }}
            exit={{ x: "104%" }}
            transition={{ type: "spring", damping: 32, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#121318] shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4b45c]/15 text-[#e4b45c]">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-black leading-none">Your cart</h2>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-[#9a978c]">
                    {count} item{count === 1 ? "" : "s"} · supplier-direct
                  </p>
                </div>
              </div>
              <button onClick={closeCart} className="rounded-xl p-2 text-[#9a978c] transition hover:bg-white/5 hover:text-white" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* free shipping progress */}
            <div className="border-b border-white/10 px-6 py-3">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-[#c9c5b8]">
                  <Truck size={13} className="text-[#e4b45c]" />
                  {away > 0 ? (
                    <>You’re <b className="text-[#f6d68a]">${away.toFixed(2)}</b> from free delivery</>
                  ) : (
                    <span className="text-[#7ee2a8]">Free delivery unlocked</span>
                  )}
                </span>
                <span className="tabular-nums text-[#9a978c]">${FREE_SHIPPING_AT}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f6d68a] to-[#e4b45c] transition-[width] duration-500"
                  style={{ width: `${shipProgress * 100}%` }}
                />
              </div>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#e4b45c]">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">Empty for now</p>
                    <p className="mt-1 max-w-[240px] text-sm text-[#9a978c]">
                      Browse the catalog — every product ships straight from a vetted supplier.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="rounded-xl bg-[#e4b45c] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#0b0c0e] transition hover:bg-[#f6d68a]"
                  >
                    Browse catalog
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-[#0b0c0e] p-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#1a1b21]">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#f4efe6]">{item.name}</p>
                            <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-[#9a978c]">
                              {item.supplier}
                            </p>
                          </div>
                          <button onClick={() => remove(item.id)} className="rounded-lg p-1.5 text-[#75726a] transition hover:bg-white/5 hover:text-[#f0715c]" aria-label="Remove">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-white/10">
                            <button onClick={() => setQty(item.id, item.quantity - 1)} className="p-1.5 text-[#c9c5b8] hover:text-white" aria-label="Decrease">
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                            <button onClick={() => setQty(item.id, item.quantity + 1)} className="p-1.5 text-[#c9c5b8] hover:text-white" aria-label="Increase">
                              <Plus size={13} />
                            </button>
                          </div>
                          <p className="text-sm font-black tabular-nums text-[#f6d68a]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* promo + summary */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 py-4">
                {promo ? (
                  <div className="flex items-center justify-between rounded-xl border border-[#7ee2a8]/25 bg-[#7ee2a8]/10 px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-[#7ee2a8]">
                      <Check size={14} /> {promo.code} — {promo.label}
                    </span>
                    <button onClick={() => { removePromo(); setPromoMsg(null); }} className="text-[#9a978c] hover:text-white" aria-label="Remove promo">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0b0c0e] px-3">
                        <Tag size={14} className="text-[#9a978c]" />
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && submitPromo()}
                          placeholder="Promo code — try LAUNCH20"
                          className="w-full bg-transparent py-2.5 text-xs font-semibold uppercase tracking-wider outline-none placeholder:normal-case placeholder:text-[#5a5850]"
                        />
                      </div>
                      <button onClick={submitPromo} className="rounded-xl border border-[#e4b45c]/40 bg-[#e4b45c]/10 px-4 text-xs font-bold text-[#f6d68a] transition hover:bg-[#e4b45c]/20">
                        Apply
                      </button>
                    </div>
                    {promoMsg && !promoMsg.ok && (
                      <p className="mt-1.5 text-[11px] text-[#f0715c]">{promoMsg.message}</p>
                    )}
                  </div>
                )}

                <dl className="mt-3 space-y-1.5 text-xs text-[#c9c5b8]">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">${subtotal.toFixed(2)}</dd></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#7ee2a8]"><dt>Discount ({promo?.code})</dt><dd className="tabular-nums">−${discount.toFixed(2)}</dd></div>
                  )}
                  <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{subtotal >= FREE_SHIPPING_AT ? "Free" : "Calculated at checkout"}</dd></div>
                </dl>
                <div className="mt-2 flex items-end justify-between border-t border-white/10 pt-2">
                  <span className="text-sm font-bold text-[#f4efe6]">Total</span>
                  <span className="font-display text-2xl font-black tabular-nums text-[#f6d68a]">${total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4b45c] py-4 text-sm font-black uppercase tracking-[0.18em] text-[#0b0c0e] transition hover:bg-[#f6d68a]"
                >
                  Checkout <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-[#75726a]">
                  <ShieldCheck size={12} className="text-[#7ee2a8]" /> Vendora is seller of record · buyer protection on every order
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
