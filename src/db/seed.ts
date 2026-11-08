import { db } from "./index";
import { products, orders, orderItems, subscribers } from "./schema";

// Deterministic PRNG so every sandbox seeds the same demo data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260101);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);

const IMG = {
  headphones:
    "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  watch:
    "https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  lamp: "https://images.pexels.com/photos/31410610/pexels-photo-31410610.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  vase: "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  serum:
    "https://images.pexels.com/photos/39392892/pexels-photo-39392892.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  drops:
    "https://images.pexels.com/photos/39281912/pexels-photo-39281912.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  candle:
    "https://images.pexels.com/photos/9277080/pexels-photo-9277080.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  giftset:
    "https://images.pexels.com/photos/33180700/pexels-photo-33180700.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
};

const catalog = [
  { slug: "aurora-x9-wireless-headphones", name: "Aurora X9 Wireless Headphones", tagline: "40-hour ANC over-ears with spatial audio", description: "Flagship-grade active noise cancellation, 40-hour battery life and studio-tuned 40mm drivers — shipped direct from our Shenzhen partner with branded invoicing.", price: 89.99, compareAtPrice: 129.99, category: "Electronics", image: IMG.headphones, supplier: "Shenzhen AudioTech Co.", supplierCountry: "China", supplierRating: 4.8, shippingMin: 7, shippingMax: 15, rating: 4.8, reviewCount: 2314, margin: 0.52, cost: 43.2, stock: 840, featured: true, badge: "Best Seller" },
  { slug: "pulsefit-pro-smartwatch", name: "PulseFit Pro Smart Watch", tagline: "ECG, HRV & dual-band GPS, 14-day battery", description: "Medical-grade optical sensors track ECG, HRV, SpO2 and sleep staging. Ships 2–4 days from our verified US warehouse partner.", price: 69.99, compareAtPrice: 99.99, category: "Electronics", image: IMG.watch, supplier: "NovaTech Wholesale (US)", supplierCountry: "United States", supplierRating: 4.9, shippingMin: 2, shippingMax: 4, rating: 4.6, reviewCount: 1847, margin: 0.44, cost: 39.2, stock: 620, featured: true, badge: "Fast Ship" },
  { slug: "voltcore-20k-power-bank", name: "VoltCore 20K Fast Power Bank", tagline: "65W GaN charging, charges a MacBook once", description: "Airline-safe 20,000mAh cell with dual USB-C PD 65W output and an LED charge display. From our certified EU electronics supplier.", price: 45.99, compareAtPrice: 64.99, category: "Electronics", image: "/products/voltcore.jpg", supplier: "VoltCore Distribution (EU)", supplierCountry: "Germany", supplierRating: 4.7, shippingMin: 3, shippingMax: 6, rating: 4.7, reviewCount: 1204, margin: 0.48, cost: 23.9, stock: 530, featured: true, badge: "New" },
  { slug: "lumeoak-solar-desk-lamp", name: "LumeOak Walnut Desk Lamp", tagline: "Hand-finished solid oak, wireless charging base", description: "Solid walnut body, 3 color temperatures, memory dimming and a hidden 15W wireless charging pad carved into the base.", price: 34.99, compareAtPrice: 54.99, category: "Home", image: IMG.lamp, supplier: "Habitat Artisan Supply", supplierCountry: "Vietnam", supplierRating: 4.6, shippingMin: 6, shippingMax: 12, rating: 4.7, reviewCount: 986, margin: 0.5, cost: 17.5, stock: 380, featured: false, badge: null },
  { slug: "terra-vessel-ceramic-vase", name: "Terra Vessel Ceramic Vase", tagline: "Sculptural matte ceramic, made in small batches", description: "Hand-thrown matte-black stoneware with an organic silhouette. Each piece is kiln-fired in small batches by our partner studio.", price: 46.99, compareAtPrice: 68.0, category: "Home", image: IMG.vase, supplier: "Terra Studio Collective", supplierCountry: "Portugal", supplierRating: 4.9, shippingMin: 3, shippingMax: 7, rating: 4.9, reviewCount: 643, margin: 0.46, cost: 25.4, stock: 210, featured: false, badge: "Small Batch" },
  { slug: "nimbusweight-anxiety-blanket", name: "NimbusWeighted Blanket 6kg", tagline: "Deep-pressure comfort, OEKO-TEX certified", description: "Glass-bead micro-quilting distributes 6kg evenly across the body. Breathable bamboo duvet cover included. Ships from the US.", price: 79.99, compareAtPrice: 119.99, category: "Home", image: "/products/nimbus-blanket.jpg", supplier: "CloudRest Home (US)", supplierCountry: "United States", supplierRating: 4.8, shippingMin: 2, shippingMax: 5, rating: 4.8, reviewCount: 1203, margin: 0.41, cost: 47.2, stock: 450, featured: true, badge: "Fast Ship" },
  { slug: "sauvage-bloom-candle-no9", name: "Sauvage Bloom No. 9 Candle", tagline: "Fig, neroli & smoked cedar — 55h burn", description: "A coconut-soy wax signature candle layered with fig, neroli and smoked cedar. Hand-poured, phthalate-free, 55-hour burn time.", price: 32.99, compareAtPrice: 44.0, category: "Home", image: IMG.candle, supplier: "Maison Lumière (FR)", supplierCountry: "France", supplierRating: 4.7, shippingMin: 3, shippingMax: 6, rating: 4.5, reviewCount: 754, margin: 0.58, cost: 13.9, stock: 520, featured: false, badge: null },
  { slug: "glowroot-vitamin-c-serum", name: "GlowRoot 15% Vitamin C Serum", tagline: "Stabilized L-ascorbic + ferulic acid", description: "15% stabilized L-ascorbic acid with ferulic acid and vitamin E. Visibly fades dark spots in 4 weeks. Cruelty-free, EU-manufactured.", price: 28.99, compareAtPrice: 42.0, category: "Beauty", image: IMG.serum, supplier: "PureDerma Labs (EU)", supplierCountry: "Spain", supplierRating: 4.8, shippingMin: 3, shippingMax: 7, rating: 4.7, reviewCount: 3120, margin: 0.61, cost: 11.3, stock: 910, featured: true, badge: "Best Seller" },
  { slug: "droplet-niacinamide-serum-set", name: "Droplet Niacinamide 10% Trio", tagline: "Pore-refining trio, 3 × 30ml", description: "A three-bottle niacinamide protocol — 10% active, zinc PCA and ceramides. Targets pores, uneven tone and excess shine.", price: 38.99, compareAtPrice: 54.0, category: "Beauty", image: IMG.drops, supplier: "PureDerma Labs (EU)", supplierCountry: "Spain", supplierRating: 4.8, shippingMin: 3, shippingMax: 7, rating: 4.6, reviewCount: 1530, margin: 0.59, cost: 16.0, stock: 640, featured: false, badge: null },
  { slug: "hydrasteel-insulated-bottle", name: "HydraSteel Insulated Bottle 1L", tagline: "24h cold / 12h hot, sweat-proof", description: "Triple-wall vacuum insulation, 18/8 stainless steel, powder-coated grip and a leakproof flex cap. BPA-free, dishwasher safe.", price: 24.99, compareAtPrice: 36.0, category: "Fitness", image: "/products/hydrasteel.jpg", supplier: "EverPeak Outdoor Supply", supplierCountry: "China", supplierRating: 4.7, shippingMin: 7, shippingMax: 14, rating: 4.8, reviewCount: 2760, margin: 0.55, cost: 11.2, stock: 1200, featured: false, badge: null },
  { slug: "pawhaven-reflective-collar", name: "PawHaven Reflective Dog Collar", tagline: "Night-visible weave + brass name tag", description: "Military-grade reflective weave, solid brass buckle and a personalized engraved tag. Sized S–XL, machine washable.", price: 16.99, compareAtPrice: 26.0, category: "Pets", image: "/products/pawhaven.jpg", supplier: "PawHaven Goods (US)", supplierCountry: "United States", supplierRating: 5.0, shippingMin: 2, shippingMax: 4, rating: 4.9, reviewCount: 1980, margin: 0.62, cost: 6.5, stock: 1500, featured: true, badge: "Fast Ship" },
  { slug: "floral-bloom-gift-candle-set", name: "Blossom Floral Candle Gift Set", tagline: "Three hand-poured florals, gift-boxed", description: "Peony, jasmine and white tea — three tealights in a hand-illustrated gift box. The highest-converting gifting SKU in our catalog.", price: 29.99, compareAtPrice: 39.0, category: "Home", image: IMG.giftset, supplier: "Maison Lumière (FR)", supplierCountry: "France", supplierRating: 4.7, shippingMin: 3, shippingMax: 6, rating: 4.4, reviewCount: 520, margin: 0.57, cost: 12.9, stock: 700, featured: false, badge: null },
];

