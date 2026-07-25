import { create } from "zustand";
import { CartItem } from "@/types";
import { parseProductRouteId } from "@/lib/utils";

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  initialized: boolean;
  init: () => Promise<void>;
  syncCart: () => Promise<boolean>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, color?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

function sameLine(a: CartItem, productId: string, color?: string) {
  const aParsed = parseProductRouteId(a.product.id);
  const bParsed = parseProductRouteId(productId);
  const aColor = (a.color || aParsed.colorSlug || "").toLowerCase();
  const bColor = (color || bParsed.colorSlug || "").toLowerCase();
  return aParsed.productId === bParsed.productId && aColor === bColor;
}

/** Normalize legacy colorway IDs (`12__charcoal`) into real product + color. */
function normalizeCartItem(item: CartItem): CartItem {
  const { productId, colorSlug } = parseProductRouteId(item.product.id);
  if (productId === item.product.id && !colorSlug) return item;

  const colorFromSlug = colorSlug
    ? colorSlug.charAt(0).toUpperCase() + colorSlug.slice(1)
    : undefined;

  return {
    ...item,
    product: {
      ...item.product,
      id: productId,
      name: item.product.name.replace(/\s—\s.+$/, ""),
    },
    color: item.color || colorFromSlug,
  };
}

async function readJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!res.ok || !text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const useStore = create<StoreState>()((set, get) => ({
  cart: [],
  wishlist: [],
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/wishlist"),
      ]);
      const cartData = await readJson<{ cart?: CartItem[] }>(cartRes);
      const wishlistData = await readJson<{ wishlist?: string[] }>(
        wishlistRes
      );
      set({
        cart: (cartData?.cart ?? []).map(normalizeCartItem),
        wishlist: (wishlistData?.wishlist ?? []).map(
          (id) => parseProductRouteId(id).productId
        ),
        initialized: true,
      });
    } catch {
      set({ initialized: true });
    }
  },

  syncCart: async () => {
    const items = get().cart.map(normalizeCartItem);
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          color: item.color ?? "",
        })),
      }),
    });
    const data = await readJson<{ cart?: CartItem[] }>(res);
    if (!res.ok || !data?.cart) return false;
    set({ cart: data.cart.map(normalizeCartItem) });
    return data.cart.length > 0 || items.length === 0;
  },

  addToCart: (item) => {
    const normalized = normalizeCartItem(item);
    const cart = get().cart;
    const existing = cart.find((c) =>
      sameLine(c, normalized.product.id, normalized.color)
    );
    const next = existing
      ? cart.map((c) =>
          sameLine(c, normalized.product.id, normalized.color)
            ? { ...c, quantity: c.quantity + normalized.quantity }
            : c
        )
      : [...cart, normalized];
    set({ cart: next });

    void fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: normalized.product.id,
        quantity: normalized.quantity,
        color: normalized.color ?? "",
      }),
    })
      .then((res) => readJson<{ cart?: CartItem[] }>(res))
      .then((data) => {
        if (data?.cart) set({ cart: data.cart.map(normalizeCartItem) });
      });
  },

  removeFromCart: (productId, color) => {
    const { productId: realId } = parseProductRouteId(productId);
    const next = get().cart.filter((c) => !sameLine(c, realId, color));
    set({ cart: next });
    void fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: realId, color: color ?? "" }),
    })
      .then((res) => readJson<{ cart?: CartItem[] }>(res))
      .then((data) => {
        if (data?.cart) set({ cart: data.cart.map(normalizeCartItem) });
      });
  },

  updateQuantity: (productId, quantity, color) => {
    const { productId: realId } = parseProductRouteId(productId);
    if (quantity <= 0) {
      get().removeFromCart(realId, color);
      return;
    }
    const next = get().cart.map((c) =>
      sameLine(c, realId, color) ? { ...c, quantity } : c
    );
    set({ cart: next });
    void fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: realId,
        quantity,
        color: color ?? "",
      }),
    })
      .then((res) => readJson<{ cart?: CartItem[] }>(res))
      .then((data) => {
        if (data?.cart) set({ cart: data.cart.map(normalizeCartItem) });
      });
  },

  clearCart: () => {
    set({ cart: [] });
    void fetch("/api/cart", { method: "DELETE" });
  },

  getCartTotal: () =>
    get().cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),

  getCartCount: () =>
    get().cart.reduce((sum, item) => sum + item.quantity, 0),

  toggleWishlist: (productId) => {
    const wishlist = get().wishlist;
    const wished = wishlist.includes(productId);
    const next = wished
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    set({ wishlist: next });

    void fetch("/api/wishlist", {
      method: wished ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((res) => readJson<{ wishlist?: string[] }>(res))
      .then((data) => {
        if (data?.wishlist) set({ wishlist: data.wishlist });
      });
  },

  isInWishlist: (productId) => get().wishlist.includes(productId),
}));
