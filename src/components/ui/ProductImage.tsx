"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export default function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  unoptimized,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    setError(false);
    setRetries(0);
  }, [src]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-sand to-accent/20",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={alt}
      />
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-sand to-accent/20",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={alt}
      >
        <span className="text-2xl font-bold text-charcoal/30">Ventura</span>
      </div>
    );
  }

  // Local public assets: skip the optimizer on first paint so images aren't
  // blank while /_next/image is cold / still generating variants.
  const isLocal = src.startsWith("/images/") || src.startsWith("data:");

  return (
    <Image
      key={`${src}-${retries}`}
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized || isLocal}
      onError={() => {
        if (retries < 1) {
          setRetries((n) => n + 1);
          return;
        }
        setError(true);
      }}
    />
  );
}
