"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/content";
import type { Locale } from "@/lib/catalog";
import { categoryLabel } from "@/lib/catalog";
import { TiltCard } from "@/components/motion/tilt-card";
import { duration, ease } from "@/lib/motion";

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      <TiltCard className="h-full">
        <Link
          href={`/products/${product.id}`}
          className="plate group flex h-full flex-col overflow-hidden rounded-[4px] p-2 transition-colors duration-300 hover:border-brand/50"
        >
          <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-[2px] bg-mist">
            {imgError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/60">
                <ImageOff className="size-8" />
                <span className="px-4 text-center text-xs font-medium">
                  {product.name}
                </span>
              </div>
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                onError={() => setImgError(true)}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100" />
          </div>

          <div className="flex flex-1 flex-col p-4 pt-4">
            <p className="stamp stamp-ink text-[9px]">
              {product.categories
                .slice(0, 2)
                .map((cat) => categoryLabel(locale, cat))
                .join(" · ")}
            </p>
            <h3 className="mt-2.5 font-display text-xl text-foreground transition-colors group-hover:text-brand-deep">
              {product.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        </Link>
      </TiltCard>
    </motion.article>
  );
}
