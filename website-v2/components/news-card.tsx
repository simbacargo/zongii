"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import type { NewsArticle } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { spring } from "@/lib/motion";

export function NewsCard({
  article,
  locale,
}: {
  article: NewsArticle;
  locale: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 18px 50px -20px var(--glow-gold)" }}
      transition={spring.soft}
      className="h-full rounded-2xl"
    >
      <Link
        href={`/news/${article.id}`}
        className="glass group flex h-full flex-col rounded-2xl p-6 transition-colors hover:border-gold/40"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(article.date, locale)}
          </span>
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-gold">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
