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

  useEffect(() => {
    setError(false);
  }, [src]);

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

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => setError(true)}
    />
  );
}
