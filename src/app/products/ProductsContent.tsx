"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/products/ProductCard";
import PageTransition from "@/components/motion/PageTransition";
import ScrollReveal, { StaggerReveal, StaggerItem } from "@/components/motion/ScrollReveal";
import { useCatalog } from "@/hooks/useCatalog";
import { Brand, Category, Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";

const CATEGORY_OPTIONS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "backpacks", label: "Backpacks" },
  { id: "tents", label: "Tents" },
  { id: "lighting", label: "Lighting" },
  { id: "drinkware", label: "Drinkware" },
  { id: "furniture", label: "Furniture" },
  { id: "accessories", label: "Accessories" },
];

const categoryIds = new Set(
  CATEGORY_OPTIONS.filter((c) => c.id !== "all").map((c) => c.id)
);

const PRICE_PRESETS = [
  { id: "any", label: "Any price", min: null, max: null },
  { id: "under-50", label: "Under $50", min: null, max: 50 },
  { id: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { id: "100-200", label: "$100 – $200", min: 100, max: 200 },
  { id: "200-plus", label: "$200 & up", min: 200, max: null },
] as const;

const RATING_OPTIONS = [
  { id: "any", label: "Any rating", value: 0 },
  { id: "4.5", label: "4.5 & up", value: 4.5 },
  { id: "4.0", label: "4.0 & up", value: 4 },
] as const;

const SORT_OPTIONS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "newest", label: "Newest" },
];

function isDiscounted(product: Product) {
  return Boolean(product.originalPrice && product.originalPrice > product.price);
}

function parseCategory(value: string | null): Category | "all" {
  if (value && categoryIds.has(value as Category)) return value as Category;
  return "all";
}

function parseNumber(value: string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function FilterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-charcoal">
      {children}
    </h3>
  );
}

function FilterButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-lg py-2 text-left text-sm transition-colors",
        active
          ? "font-semibold text-sage-dark"
          : "text-stone hover:text-charcoal"
      )}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span className="text-xs tabular-nums text-stone/70">{count}</span>
      )}
    </button>
  );
}

