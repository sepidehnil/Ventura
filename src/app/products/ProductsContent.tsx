"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
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
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
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
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
        active
          ? "bg-sage/15 font-semibold text-sage-dark ring-1 ring-sage/25"
          : "text-stone hover:bg-white hover:text-charcoal"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          active
            ? "border-sage bg-sage text-cream"
            : "border-sand bg-white group-hover:border-sage/50"
        )}
      >
        {active && <Check size={10} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] tabular-nums",
            active ? "bg-sage/20 text-sage-dark" : "bg-sand/60 text-stone/80"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
        checked
          ? "bg-sage/15 font-medium text-sage-dark ring-1 ring-sage/25"
          : "text-charcoal hover:bg-white"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          checked
            ? "border-sage bg-sage text-cream shadow-sm"
            : "border-sand bg-white"
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs tabular-nums text-stone/70">{count}</span>
      )}
    </button>
  );
}

function SortMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current =
    SORT_OPTIONS.find((opt) => opt.id === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort products"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-sand bg-white px-4 text-sm font-medium text-charcoal shadow-sm transition-colors hover:border-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      >
        <span className="text-stone">Sort</span>
        <span>{current.label}</span>
        <ChevronDown
          size={16}
          className={cn(
            "text-stone transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[13.5rem] overflow-hidden rounded-2xl border border-sand bg-white py-1.5 shadow-lift"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.id === current.id;
            return (
              <li key={opt.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-sage/10 font-semibold text-sage-dark"
                      : "text-charcoal hover:bg-sage-soft/60"
                  )}
                >
                  {opt.label}
                  {active && <Check size={14} className="text-sage-dark" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type FilterCounts = {
  byCategory: Record<string, number>;
  byBrand: Record<string, number>;
  onSale: number;
  isNew: number;
};

function FilterPanels({
  category,
  brand,
  dealOnly,
  newOnly,
  minRating,
  activePricePreset,
  draftMin,
  draftMax,
  catalogMax,
  catalogBrands,
  counts,
  hasActiveFilters,
  setCategory,
  setDraftMin,
  setDraftMax,
  applyCustomPrice,
  clearFilters,
  updateParams,
  hideHeader = false,
}: {
  category: Category | "all";
  brand: Brand | "All";
  dealOnly: boolean;
  newOnly: boolean;
  minRating: number;
  activePricePreset: string | undefined;
  draftMin: string;
  draftMax: string;
  catalogMax: number;
  catalogBrands: { name: string; label: string }[];
  counts: FilterCounts;
  hasActiveFilters: boolean;
  setCategory: (next: Category | "all") => void;
  setDraftMin: (value: string) => void;
  setDraftMax: (value: string) => void;
  applyCustomPrice: () => void;
  clearFilters: () => void;
  updateParams: (patch: Record<string, string | null>) => void;
  hideHeader?: boolean;
}) {
  return (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 ring-1 ring-sand">
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
      )}

      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-sand">
        <FilterHeading>Category</FilterHeading>
        <div className="space-y-1">
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

      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-sand">
        <FilterHeading>Brand</FilterHeading>
        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
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

      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-sand">
        <FilterHeading>Price</FilterHeading>
        <div className="space-y-1">
          {PRICE_PRESETS.map((preset) => (
            <FilterButton
              key={preset.id}
              active={activePricePreset === preset.id}
              onClick={() => {
                setDraftMin(preset.min != null ? String(preset.min) : "");
                setDraftMax(preset.max != null ? String(preset.max) : "");
                updateParams({
                  minPrice: preset.min != null ? String(preset.min) : null,
                  maxPrice: preset.max != null ? String(preset.max) : null,
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
              className="w-full rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm focus:border-sage focus:outline-none"
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
              className="w-full rounded-xl border border-sand bg-cream px-3 py-2.5 text-sm focus:border-sage focus:outline-none"
              aria-label="Maximum price"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-sand">
        <FilterHeading>Customer rating</FilterHeading>
        <div className="space-y-1">
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
                  <Star size={12} className="fill-accent text-accent" />
                )}
                {opt.label}
              </span>
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-sand">
        <FilterHeading>Offers</FilterHeading>
        <div className="space-y-1">
          <FilterCheckbox
            checked={dealOnly}
            onChange={(next) => updateParams({ deal: next ? "1" : null })}
            label="On sale"
            count={counts.onSale}
          />
          <FilterCheckbox
            checked={newOnly}
            onChange={(next) => updateParams({ new: next ? "1" : null })}
            label="New arrivals"
            count={counts.isNew}
          />
        </div>
      </div>
    </>
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

  // Lock body scroll while the mobile filter drawer is open
  useEffect(() => {
    if (!showFilters) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showFilters]);

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
              <SortMenu
                value={sort}
                onChange={(next) =>
                  updateParams({
                    sort: next === "popular" ? null : next,
                  })
                }
              />
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
            {/* Desktop sidebar — never squeezes the mobile product grid */}
            <aside className="hidden w-64 shrink-0 space-y-4 md:block">
              <FilterPanels
                category={category}
                brand={brand}
                dealOnly={dealOnly}
                newOnly={newOnly}
                minRating={minRating}
                activePricePreset={activePricePreset}
                draftMin={draftMin}
                draftMax={draftMax}
                catalogMax={catalogMax}
                catalogBrands={catalogBrands}
                counts={counts}
                hasActiveFilters={hasActiveFilters}
                setCategory={setCategory}
                setDraftMin={setDraftMin}
                setDraftMax={setDraftMax}
                applyCustomPrice={applyCustomPrice}
                clearFilters={clearFilters}
                updateParams={updateParams}
              />
            </aside>

            {/* Mobile filter drawer overlay */}
            {showFilters && (
              <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
                <button
                  type="button"
                  className="absolute inset-0 bg-charcoal/40"
                  aria-label="Close filters"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-cream shadow-xl">
                  <div className="flex items-center justify-between border-b border-sand px-5 py-4">
                    <p className="text-sm font-semibold text-charcoal">Filters</p>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal hover:bg-sage-soft"
                      aria-label="Close filters"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <FilterPanels
                      category={category}
                      brand={brand}
                      dealOnly={dealOnly}
                      newOnly={newOnly}
                      minRating={minRating}
                      activePricePreset={activePricePreset}
                      draftMin={draftMin}
                      draftMax={draftMax}
                      catalogMax={catalogMax}
                      catalogBrands={catalogBrands}
                      counts={counts}
                      hasActiveFilters={hasActiveFilters}
                      setCategory={setCategory}
                      setDraftMin={setDraftMin}
                      setDraftMax={setDraftMax}
                      applyCustomPrice={applyCustomPrice}
                      clearFilters={clearFilters}
                      updateParams={updateParams}
                      hideHeader
                    />
                  </div>
                  <div className="border-t border-sand p-4">
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="btn-primary w-full !min-h-[48px]"
                    >
                      Show {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="min-w-0 flex-1">
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
