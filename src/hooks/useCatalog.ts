"use client";

import { useEffect, useState } from "react";
import { categories as staticCategories } from "@/data/categories";
import { partnerBrands } from "@/data/brands";
import { products as staticProducts } from "@/data/products";
import { showcaseItems } from "@/data/showcase";
import { CategoryItem, Product, ShowcaseItem } from "@/types";

interface BrandItem {
  name: string;
  label: string;
}

interface CatalogPayload {
  products: Product[];
  categories: CategoryItem[];
  brands: BrandItem[];
  showcase: ShowcaseItem[];
}

/** Instant first paint — avoids empty sections remounting after /api/catalog */
const staticCatalog: CatalogPayload = {
  products: staticProducts,
  categories: staticCategories,
  brands: partnerBrands.map((b) => ({ name: b.name, label: b.label })),
  showcase: showcaseItems,
};

let cache: CatalogPayload | null = null;
let pending: Promise<CatalogPayload> | null = null;

function loadCatalog(): Promise<CatalogPayload> {
  if (cache) return Promise.resolve(cache);

  if (!pending) {
    pending = fetch("/api/catalog")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load catalog");
        return res.json() as Promise<CatalogPayload>;
      })
      .then((json) => {
        cache = json;
        pending = null;
        return json;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }

  return pending;
}

export function useCatalog() {
  const [data, setData] = useState<CatalogPayload>(cache ?? staticCatalog);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;

    if (cache) {
      setData(cache);
      setLoading(false);
      return;
    }

    void loadCatalog()
      .then((json) => {
        if (!active) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        // Keep static catalog so images remain visible offline / on API errors
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { ...data, loading };
}