export default function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, brands: catalogBrands } = useCatalog();

  const category = parseCategory(searchParams.get("category"));
  const brandParam = searchParams.get("brand");
  const brand: Brand | "All" =
    brandParam && catalogBrands.some((b) => b.name === brandParam)
      ? (brandParam as Brand)
      : "All";
  const dealOnly = searchParams.get("deal") === "1";
  const newOnly = searchParams.get("new") === "1";
  const minPrice = parseNumber(searchParams.get("minPrice"));
  const maxPrice = parseNumber(searchParams.get("maxPrice"));
  const minRating = parseNumber(searchParams.get("rating")) ?? 0;
  const sort = searchParams.get("sort") || "popular";

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [draftMin, setDraftMin] = useState(minPrice?.toString() ?? "");
  const [draftMax, setDraftMax] = useState(maxPrice?.toString() ?? "");

  useEffect(() => {
    setDraftMin(minPrice?.toString() ?? "");
    setDraftMax(maxPrice?.toString() ?? "");
  }, [minPrice, maxPrice]);

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "" || value === "all" || value === "0") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setCategory = (next: Category | "all") => {
    updateParams({
      category: next === "all" ? null : next,
      deal: next !== "all" ? null : searchParams.get("deal"),
    });
  };

  const applyCustomPrice = () => {
    const min = draftMin.trim() === "" ? null : Number(draftMin);
    const max = draftMax.trim() === "" ? null : Number(draftMax);
    updateParams({
      minPrice:
        min != null && Number.isFinite(min) ? String(Math.max(0, min)) : null,
      maxPrice:
        max != null && Number.isFinite(max) ? String(Math.max(0, max)) : null,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDraftMin("");
    setDraftMax("");
    router.push(pathname, { scroll: false });
  };

  const catalogMax = useMemo(
    () => (products.length ? Math.max(...products.map((p) => p.price)) : 400),
    [products]
  );

  const filtered = useMemo(() => {
    let result = products;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (brand !== "All") {
      result = result.filter((p) => p.brand === brand);
    }
    if (dealOnly) {
      result = result.filter(isDiscounted);
    }
    if (newOnly) {
      result = result.filter((p) => p.isNew);
    }
    if (minPrice != null) {
      result = result.filter((p) => p.price >= minPrice);
    }
    if (maxPrice != null) {
      result = result.filter((p) => p.price <= maxPrice);
    }
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...result].sort(
          (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        );
      default:
        return [...result].sort(
          (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
        );
    }
  }, [
    products,
    category,
    brand,
    dealOnly,
    newOnly,
    minPrice,
    maxPrice,
    minRating,
    search,
    sort,
  ]);

  const counts = useMemo(() => {
    const base = products;
    const byCategory = Object.fromEntries(
      CATEGORY_OPTIONS.map((c) => [
        c.id,
        c.id === "all"
          ? base.length
          : base.filter((p) => p.category === c.id).length,
      ])
    ) as Record<string, number>;

    const byBrand: Record<string, number> = { All: base.length };
    for (const b of catalogBrands) {
      byBrand[b.name] = base.filter((p) => p.brand === b.name).length;
    }

    return {
      byCategory,
      byBrand,
      onSale: base.filter(isDiscounted).length,
      isNew: base.filter((p) => p.isNew).length,
    };
  }, [products, catalogBrands]);

  const activePricePreset = PRICE_PRESETS.find((preset) => {
    if (preset.id === "any") return minPrice == null && maxPrice == null;
    return preset.min === minPrice && preset.max === maxPrice;
  })?.id;

  const categoryLabel =
    CATEGORY_OPTIONS.find((c) => c.id === category)?.label ?? "All";

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (category !== "all") {
      chips.push({
        key: "category",
        label: categoryLabel,
        clear: () => setCategory("all"),
      });
    }
    if (brand !== "All") {
      chips.push({
        key: "brand",
        label: brand,
        clear: () => updateParams({ brand: null }),
      });
    }
    if (dealOnly) {
      chips.push({
        key: "deal",
        label: "On sale",
        clear: () => updateParams({ deal: null }),
      });
    }
    if (newOnly) {
      chips.push({
        key: "new",
        label: "New arrivals",
        clear: () => updateParams({ new: null }),
      });
    }
    if (minPrice != null || maxPrice != null) {
      const from = minPrice != null ? formatPrice(minPrice) : formatPrice(0);
      const to = maxPrice != null ? formatPrice(maxPrice) : `${formatPrice(catalogMax)}+`;
      chips.push({
        key: "price",
        label: `${from} – ${to}`,
        clear: () => {
          setDraftMin("");
          setDraftMax("");
          updateParams({ minPrice: null, maxPrice: null });
        },
      });
    }
    if (minRating > 0) {
      chips.push({
        key: "rating",
        label: `${minRating}+ stars`,
        clear: () => updateParams({ rating: null }),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters are stable enough for chips
  }, [
    category,
    categoryLabel,
    brand,
    dealOnly,
    newOnly,
    minPrice,
    maxPrice,
    minRating,
    catalogMax,
    updateParams,
  ]);

  const hasActiveFilters =
    activeChips.length > 0 || search.trim().length > 0 || sort !== "popular";

  const heading = dealOnly
    ? "Discounted Products"
    : category === "all"
      ? "Shop All Gear"
      : categoryLabel;

  const eyebrow = dealOnly
    ? "Limited time"
    : category === "all"
      ? "Outdoor catalog"
      : "Category";

  const subtitle = dealOnly
    ? "Trail-ready deals with marked-down prices — grab them while they last."
    : category === "all"
      ? "Backpacks, tents, lighting, and camp essentials from trusted outdoor brands."
      : `Browse our ${categoryLabel.toLowerCase()} collection.`;

  return (
    <MainLayout>
      <PageTransition>
        <section className="bg-sage pb-16 pt-28 md:pb-20 md:pt-32">
          <Container>
            <ScrollReveal>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage-light">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-bold text-cream md:text-6xl">
                {heading}
              </h1>
              <p className="mt-4 max-w-lg text-sm text-cream/80">{subtitle}</p>
            </ScrollReveal>
          </Container>
        </section>

        <Container className="section-padding !pt-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand, or category..."
                className="min-h-[48px] w-full rounded-full border border-sand bg-white py-3 pl-11 pr-4 text-sm focus:border-sage focus:outline-none"
                aria-label="Search products"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex !min-h-[48px] items-center gap-2 md:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeChips.length > 0 && (
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] text-cream">
                    {activeChips.length}
                  </span>
                )}
              </button>
              <select
                value={sort}
                onChange={(e) =>
                  updateParams({
                    sort: e.target.value === "popular" ? null : e.target.value,
                  })
                }
                className="min-h-[48px] rounded-full border border-sand bg-white px-4 text-sm focus:border-sage focus:outline-none"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:border-sage hover:text-sage-dark"
                >
                  {chip.label}
                  <X size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-sage-dark underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex gap-8">
            <aside
              className={cn(
                "w-60 shrink-0 space-y-8",
                showFilters ? "block" : "hidden md:block"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-charcoal">Filters</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-sage-dark hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div>
                <FilterHeading>Category</FilterHeading>
                <div className="space-y-0.5">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <FilterButton
                      key={cat.id}
                      active={category === cat.id}
                      onClick={() => setCategory(cat.id)}
                      count={counts.byCategory[cat.id]}
                    >
                      {cat.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div>
                <FilterHeading>Brand</FilterHeading>
                <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
                  <FilterButton
                    active={brand === "All"}
                    onClick={() => updateParams({ brand: null })}
                    count={counts.byBrand.All}
                  >
                    All brands
                  </FilterButton>
                  {catalogBrands.map((b) => (
                    <FilterButton
                      key={b.name}
                      active={brand === b.name}
                      onClick={() => updateParams({ brand: b.name })}
                      count={counts.byBrand[b.name] ?? 0}
                    >
                      {b.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div>
                <FilterHeading>Price</FilterHeading>
                <div className="space-y-0.5">
                  {PRICE_PRESETS.map((preset) => (
                    <FilterButton
                      key={preset.id}
                      active={activePricePreset === preset.id}
                      onClick={() => {
                        setDraftMin(preset.min != null ? String(preset.min) : "");
                        setDraftMax(preset.max != null ? String(preset.max) : "");
                        updateParams({
                          minPrice:
                            preset.min != null ? String(preset.min) : null,
                          maxPrice:
                            preset.max != null ? String(preset.max) : null,
                        });
                      }}
                    >
                      {preset.label}
                    </FilterButton>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-stone">Min</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="0"
                      value={draftMin}
                      onChange={(e) => setDraftMin(e.target.value)}
                      onBlur={applyCustomPrice}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyCustomPrice();
                      }}
                      className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none"
                      aria-label="Minimum price"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-stone">Max</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder={String(catalogMax)}
                      value={draftMax}
                      onChange={(e) => setDraftMax(e.target.value)}
                      onBlur={applyCustomPrice}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyCustomPrice();
                      }}
                      className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none"
                      aria-label="Maximum price"
                    />
                  </label>
                </div>
              </div>

              <div>
                <FilterHeading>Customer rating</FilterHeading>
                <div className="space-y-0.5">
                  {RATING_OPTIONS.map((opt) => (
                    <FilterButton
                      key={opt.id}
                      active={minRating === opt.value}
                      onClick={() =>
                        updateParams({
                          rating: opt.value > 0 ? String(opt.value) : null,
                        })
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {opt.value > 0 && (
                          <Star
                            size={12}
                            className="fill-accent text-accent"
                          />
                        )}
                        {opt.label}
                      </span>
                    </FilterButton>
                  ))}
                </div>
              </div>

              <div>
                <FilterHeading>Offers</FilterHeading>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-charcoal">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dealOnly}
                        onChange={(e) =>
                          updateParams({
                            deal: e.target.checked ? "1" : null,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-sage focus:ring-sage"
                      />
                      On sale
                    </span>
                    <span className="text-xs tabular-nums text-stone/70">
                      {counts.onSale}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-charcoal">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newOnly}
                        onChange={(e) =>
                          updateParams({
                            new: e.target.checked ? "1" : null,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-sage focus:ring-sage"
                      />
                      New arrivals
                    </span>
                    <span className="text-xs tabular-nums text-stone/70">
                      {counts.isNew}
                    </span>
                  </label>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <p className="mb-6 text-sm text-stone">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                {category !== "all" ? ` in ${categoryLabel}` : ""}
              </p>
              <StaggerReveal className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {filtered.map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerReveal>
              {filtered.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-stone">
                    No products match these filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-sage-dark hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </PageTransition>
    </MainLayout>
  );
}
