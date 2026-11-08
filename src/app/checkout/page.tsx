"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Truck,
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  ShoppingBag,
  BadgePercent,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Globe2,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { FREE_SHIPPING_AT, STANDARD_SHIPPING_FEE, EXPRESS_SHIPPING_FEE } from "@/lib/promos";

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, promo, total, count, clear, openCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">("standard");
  const [paymentMode, setPaymentMode] = useState<"stripe" | "simulated">("stripe");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/29");
  const [cvc, setCvc] = useState("424");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = deliverySpeed === "express" ? EXPRESS_SHIPPING_FEE : subtotal >= FREE_SHIPPING_AT ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = Math.max(0, total + shippingFee);

  const itemPayload = useMemo(() => items.map((i) => ({ id: i.id, qty: i.quantity })), [items]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          address,
          deliverySpeed,
          promoCode: promo?.code ?? null,
          paymentMethod: paymentMode,
          items: itemPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Checkout failed — your card was not charged.");
        setBusy(false);
        return;
      }
      clear();
      if (data.isStripe && data.url) {
        window.location.href = data.url;
        return;
      }
      router.push(`/order-success?n=${encodeURIComponent(data.orderNumber)}&total=${data.total.toFixed(2)}&eta=${encodeURIComponent(data.eta ?? "3–7 business days")}`);
    } catch {
      setError("Network error — your card was not charged. Try again.");
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#0b0c0e] px-6 text-center">
        <ShoppingBag size={40} className="text-[#3d3e46]" />
        <h1 className="font-display text-3xl font-black">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-[#9a978c]">Fill it with something the suppliers ship beautifully — LAUNCH20 takes 20% off today.</p>
        <Link href="/shop" className="mt-2 flex items-center gap-2 rounded-2xl bg-[#e4b45c] px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-[#0b0c0e] transition hover:bg-[#f6d68a]">
          Browse the catalog <ArrowRight size={16} strokeWidth={2.6} />
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-[#0b0c0e] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#5a5850] focus:border-[#e4b45c]/55";

  return (
    <div className="bg-[#0b0c0e] text-[#f4efe6]">
      {/* secure strip */}
      <div className="border-b border-[#7ee2a8]/15 bg-[#7ee2a8]/5 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#7ee2a8]">
        <Lock size={11} className="mr-1.5 inline" /> 256-bit encrypted · Vendora is seller of record · buyer protection included
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5 lg:py-14">
        {/* ============ FORM ============ */}
        <div className="lg:col-span-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e4b45c]">Checkout · {count} item{count === 1 ? "" : "s"}</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">Almost<br /><span className="gold-text">yours.</span></h1>

          {/* contact */}
          <section className="mt-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9a978c]">01 · Contact</h2>
            <div className="mt-3 grid gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} aria-label="Full name" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                    fetch("/api/cart/abandon", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email,
                        name,
                        items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
                      }),
                    }).catch(() => {});
                  }
                }}
                type="email"
                placeholder="Email — for tracking & receipt"
                className={inputCls}
                aria-label="Email address"
              />
            </div>
          </section>

          {/* delivery */}
          <section className="mt-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9a978c]">02 · Where it ships</h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, apartment, city, state, ZIP — full delivery address"
              rows={2}
              className={`${inputCls} mt-3 resize-none`}
              aria-label="Delivery address"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {([
                { id: "standard", icon: Truck, title: "Standard", sub: subtotal >= FREE_SHIPPING_AT ? "Free" : `$${STANDARD_SHIPPING_FEE.toFixed(2)}`, eta: "3–7 business days" },
                { id: "express", icon: Zap, title: "Express", sub: `+$${EXPRESS_SHIPPING_FEE.toFixed(2)}`, eta: "2–4 business days" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDeliverySpeed(opt.id)}
                  aria-pressed={deliverySpeed === opt.id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    deliverySpeed === opt.id
                      ? "border-[#e4b45c]/60 bg-[#e4b45c]/10"
                      : "border-white/10 bg-[#121318] hover:border-white/20"
                  }`}
                >
                  <opt.icon size={20} className={deliverySpeed === opt.id ? "text-[#f6d68a]" : "text-[#75726a]"} />
                  <span>
                    <span className="block text-sm font-bold">{opt.title} · <span className="text-[#f6d68a]">{opt.sub}</span></span>
                    <span className="mt-0.5 block text-[11px] text-[#9a978c]">{opt.eta} · supplier ships under your slip</span>
                  </span>
                  <span className={`ml-auto mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${deliverySpeed === opt.id ? "border-[#e4b45c] bg-[#e4b45c]" : "border-white/20"}`}>
                    {deliverySpeed === opt.id && <CheckCircle2 size={13} className="text-[#0b0c0e]" strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* payment */}
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9a978c]">03 · Payment Method</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#9a978c]">
                {paymentMode === "stripe" ? "Stripe Checkout" : "Demo Mode"}
              </span>
            </div>

            {/* Gateway Toggle */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMode("stripe")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  paymentMode === "stripe"
                    ? "border-[#e4b45c]/60 bg-[#e4b45c]/10"
                    : "border-white/10 bg-[#121318] hover:border-white/20"
                }`}
              >
                <Globe2 size={20} className={paymentMode === "stripe" ? "text-[#f6d68a]" : "text-[#75726a]"} />
                <div>
                  <p className="text-sm font-bold">Stripe Checkout</p>
                  <p className="text-[11px] text-[#9a978c]">Cards, Apple Pay, Google Pay</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("simulated")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  paymentMode === "simulated"
                    ? "border-[#e4b45c]/60 bg-[#e4b45c]/10"
                    : "border-white/10 bg-[#121318] hover:border-white/20"
                }`}
              >
                <CreditCard size={20} className={paymentMode === "simulated" ? "text-[#f6d68a]" : "text-[#75726a]"} />
                <div>
                  <p className="text-sm font-bold">Instant Demo Card</p>
                  <p className="text-[11px] text-[#9a978c]">Instant test authorization</p>
                </div>
              </button>
            </div>

            {paymentMode === "simulated" ? (
              <div className="mt-3 grid gap-3">
                <div className="relative">
                  <CreditCard size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75726a]" />
                  <input value={card} onChange={(e) => setCard(formatCard(e.target.value))} inputMode="numeric" className={`${inputCls} pl-11 font-mono tracking-widest`} aria-label="Card number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" className={`${inputCls} font-mono`} aria-label="Expiry" />
                  <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC" inputMode="numeric" className={`${inputCls} font-mono`} aria-label="CVC" />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-white/10 bg-[#121318] p-4 text-xs text-[#b8b5a9]">
                <p className="flex items-center gap-2 font-bold text-[#f4efe6]">
                  <Lock size={13} className="text-[#7ee2a8]" /> Redirects to Stripe Secure Checkout
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#9a978c]">
                  You will complete payment securely on Stripe. Supports Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, and Link.
                </p>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#5a5850]">
              <ShieldCheck size={12} className="text-[#7ee2a8]" /> Tokenized by {paymentMode === "stripe" ? "Stripe" : "Vendora Payments"} · PCI-DSS Level 1 certified
            </div>
          </section>

          {error && (
            <p className="mt-4 rounded-xl border border-[#f0715c]/40 bg-[#f0715c]/10 px-4 py-3 text-sm text-[#ff9d8a]">{error}</p>
          )}
        </div>

        {/* ============ SUMMARY ============ */}
        <aside className="lg:col-span-2">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-[#121318]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9a978c]">Order summary</p>
              <button onClick={openCart} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e4b45c] hover:text-[#f6d68a]">Edit cart</button>
            </div>
            <ul className="max-h-64 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#1a1b21]">
                    <Image src={item.image} alt={item.name} fill unoptimized sizes="56px" className="object-cover" />
                    <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-[#e4b45c] text-[9px] font-black text-[#0b0c0e]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold">{item.name}</p>
                    <p className="text-[9px] uppercase tracking-wider text-[#75726a]">{item.supplier}</p>
                  </div>
                  <p className="text-[12px] font-black tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 px-6 py-4 text-[13px]">
              <div className="flex justify-between text-[#c9c5b8]"><span>Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="mt-1.5 flex justify-between text-[#7ee2a8]"><span className="flex items-center gap-1.5"><BadgePercent size={13} /> {promo?.code}</span><span className="tabular-nums">−${discount.toFixed(2)}</span></div>
              )}
              <div className="mt-1.5 flex justify-between text-[#c9c5b8]"><span>Shipping ({deliverySpeed})</span><span className="tabular-nums">{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span></div>
              <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                <span className="font-bold">Total</span>
                <span className="font-display text-3xl font-black tabular-nums text-[#f6d68a]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={submit}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4b45c] py-4.5 text-sm font-black uppercase tracking-[0.18em] text-[#0b0c0e] transition enabled:hover:bg-[#f6d68a] enabled:hover:shadow-[0_20px_50px_-16px_rgba(228,180,92,0.6)] disabled:opacity-60"
              >
                {busy ? (
                  <><Loader2 size={19} className="animate-spin" /> {paymentMode === "stripe" ? "Connecting to Stripe…" : "Placing order…"}</>
                ) : (
                  <>{paymentMode === "stripe" ? "Pay with Stripe" : "Place Demo Order"} · ${grandTotal.toFixed(2)} <ArrowRight size={18} strokeWidth={2.6} /></>
                )}
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5a5850]">
                <Sparkles size={11} className="text-[#e4b45c]" /> AI routes your order to the best supplier in ~2.3s
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