const firstNames = ["Ava","Liam","Maya","Noah","Sofia","Ethan","Isla","Lucas","Amara","Mason","Priya","Elijah","Zara","Owen","Nora","Caleb","Freya","Julian","Elena","Marcus"];
const lastNames = ["Carter","Nguyen","Brooks","Patel","Garcia","Kim","Mueller","Santos","Novak","Reyes","Bennett","Larsen","Moreau","Silva","Kowalski"];
const cities = ["Austin, TX","Denver, CO","Seattle, WA","Miami, FL","Chicago, IL","Portland, OR","Nashville, TN","Brooklyn, NY","Phoenix, AZ","San Diego, CA"];

async function main() {
  console.log("Seeding Vendora catalog…");
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(subscribers);
  await db.delete(products);

  const inserted = await db.insert(products).values(catalog).returning();
  console.log(`  ✓ ${inserted.length} products`);

  const now = Date.now();
  let n = 2400;
  let orderCount = 0;
  for (let d = 21; d >= 0; d--) {
    const ordersToday = d === 0 ? 2 : Math.floor(between(1, 4.4));
    for (let i = 0; i < ordersToday; i++) {
      const created = new Date(now - d * 86400000 - Math.floor(between(0, 80000000)));
      const itemCount = rand() < 0.3 ? 2 : 1;
      const picks = new Map<number, { p: any; qty: number }>();
      for (let k = 0; k < itemCount; k++) {
        const p: any = pick(inserted);
        const cur = picks.get(p.id);
        picks.set(p.id, { p, qty: (cur?.qty ?? 0) + 1 });
      }
      const lines = [...picks.values()];
      const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0) + (rand() < 0.25 ? 6.9 : 0);
      const margin = lines.reduce((s, l) => s + (l.p.price - l.p.cost) * l.qty, 0);
      const status = d > 12 ? "delivered" : d > 6 ? "shipped" : d > 2 ? "forwarded" : "paid";
      n += Math.floor(between(3, 17));
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: `VND-${n}`,
          customerName: `${pick(firstNames)} ${pick(lastNames)}`,
          customerEmail: `customer${n}@example.com`,
          address: `${Math.floor(between(12, 9999))} ${pick(["Maple","Cedar","Juniper","Willow","Harbor","Atlas"])} ${pick(["Ave","St","Blvd","Ln"])}, ${pick(cities)}`,
          deliverySpeed: rand() < 0.75 ? "standard" : "express",
          promoCode: rand() < 0.3 ? "LAUNCH20" : null,
          total: Math.round(total * 100) / 100,
          marginEarned: Math.round(margin * 100) / 100,
          status,
          supplier: pick([...new Set(lines.map((l) => l.p.supplier))]),
          createdAt: created,
        })
        .returning();
      await db.insert(orderItems).values(
        lines.map((l) => ({
          orderId: order.id,
          productId: l.p.id,
          name: l.p.name,
          price: l.p.price,
          quantity: l.qty,
          image: l.p.image,
          supplier: l.p.supplier,
        }))
      );
      orderCount++;
    }
  }
  console.log(`  ✓ ${orderCount} demo orders across the last 21 days`);

  await db.insert(subscribers).values([
    { email: "founder@acme-goods.co" },
    { email: "hello@modernnest.shop" },
    { email: "press@vendora.example" },
  ]);
  console.log("  ✓ subscribers");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
