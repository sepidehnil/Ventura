"use client";

import { useEffect, useState } from "react";
import ProductColorImage from "@/components/ui/ProductColorImage";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Truck,
  PackageCheck,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/products/ProductCard";
import PageTransition from "@/components/motion/PageTransition";
import ScrollReveal, {
  StaggerReveal,
  StaggerItem,
} from "@/components/motion/ScrollReveal";
import { useCatalog } from "@/hooks/useCatalog";
import { useStore } from "@/store/useStore";
import { formatPrice, cn, parseProductRouteId } from "@/lib/utils";
import { tapScale } from "@/lib/animations";
import { Product } from "@/types";
import {
  getProductDetails,
  getProductColorVariants,
} from "@/data/productDetails";

function colorIndexForSlug(product: Product, colorSlug?: string) {
  if (!colorSlug) return 0;
  const variants = getProductColorVariants(product);
  const index = variants.findIndex(
    (v) => v.name.toLowerCase() === colorSlug.toLowerCase()
  );
  return index >= 0 ? index : 0;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, loading: catalogLoading } = useCatalog();
  const [product, setProduct] = useState<Product | null>(null);
  const [resolving, setResolving] = useState(true);
  const { cart, addToCart, toggleWishlist, isInWishlist, init } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  const routeId = decodeURIComponent(
    Array.isArray(params.id) ? params.id[0] ?? "" : (params.id as string) ?? ""
  );
  const { productId, colorSlug } = parseProductRouteId(routeId);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setResolving(false);
      return;
    }

    let active = true;
    setResolving(true);

    const fromCatalog = products.find((p) => p.id === productId);
    const cartItem = cart.find(
      (item) => parseProductRouteId(item.product.id).productId === productId
    );
    const fromCart = cartItem
      ? {
          ...cartItem.product,
          id: productId,
          name: cartItem.product.name.replace(/\s—\s.+$/, ""),
        }
      : null;

    const local = fromCatalog ?? fromCart;
    if (local) {
      setProduct(local);
      setActiveColor(
        colorIndexForSlug(
          local,
          colorSlug ?? cartItem?.color?.toLowerCase()
        )
      );
      setResolving(false);
      return;
    }

    // Wait for catalog before treating as missing
    if (catalogLoading) return;

    fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (data?.product) {
          const next = data.product as Product;
          setProduct(next);
          setActiveColor(colorIndexForSlug(next, colorSlug));
        } else {
          setProduct(null);
        }
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setResolving(false);
      });

    return () => {
      active = false;
    };
  }, [productId, colorSlug, products, catalogLoading, cart]);

  if (resolving || (catalogLoading && !product)) {
    return (
      <MainLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-32">
          <p className="text-stone">Loading product...</p>
        </Container>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 pt-32">
          <p className="text-stone">Product not found</p>
          <Link href="/products" className="btn-primary">
            Back to Shop
          </Link>
        </Container>
      </MainLayout>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const wished = isInWishlist(product.id);
  const colorVariants = getProductColorVariants(product);
  const selectedColor = colorVariants[activeColor] ?? colorVariants[0];
  const details = getProductDetails(product);

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity,
      color: selectedColor.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <MainLayout>
      <PageTransition>
        <Container className="pb-8 pt-28 md:pt-32">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost mb-8 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <ScrollReveal direction="left">
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-card bg-[#eef2ee]">
                  <ProductColorImage
                    src={product.image}
                    alt={`${product.name} in ${selectedColor.name}`}
                    hex={selectedColor.hex}
                    tint={selectedColor.tint !== false}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {colorVariants.map((variant, i) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setActiveColor(i)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-2xl bg-[#eef2ee] ring-2 transition",
                        activeColor === i
                          ? "ring-sage"
                          : "ring-transparent hover:ring-sand"
                      )}
                      aria-label={`${product.name} in ${variant.name}`}
                      title={`${variant.name} — ${formatPrice(product.price)}`}
                    >
                      <ProductColorImage
                        src={product.image}
                        alt=""
                        hex={variant.hex}
                        tint={variant.tint !== false}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-charcoal/55 px-1 py-0.5 text-center text-[10px] font-medium text-cream">
                        {variant.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1}>
              <div className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-sage">
                      {product.brand}
                    </p>
                    <h1 className="mt-2 font-heading text-3xl font-semibold text-charcoal md:text-4xl">
                      {product.name}
                    </h1>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={tapScale}
                    onClick={() => toggleWishlist(product.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-sand transition-colors hover:border-sage"
                    aria-label={
                      wished ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      size={20}
                      className={
                        wished ? "fill-accent text-accent" : "text-charcoal"
                      }
                    />
                  </motion.button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "text-sand"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-stone">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="text-2xl font-bold text-charcoal">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-stone line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-charcoal">
                    Color — {selectedColor.name}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {colorVariants.map((variant, i) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setActiveColor(i)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                          activeColor === i
                            ? "border-charcoal scale-110"
                            : "border-transparent hover:border-sand"
                        )}
                        aria-label={`Select ${variant.name}`}
                        title={`${variant.name} — ${formatPrice(product.price)}`}
                      >
                        <span
                          className="h-6 w-6 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: variant.hex }}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-stone">
                    Same product &amp; price for every colorway
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-sage-dark">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1.5">
                    <PackageCheck size={14} />
                    In stock
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1.5">
                    <Truck size={14} />
                    Ships in {details.shipsIn}
                  </span>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-stone">
                  {product.description}
                </p>

                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-charcoal">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand transition-colors hover:border-sage"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand transition-colors hover:border-sage"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={18} />
                          Added to Cart
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag size={18} />
                          Add to Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  <Link
                    href="/cart"
                    className="btn-outline flex min-h-[48px] flex-1 items-center justify-center px-8 py-3 text-sm"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <ScrollReveal>
              <h2 className="font-heading text-2xl font-semibold text-charcoal">
                Specs
              </h2>
              <dl className="mt-5 divide-y divide-sand rounded-card border border-sand bg-white">
                {details.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start justify-between gap-4 px-5 py-4 text-sm"
                  >
                    <dt className="font-medium text-charcoal">{spec.label}</dt>
                    <dd className="text-right text-stone">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <h2 className="font-heading text-2xl font-semibold text-charcoal">
                Reviews
              </h2>
              <div className="mt-5 space-y-4">
                {details.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-card border border-sand bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-charcoal">
                        {review.author}
                      </p>
                      <p className="text-xs text-stone">{review.date}</p>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < review.rating
                              ? "fill-accent text-accent"
                              : "text-sand"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone">
                      {review.comment}
                    </p>
                  </article>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </Container>

        {related.length > 0 && (
          <section className="section-padding bg-sage-soft">
            <Container>
              <ScrollReveal className="mb-10">
                <h2 className="font-heading text-3xl font-semibold text-charcoal">
                  You May Also Like
                </h2>
              </ScrollReveal>
              <StaggerReveal className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {related.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </Container>
          </section>
        )}
      </PageTransition>
    </MainLayout>
  );
}
