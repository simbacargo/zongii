"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { tap } from "@/lib/motion";
import type { Product } from "@/lib/content";
import type { Locale } from "@/lib/catalog";
import { categoryLabel } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

export function ProductExplorer({
  products,
  categories,
  locale,
}: {
  products: Product[];
  categories: readonly string[];
  locale: Locale;
}) {
  const t = useTranslations("Products");
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? products
        : products.filter((p) => p.categories.includes(active)),
    [active, products],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <motion.button
              key={cat}
              type="button"
              whileTap={tap}
              onClick={() => setActive(cat)}
              className={cn(
                "relative rounded-[3px] border px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-colors",
                isActive
                  ? "border-ink text-primary-foreground"
                  : "border-border text-foreground/70 hover:border-brand hover:text-brand-deep",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-10 rounded-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {cat === "All" ? t("filterAll") : categoryLabel(locale, cat)}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        layout
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
