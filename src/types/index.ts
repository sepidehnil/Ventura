export type Brand =
  | "Jack Wolfskin"
  | "Kovea"
  | "Glaree"
  | "Pezan"
  | "Cordura"
  | "Deuter"
  | "MSR"
  | "Naturehike";

export type Category =
  | "backpacks"
  | "tents"
  | "lighting"
  | "furniture"
  | "drinkware"
  | "accessories";

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: Category;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Selected colorway name, e.g. "Charcoal" */
  color?: string;
}

export interface CategoryItem {
  id: Category;
  name: string;
  image: string;
  productCount: number;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  href: string;
}
