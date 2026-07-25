import { Brand, Category, Product } from "@/types";

export const brands: Brand[] = [
  "Jack Wolfskin",
  "Kovea",
  "Glaree",
  "Pezan",
  "Cordura",
  "Deuter",
  "MSR",
  "Naturehike",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Alpine Trail Backpack 45L",
    brand: "Jack Wolfskin",
    category: "backpacks",
    price: 189,
    originalPrice: 229,
    image: "/images/products/1.webp",
    description:
      "Rugged 45L hiking backpack with ventilated back panel, rain cover, and multiple attachment points for overnight adventures.",
    rating: 4.8,
    reviewCount: 214,
    isPopular: true,
  },
  {
    id: "2",
    name: "Summit Dome Tent 2P",
    brand: "Naturehike",
    category: "tents",
    price: 249,
    originalPrice: 299,
    image: "/images/products/2.webp",
    description:
      "Lightweight double-wall dome tent for two. Easy pitch, waterproof flysheet, and excellent ventilation for 3-season camping.",
    rating: 4.7,
    reviewCount: 168,
    isPopular: true,
    isNew: true,
  },
  {
    id: "3",
    name: "Trailblazer Headlamp",
    brand: "Glaree",
    category: "lighting",
    price: 42,
    image: "/images/products/3.webp",
    description:
      "Bright rechargeable headlamp with multiple modes, red night vision, and IPX6 water resistance for night trails.",
    rating: 4.6,
    reviewCount: 392,
    isPopular: true,
  },
  {
    id: "4",
    name: "Campfire Folding Chair",
    brand: "Pezan",
    category: "furniture",
    price: 68,
    originalPrice: 85,
    image: "/images/products/4.webp",
    description:
      "Compact folding camp chair with cup holder and carry bag. Stable aluminum frame for fireside comfort.",
    rating: 4.5,
    reviewCount: 277,
    isPopular: true,
  },
  {
    id: "5",
    name: "Thermo Trail Bottle 1L",
    brand: "Kovea",
    category: "drinkware",
    price: 36,
    image: "/images/products/5.webp",
    description:
      "Insulated stainless steel bottle that keeps drinks hot or cold for hours. Leak-proof lid for backpack packing.",
    rating: 4.9,
    reviewCount: 451,
    isPopular: true,
  },
  {
    id: "6",
    name: "Wilderness Sleeping Bag",
    brand: "Deuter",
    category: "accessories",
    price: 129,
    originalPrice: 159,
    image: "/images/products/6.webp",
    description:
      "Comfort-rated mummy sleeping bag for cool nights. Compressible stuff sack included for easy packing.",
    rating: 4.7,
    reviewCount: 203,
    isPopular: true,
  },
  {
    id: "7",
    name: "Peak Softshell Backpack 28L",
    brand: "Cordura",
    category: "backpacks",
    price: 145,
    image: "/images/products/7.webp",
    description:
      "Daypack built with Cordura fabric for durability. Hydration-ready and ideal for day hikes and city escapes.",
    rating: 4.6,
    reviewCount: 142,
    isNew: true,
  },
  {
    id: "8",
    name: "Ridge Ultralight Tent 1P",
    brand: "MSR",
    category: "tents",
    price: 319,
    image: "/images/products/8.webp",
    description:
      "Ultralight solo tent for fastpacking. Freestanding design with minimal pack weight and storm-ready poles.",
    rating: 4.8,
    reviewCount: 97,
  },
  {
    id: "9",
    name: "Forest Lantern Pro",
    brand: "Kovea",
    category: "lighting",
    price: 54,
    originalPrice: 69,
    image: "/images/products/9.webp",
    description:
      "Portable camping lantern with warm LED glow, dimmer control, and USB charging for basecamp evenings.",
    rating: 4.5,
    reviewCount: 188,
  },
  {
    id: "10",
    name: "Trail Table Compact",
    brand: "Pezan",
    category: "furniture",
    price: 79,
    image: "/images/products/10.webp",
    description:
      "Fold-flat camping table with aluminum legs. Perfect for cooking setups and outdoor dining.",
    rating: 4.4,
    reviewCount: 121,
  },
  {
    id: "11",
    name: "Stormshell Rain Cover",
    brand: "Jack Wolfskin",
    category: "accessories",
    price: 28,
    image: "/images/products/11.webp",
    description:
      "Waterproof backpack rain cover with reflective accents. Fits packs from 30L to 50L.",
    rating: 4.3,
    reviewCount: 86,
  },
  {
    id: "12",
    name: "Expedition Duffel 60L",
    brand: "Deuter",
    category: "backpacks",
    price: 165,
    originalPrice: 195,
    image: "/images/products/12.webp",
    description:
      "Rugged expedition duffel with backpack straps. Water-resistant shell for basecamp and travel.",
    rating: 4.7,
    reviewCount: 154,
    isPopular: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: Category | "all"): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getPopularProducts(): Product[] {
  return products.filter((p) => p.isPopular);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}
