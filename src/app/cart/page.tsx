"use client";

import { useEffect } from "react";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { useStore } from "@/store/useStore";
import { formatPrice, parseProductRouteId } from "@/lib/utils";
import { tapScale } from "@/lib/animations";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, init } =
    useStore();
  const total = getCartTotal();
  const shipping = total > 150 ? 0 : 12;
  const grandTotal = total + shipping;

  useEffect(() => {
    void init();
  }, [init]);

  if (cart.length === 0) {
    return (
      <MainLayout>
        <PageTransition>
          <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 pt-32 text-center">
            <ShoppingBag size={48} className="text-sand" strokeWidth={1} />
            <div>
              <h1 className="text-3xl font-bold text-charcoal">
                Your Cart is Empty
              </h1>
              <p className="mt-2 text-sm text-stone">
                Pack your next adventure — browse tents, packs, and camp gear.
              </p>
            </div>
            <Link
              href="/products"
              className="btn-primary inline-flex min-h-[48px] items-center gap-2 px-8 py-3 text-sm"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </Container>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition>
        <section className="bg-sage pb-12 pt-28 md:pt-32">
          <Container>
            <h1 className="text-4xl font-bold text-cream md:text-5xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-cream/75">
              {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
            </p>
          </Container>
        </section>

        <Container className="section-padding !pt-10">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <AnimatePresence>
                {cart.map((item) => {
                  const { productId } = parseProductRouteId(item.product.id);
                  const href = `/products/${encodeURIComponent(productId)}`;
                  return (
                  <motion.div
                    key={`${productId}-${item.color ?? ""}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 rounded-card border border-sand bg-white p-4 shadow-card md:gap-6 md:p-6"
                  >
                    <Link
                      href={href}
                      className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-sage-soft md:h-32 md:w-28"
                    >
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-sage">
                            {item.product.brand}
                          </p>
                          <Link
                            href={href}
                            className="text-lg font-semibold text-charcoal transition-colors hover:text-sage-dark"
                          >
                            {item.product.name}
                            {item.color ? ` — ${item.color}` : ""}
                          </Link>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={tapScale}
                          onClick={() =>
                            removeFromCart(productId, item.color)
                          }
                          className="text-stone transition-colors hover:text-charcoal"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.quantity - 1,
                                item.color
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-sand transition-colors hover:border-sage"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.quantity + 1,
                                item.color
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-sand transition-colors hover:border-sage"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-charcoal">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <ScrollReveal className="h-fit">
              <div className="rounded-card border border-sand bg-white p-6 shadow-card md:p-8">
                <h2 className="text-xl font-bold text-charcoal">
                  Order Summary
                </h2>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between text-stone">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-sage">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-stone">
                      Free shipping on orders over $150
                    </p>
                  )}
                  <div className="flex justify-between border-t border-sand pt-3 text-base font-bold text-charcoal">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="btn-primary mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 px-8 py-3 text-sm"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-3 w-full py-2 text-xs text-stone transition-colors hover:text-charcoal"
                >
                  Clear Cart
                </button>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </PageTransition>
    </MainLayout>
  );
}
