"use client";

import { useTranslations } from "next-intl";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import type { Stat } from "@/lib/content";

export function StatsBar({ stats }: { stats: Stat[] }) {
  const t = useTranslations("Stats");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Reveal className="glass-strong overflow-hidden rounded-3xl px-6 py-10 sm:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          {t("eyebrow")}
        </p>
        <h2 className="mx-auto mt-2 max-w-xl text-center font-display text-xl font-semibold sm:text-2xl">
          {t("heading")}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                className="text-gradient-gold font-display text-4xl font-bold sm:text-5xl"
              />
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
