export type UpsellRecommendation = {
  id: string;
  name: string;
  tagline: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  image: string;
  category: string;
  supplier: string;
  supplierCountry: string;
  cost: number;
  urgencySeconds: number; // e.g. 600 (10 minutes)
  perks: string[];
};

export const UPSELL_CATALOG: UpsellRecommendation[] = [
  {
    id: "upsell-voltcore-20k",
    name: "VoltCore 20K MagSafe Power Bank",
    tagline: "Ultra-slim 65W fast-charging battery pack with LED power display",
    originalPrice: 49.99,
    discountedPrice: 28.99,
    discountPercent: 42,
    image: "https://images.pexels.com/photos/4068314/pexels-photo-4068314.jpeg?auto=compress&cs=tinysrgb&w=900&fit=crop",
    category: "Phone Accessories",
    supplier: "Dongguan TechCharge Co., Ltd.",
    supplierCountry: "CN",
    cost: 8.5,
    urgencySeconds: 600,
    perks: [
      "Airline approved 20,000mAh capacity",
      "MagSafe snap-on magnetic wireless charging",
      "Recharges to 80% in 35 minutes",
    ],
  },
  {
    id: "upsell-silicone-culinary",
    name: "Silicone Culinary Travel Set & Insulated Sling",
    tagline: "BPA-free foldaway utensils with thermal neoprene bottle carrier",
    originalPrice: 24.99,
    discountedPrice: 14.5,
    discountPercent: 42,
    image: "https://images.pexels.com/photos/4226876/pexels-photo-4226876.jpeg?auto=compress&cs=tinysrgb&w=900&fit=crop",
    category: "Kitchen & Dining",
    supplier: "Zhejiang Homeware Precision Co., Ltd.",
    supplierCountry: "CN",
    cost: 3.2,
    urgencySeconds: 600,
    perks: [
      "Dishwasher safe 100% food-grade platinum silicone",
      "Fits any standard 24oz–40oz tumbler or bento box",
      "Zero plastic waste guarantee",
    ],
  },
  {
    id: "upsell-snail-mucin-barrier",
    name: "96% Snail Mucin Peptide Barrier Gel",
    tagline: "Ultra-hydrating glass skin repair cream with niacinamide",
    originalPrice: 34.0,
    discountedPrice: 19.99,
    discountPercent: 41,
    image: "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=900&fit=crop",
    category: "Beauty & Personal Care",
    supplier: "Guangzhou BioClean Skincare Labs",
    supplierCountry: "CN",
    cost: 4.1,
    urgencySeconds: 600,
    perks: [
      "Cruelty-free filtered mucin extract",
      "Locks moisture for 48 hours without greasiness",
      "Clinically dermatologically tested",
    ],
  },
  {
    id: "upsell-hydro-snuffle-mat",
    name: "Interactive Nosework Foraging Snuffle Mat",
    tagline: "Non-slip mental stimulation puzzle mat for high-energy dogs & cats",
    originalPrice: 29.99,
    discountedPrice: 16.99,
    discountPercent: 43,
    image: "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=900&fit=crop",
    category: "Pet Supplies",
    supplier: "Hangzhou PetComfort Innovations",
    supplierCountry: "CN",
    cost: 3.8,
    urgencySeconds: 600,
    perks: [
      "Machine-washable polar fleece fabric",
      "Reduces canine anxiety and rapid eating",
      "Suction cup non-slip bottom",
    ],
  },
];

/**
 * Returns a high-affinity upsell item tailored to the category of the customer's purchase
 */
export function getRecommendedUpsell(category?: string | null): UpsellRecommendation {
  if (category) {
    const matched = UPSELL_CATALOG.find(
      (u) => u.category.toLowerCase() === category.toLowerCase()
    );
    if (matched) return matched;
  }
  // Default high-converting tech accessory
  return UPSELL_CATALOG[0];
}
