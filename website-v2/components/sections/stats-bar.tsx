"use client";

import { useTranslations } from "next-intl";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import type { Stat } from "@/lib/content";

/** Ledger row — Caslon numerals over stamped labels, divided by hairlines. */
export function StatsBar({ stats }: { stats: Stat[] }) {
  const t = useTranslations("Stats");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <Reveal>
        <p className="stamp text-center text-[10px]">{t("eyebrow")}</p>
        <div className="mt-8 grid grid-cols-2 divide-border border-y border-border lg:grid-cols-4 lg:divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-4xl text-foreground tabular-nums sm:text-5xl"
              />
              <p className="stamp stamp-ink mt-3 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
