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
      className="h-full rounded-[4px]"
    >
      <Link
        href={`/news/${article.id}`}
        className="plate group flex h-full flex-col rounded-[4px] p-6 transition-colors hover:border-brand/50"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="stamp text-[10px]">{article.category}</span>
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            {formatDate(article.date, locale)}
          </span>
        </div>
        <h3 className="mt-4 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-brand-deep">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-deep">
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
