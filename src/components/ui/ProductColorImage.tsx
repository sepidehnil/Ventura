"use client";

import { useEffect, useRef, useState } from "react";
import ProductImage from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

interface ProductColorImageProps {
  src: string;
  alt: string;
  /** Target colorway hex — product midtones match this color exactly */
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

function chroma({ r, g, b }: RGB) {
  return Math.max(r, g, b) - Math.min(r, g, b);
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

function isContactShadow(pixel: RGB, bg: RGB) {
  const L = luminance(pixel);
  const bgL = luminance(bg);
  const c = chroma(pixel);
  const d = rgbDistance(pixel, bg);
  // Soft studio / floor shadows are desaturated and only a bit darker than the backdrop
  return c < 30 && L < bgL - 1 && L > bgL * 0.52 && d < 140;
}

function buildBackgroundMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bg: RGB,
  tolerance: number
): Uint8Array {
  const mask = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const enqueue = (idx: number) => {
    mask[idx] = 1;
    queue[tail++] = idx;
  };

  const tryEnqueueBg = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * 4;
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
    if (rgbDistance(pixel, bg) > tolerance) return;
    enqueue(idx);
  };

  for (let x = 0; x < width; x++) {
    tryEnqueueBg(x, 0);
    tryEnqueueBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueueBg(0, y);
    tryEnqueueBg(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueueBg(x + 1, y);
    tryEnqueueBg(x - 1, y);
    tryEnqueueBg(x, y + 1);
    tryEnqueueBg(x, y - 1);
  }

  // Second pass: grow into soft contact shadows connected to the backdrop
  // so floor shadows stay neutral (not dyed with the colorway).
  head = 0;
  // Re-seed queue with every current background pixel
  tail = 0;
  for (let idx = 0; idx < mask.length; idx++) {
    if (mask[idx]) queue[tail++] = idx;
  }

  const tryEnqueueShadow = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * 4;
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
    if (!isContactShadow(pixel, bg)) return;
    enqueue(idx);
  };

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueueShadow(x + 1, y);
    tryEnqueueShadow(x - 1, y);
    tryEnqueueShadow(x, y + 1);
    tryEnqueueShadow(x, y - 1);
  }

  return mask;
}

/**
 * Lifestyle / scenic shots fail the studio-corner check. For dark products
 * (matte bottles, black gear) flood from the image center through dark
 * low-chroma pixels and recolor only that body.
 */
function buildDarkProductMask(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8Array | null {
  const isDarkBody = (pixel: RGB) =>
    chroma(pixel) < 22 && luminance(pixel) < 125;

  const isSoftHighlight = (pixel: RGB) => {
    const L = luminance(pixel);
    return chroma(pixel) < 22 && L >= 125 && L < 175;
  };

  let centerLuma = 0;
  let centerCount = 0;
  const x0 = Math.floor(width * 0.35);
  const x1 = Math.floor(width * 0.65);
  const y0 = Math.floor(height * 0.25);
  const y1 = Math.floor(height * 0.75);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      centerLuma += luminance({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
      centerCount++;
    }
  }
  if (!centerCount || centerLuma / centerCount > 100) {
    return null;
  }

  const mask = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * 4;
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
    if (!isDarkBody(pixel)) return;
    mask[idx] = 1;
    queue[tail++] = idx;
  };

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      tryEnqueue(x, y);
    }
  }

  if (tail < width * height * 0.01) {
    return null;
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  // Grow into matte speculars that touch the body (keep rock/plant out)
  head = 0;
  const highlightQueue = new Int32Array(width * height);
  let hTail = 0;
  for (let idx = 0; idx < mask.length; idx++) {
    if (mask[idx]) highlightQueue[hTail++] = idx;
  }
  const tryEnqueueHighlight = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * 4;
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
    if (!isSoftHighlight(pixel)) return;
    mask[idx] = 1;
    highlightQueue[hTail++] = idx;
  };
  while (head < hTail) {
    const idx = highlightQueue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    tryEnqueueHighlight(x + 1, y);
    tryEnqueueHighlight(x - 1, y);
    tryEnqueueHighlight(x, y + 1);
    tryEnqueueHighlight(x, y - 1);
  }

  return mask;
}

