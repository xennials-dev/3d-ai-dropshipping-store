import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Lock,
  Globe2,
} from "lucide-react";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import AIAssistant from "@/components/AIAssistant";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vendora — The AI-Powered Dropshipping Store",
  description:
    "Shop 2,400+ supplier-direct products with zero inventory risk. Vendora is the dropshipping flagship: AI-curated catalog, 2–15 day delivery, 30-day returns, and a merchant dashboard that forwards every order to the supplier automatically.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Vendora — Every product. Zero inventory.",
    description:
      "The $167B dropshipping model, productized. Cinematic catalog, AI shopping assistant, supplier-direct fulfillment.",
    type: "website",
  },
};

const footerCols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Store",
    links: [
      { label: "Shop all products", href: "/shop" },
      { label: "New arrivals", href: "/shop?sort=new" },
      { label: "Best sellers", href: "/shop?sort=rating" },
      { label: "Fast-ship (US)", href: "/shop?tag=fast" },
      { label: "Track my order", href: "/track" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "What is dropshipping?", href: "/#dropshipping" },
      { label: "How it works", href: "/#how" },
      { label: "Supplier network", href: "/#suppliers" },
      { label: "Margin playbook", href: "/#margins" },
      { label: "2027 trends", href: "/#trends" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Merchant dashboard", href: "/admin" },
      { label: "Seller of record", href: "/#seller-of-record" },
      { label: "Supplier standards", href: "/#suppliers" },
      { label: "FAQ", href: "/#faq" },
      { label: "Start free", href: "/#start" },
    ],
  },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08090b] text-[#f4efe6]">
      {/* trust strip */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-6 text-[11px] text-[#9a978c] md:grid-cols-4 md:text-xs">
        <div className="flex items-center gap-2"><Truck size={16} className="text-[#e4b45c]" /> Supplier-direct 2–15 day delivery</div>
        <div className="flex items-center gap-2"><RotateCcw size={16} className="text-[#e4b45c]" /> 30-day hassle-free returns</div>
        <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#e4b45c]" /> Buyer protection on every order</div>
        <div className="flex items-center gap-2"><Lock size={16} className="text-[#e4b45c]" /> Encrypted checkout · no card data stored</div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden>
                <path d="M32 4 58 20v24L32 60 6 44V20L32 4z" fill="none" stroke="#e4b45c" strokeWidth="5" strokeLinejoin="round" />
                <path d="M21 24l11 17 11-17" fill="none" stroke="#f6d68a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-display text-2xl font-black tracking-tight">VENDORA</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9a978c]">
              The dropshipping flagship for a $167B industry. Real products,
              vetted suppliers, AI everywhere — you never touch a warehouse.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#9a978c]">
              <Globe2 size={14} className="text-[#e4b45c]" /> Shipping to 180+ countries
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#c9c5b8]">
              {["Visa", "Mastercard", "Amex", "PayPal", "Shop Pay", "Apple Pay"].map((p) => (
                <span key={p} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e4b45c]">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-[#c9c5b8] transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e4b45c]">
              Checkout
            </h4>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#c9c5b8]">
              <CreditCard size={16} className="text-[#e4b45c]" /> Secure 256-bit SSL
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#9a978c]">
              Vendora is the seller of record. Payments are captured by Vendora
              Payments; your data never touches a supplier.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 text-[11px] text-[#75726a] md:flex-row">
            <p>© {new Date().getFullYear()} Vendora Inc. Seller of record on every order.</p>
            <div className="flex items-center gap-5">
              <Link href="/#faq" className="hover:text-[#f4efe6]">Privacy</Link>
              <Link href="/#faq" className="hover:text-[#f4efe6]">Terms</Link>
              <Link href="/#seller-of-record" className="hover:text-[#f4efe6]">Seller of record</Link>
              <Link href="/admin" className="hover:text-[#f4efe6]">Merchant login</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-[#0b0c0e] font-sans text-[#f4efe6]">
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <AIAssistant />
        </CartProvider>
      </body>
    </html>
  );
}
