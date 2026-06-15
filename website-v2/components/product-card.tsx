"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { motion } from "motion/react";
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
        <div className="group glass flex h-full flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_var(--glow-gold)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
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
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-background/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur"
                >
                  {categoryLabel(locale, cat)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-gold">
              {product.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>
      </TiltCard>
    </motion.article>
  );
}