function paintIndices(
  d: Uint8ClampedArray,
  indices: number[],
  lumaSum: number,
  target: RGB
) {
  const avgLuma = lumaSum / indices.length;
  const { h, s, l: targetL } = rgbToHsl(target);

  for (const i of indices) {
    const pixel = { r: d[i], g: d[i + 1], b: d[i + 2] };
    const delta = (luminance(pixel) - avgLuma) / 255;
    const l = Math.max(0.04, Math.min(0.96, targetL + delta * 0.9));
    const next = hslToRgb(h, s, l);
    d[i] = next.r;
    d[i + 1] = next.g;
    d[i + 2] = next.b;
  }
}

/**
 * Paint the product so its average area equals the swatch hex exactly.
 * Shading comes from the photo (relative luminance); dye comes only from `hex`.
 */
function recolorProductPixels(source: ImageData, hex: string): ImageData | null {
  const { width, height, data } = source;
  const corners = sampleCorners(data, width, height);
  const bg: RGB = {
    r: Math.round(corners.reduce((s, c) => s + c.r, 0) / corners.length),
    g: Math.round(corners.reduce((s, c) => s + c.g, 0) / corners.length),
    b: Math.round(corners.reduce((s, c) => s + c.b, 0) / corners.length),
  };

  const target = hexToRgb(hex);
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;
  const indices: number[] = [];
  let lumaSum = 0;

  const studioOk =
    Math.max(...corners.map((c) => rgbDistance(c, bg))) <= 55 &&
    luminance(bg) >= 170;

  if (studioOk) {
    const bgMask = buildBackgroundMask(data, width, height, bg, 36);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (bgMask[idx]) continue;
        const i = idx * 4;
        const pixel = { r: d[i], g: d[i + 1], b: d[i + 2] };
        if (isContactShadow(pixel, bg)) continue;
        if (chroma(pixel) < 18 && luminance(pixel) > 155) continue;

        indices.push(i);
        lumaSum += Math.max(luminance(pixel), 1);
      }
    }
  } else {
    // Lifestyle shot (e.g. Thermo Trail Bottle) — recolor dark product body only
    const productMask = buildDarkProductMask(data, width, height);
    if (!productMask) return null;

    for (let idx = 0; idx < productMask.length; idx++) {
      if (!productMask[idx]) continue;
      const i = idx * 4;
      const pixel = { r: d[i], g: d[i + 1], b: d[i + 2] };
      indices.push(i);
      lumaSum += Math.max(luminance(pixel), 1);
    }
  }

  if (indices.length < width * height * 0.008) {
    return null;
  }

  paintIndices(d, indices, lumaSum, target);
  return out;
}

const CACHE_VERSION = "hex-v5";
const recolorCache = new Map<string, string>();

function loadRecolored(src: string, hex: string): Promise<string | null> {
  const key = `${CACHE_VERSION}|${src}|${hex.toLowerCase()}`;
  const cached = recolorCache.get(key);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          resolve(null);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const recolored = recolorProductPixels(
          ctx.getImageData(0, 0, w, h),
          hex
        );
        if (!recolored) {
          resolve(null);
          return;
        }
        ctx.putImageData(recolored, 0, 0);
        const url = canvas.toDataURL("image/png");
        recolorCache.set(key, url);
        resolve(url);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

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
  const prevSrcRef = useRef(src);
  const requestId = useRef(0);

  useEffect(() => {
    if (!tint) {
      setDisplaySrc(src);
      prevSrcRef.current = src;
      return;
    }

    const srcChanged = prevSrcRef.current !== src;
    prevSrcRef.current = src;
    if (srcChanged) setDisplaySrc(src);

    const id = ++requestId.current;
    loadRecolored(src, hex).then((url) => {
      if (id !== requestId.current) return;
      if (url) setDisplaySrc(url);
    });
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
