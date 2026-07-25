import { Product } from "@/types";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ProductColorVariant {
  id: string;
  name: string;
  hex: string;
  /** When false, show the original photo (no recolor). Default true. */
  tint?: boolean;
}

type Detail = {
  specs: ProductSpec[];
  reviews: ProductReview[];
  inStock?: boolean;
  shipsIn?: string;
};

const sharedReviews = (seed: string): ProductReview[] => [
  {
    id: `${seed}-r1`,
    author: "Maya R.",
    rating: 5,
    date: "Mar 2026",
    comment:
      "Exactly what I needed for a weekend hike. Solid build and easy to pack.",
  },
  {
    id: `${seed}-r2`,
    author: "Jordan L.",
    rating: 4,
    date: "Feb 2026",
    comment:
      "Great quality for the price. Would love one more color option, but performance is excellent.",
  },
  {
    id: `${seed}-r3`,
    author: "Chris P.",
    rating: 5,
    date: "Jan 2026",
    comment:
      "Used this on a rainy overnight trip — stayed reliable the whole way.",
  },
];

const byCategorySpecs: Record<Product["category"], ProductSpec[]> = {
  backpacks: [
    { label: "Capacity", value: "28–60L depending on model" },
    { label: "Frame", value: "Lightweight internal support" },
    { label: "Weather", value: "Water-resistant shell + rain cover ready" },
    { label: "Best for", value: "Day hikes to multi-day trips" },
  ],
  tents: [
    { label: "Seasons", value: "3-season" },
    { label: "Setup", value: "Freestanding / quick pitch" },
    { label: "Weather", value: "Waterproof flysheet" },
    { label: "Best for", value: "Weekend camping & backpacking" },
  ],
  lighting: [
    { label: "Power", value: "Rechargeable USB" },
    { label: "Modes", value: "Multiple brightness levels" },
    { label: "Weather", value: "Weather-resistant housing" },
    { label: "Best for", value: "Night trails & basecamp" },
  ],
  furniture: [
    { label: "Frame", value: "Aluminum / fold-flat design" },
    { label: "Pack size", value: "Compact carry bag included" },
    { label: "Load", value: "Stable for camp cooking & rest" },
    { label: "Best for", value: "Campsite comfort" },
  ],
  drinkware: [
    { label: "Capacity", value: "500ml–1L" },
    { label: "Insulation", value: "Double-wall vacuum" },
    { label: "Lid", value: "Leak-proof trail lid" },
    { label: "Best for", value: "Hot & cold drinks on the move" },
  ],
  accessories: [
    { label: "Material", value: "Outdoor-grade durable build" },
    { label: "Packability", value: "Lightweight & trail-ready" },
    { label: "Use", value: "Everyday adventure essential" },
    { label: "Best for", value: "Completing your kit" },
  ],
};

const colorwaysByCategory: Record<
  Product["category"],
  Omit<ProductColorVariant, "id">[]
> = {
  backpacks: [
    { name: "Forest", hex: "#4F6F54", tint: false },
    { name: "Slate", hex: "#5C6B73" },
    { name: "Sand", hex: "#C4A574" },
    { name: "Charcoal", hex: "#2C3330" },
  ],
  tents: [
    { name: "Pine", hex: "#6F9574", tint: false },
    { name: "Olive", hex: "#6B7340" },
    { name: "Stone", hex: "#8A8F86" },
    { name: "Clay", hex: "#B88560" },
  ],
  lighting: [
    { name: "Black", hex: "#1F2421", tint: false },
    { name: "Orange", hex: "#E07A3D" },
    { name: "Sage", hex: "#6F9574" },
    { name: "Steel", hex: "#7A8580" },
  ],
  furniture: [
    { name: "Khaki", hex: "#A89060", tint: false },
    { name: "Forest", hex: "#4F6F54" },
    { name: "Navy", hex: "#3D4F5F" },
    { name: "Cream", hex: "#E8E0D0" },
  ],
  drinkware: [
    { name: "Black", hex: "#1F2421", tint: false },
    { name: "Forest", hex: "#4F6F54" },
    { name: "Sand", hex: "#C4A574" },
    { name: "Steel", hex: "#7A8580" },
  ],
  accessories: [
    { name: "Trail", hex: "#6F9574", tint: false },
    { name: "Rust", hex: "#C45C2A" },
    { name: "Blue", hex: "#4A6FA5" },
    { name: "Graphite", hex: "#555555" },
  ],
};

/** Same product, same price — different colorways */
export function getProductColorVariants(
  product: Product
): ProductColorVariant[] {
  return colorwaysByCategory[product.category].map((color, index) => ({
    id: `${product.id}-color-${index}`,
    ...color,
  }));
}

export function getProductDetails(product: Product): Detail {
  return {
    specs: byCategorySpecs[product.category],
    reviews: sharedReviews(product.id).map((r, i) => ({
      ...r,
      rating: Math.max(
        3,
        Math.min(5, Math.round(product.rating) - (i === 1 ? 1 : 0))
      ),
    })),
    inStock: true,
    shipsIn: "1–2 business days",
  };
}
