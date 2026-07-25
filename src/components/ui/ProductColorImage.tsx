"use client";

import { useEffect, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

interface ProductColorImageProps {
  src: string;
  alt: string;
  /** Target colorway hex — applied only to product pixels, not the studio background */
  hex: string;
  /** When false, show the original photo with no tint */
  tint?: boolean;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance({ r, g, b }: RGB) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbDistance(a: RGB, b: RGB) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

/** Hue-ish distance after removing shared luminance shift (keeps soft shadows as bg). */
function chromaDistance(pixel: RGB, bg: RGB) {
  const dL = luminance(pixel) - luminance(bg);
  return Math.hypot(
    pixel.r - bg.r - dL,
    pixel.g - bg.g - dL,
    pixel.b - bg.b - dL
  );
}

function rgbToHsl({ r, g, b }: RGB) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let T = t;
    if (T < 0) T += 1;
    if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function applyColorKeepLuma(pixel: RGB, target: RGB): RGB {
  const { l } = rgbToHsl(pixel);
  const { h, s } = rgbToHsl(target);
  return hslToRgb(h, Math.min(s, 0.5), l);
}

function sampleCorners(data: Uint8ClampedArray, width: number, height: number) {
  const points = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ] as const;
  return points.map(([x, y]) => {
    const i = (y * width + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  });
}

/**
 * Recolor product pixels only. Studio backgrounds are detected via corner
 * chromakey + shadow protection. Returns null for unsafe lifestyle shots.
 */
function recolorProductPixels(source: ImageData, hex: string): ImageData | null {
  const { width, height, data } = source;
  const corners = sampleCorners(data, width, height);
  const bg: RGB = {
    r: Math.round(corners.reduce((s, c) => s + c.r, 0) / corners.length),
    g: Math.round(corners.reduce((s, c) => s + c.g, 0) / corners.length),
    b: Math.round(corners.reduce((s, c) => s + c.b, 0) / corners.length),
  };

  const cornerSpread = Math.max(...corners.map((c) => rgbDistance(c, bg)));
  if (cornerSpread > 45 || luminance(bg) < 180) {
    return null;
  }

  const target = hexToRgb(hex);
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;
  const bgLum = luminance(bg);

  for (let i = 0; i < d.length; i += 4) {
    const pixel = { r: d[i], g: d[i + 1], b: d[i + 2] };
    const L = luminance(pixel);
    const rgbDist = rgbDistance(pixel, bg);
    const chromaDist = chromaDistance(pixel, bg);

    const isSoftShadow =
      L < bgLum && L > bgLum * 0.45 && chromaDist < 18 && rgbDist < 90;
    const isBackground = rgbDist < 32 || chromaDist < 12 || isSoftShadow;

    if (isBackground) continue;

    const next = applyColorKeepLuma(pixel, target);
    d[i] = next.r;
    d[i + 1] = next.g;
    d[i + 2] = next.b;
  }

  return out;
}

const recolorCache = new Map<string, string | null>();

function loadRecolored(src: string, hex: string): Promise<string | null> {
  const key = `${src}|${hex}`;
  if (recolorCache.has(key)) {
    return Promise.resolve(recolorCache.get(key) ?? null);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          recolorCache.set(key, null);
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const recolored = recolorProductPixels(source, hex);
        if (!recolored) {
          recolorCache.set(key, null);
          resolve(null);
          return;
        }
        ctx.putImageData(recolored, 0, 0);
        const url = canvas.toDataURL("image/webp", 0.88);
        recolorCache.set(key, url);
        resolve(url);
      } catch {
        recolorCache.set(key, null);
        resolve(null);
      }
    };
    img.onerror = () => {
      recolorCache.set(key, null);
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Recolors only the product. Light studio backgrounds (and soft shadows) stay
 * unchanged. Lifestyle photos with scenic backdrops skip recoloring entirely.
 */
export default function ProductColorImage({
  src,
  alt,
  hex,
  tint = true,
  fill,
  className,
  sizes,
  priority,
}: ProductColorImageProps) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    if (!tint) {
      setDisplaySrc(src);
      return;
    }

    let cancelled = false;
    setDisplaySrc(src);

    loadRecolored(src, hex).then((url) => {
      if (!cancelled && url) setDisplaySrc(url);
    });

    return () => {
      cancelled = true;
    };
  }, [src, hex, tint]);

  return (
    <div
      className={cn(
        "relative isolate h-full w-full bg-[#eef2ee]",
        fill && "absolute inset-0"
      )}
    >
      <div className="absolute inset-0">
        <ProductImage
          src={displaySrc}
          alt={alt}
          fill
          className={cn("object-cover", className)}
          sizes={sizes}
          priority={priority}
          unoptimized={displaySrc.startsWith("data:")}
        />
      </div>
    </div>
  );
}
