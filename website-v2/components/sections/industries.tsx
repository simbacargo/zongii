"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { Industry } from "@/lib/content";
import { spring } from "@/lib/motion";

const subscribeNoop = () => () => {};

function IntroPanel() {
  const t = useTranslations("Industries");
  return (
    <div className="flex w-[80vw] shrink-0 flex-col justify-center sm:w-[26rem] lg:w-[30rem]">
      <span className="flex items-center gap-4">
        <span className="h-px w-10 bg-brand/50" aria-hidden />
        <span className="stamp">{t("eyebrow")}</span>
      </span>
      <h2 className="mt-5 font-display text-3xl leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
        {t("heading")}
      </h2>
      <p className="mt-5 max-w-sm font-serif text-base leading-relaxed text-muted-foreground">
        {t("subheading")}
      </p>
    </div>
  );
}

function Card({ industry, index }: { industry: Industry; index: number }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={spring.soft}
      className="plate group relative flex h-[24rem] w-[17rem] shrink-0 snap-start flex-col overflow-hidden rounded-[4px] p-2"
    >
      <div className="relative flex-1 overflow-hidden rounded-[2px]">
        <Image
          src={industry.image}
          alt={industry.label}
          fill
          sizes="272px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-xl text-paper">{industry.label}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-paper/75">
            {industry.description}
          </p>
        </div>
      </div>
      <p className="stamp stamp-ink flex items-center justify-between px-1.5 pb-1 pt-2.5 text-[9px]">
        <span>{industry.label}</span>
        <span aria-hidden>№ {String(index + 1).padStart(3, "0")}</span>
      </p>
    </motion.article>
  );
}

export function Industries({ industries }: { industries: Industry[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  // false during SSR/hydration, true after — without an effect
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      setDistance(Math.max(0, el.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [industries.length]);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  // Reduced motion: plain horizontally-scrollable row, no scroll-jacking.
  // Only after mount, so SSR always hydrates against the pinned tree.
  if (mounted && reduce) {
    return (
      <section id="industries" className="overflow-hidden py-24">
        <div className="snap-x snap-mandatory overflow-x-auto px-5 sm:px-8 [scrollbar-width:none]">
          <div className="flex w-max gap-6">
            <IntroPanel />
            {industries.map((industry, i) => (
              <Card key={industry.id} industry={industry} index={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={section}
      id="industries"
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          ref={track}
          style={{ x }}
          className="flex w-max gap-6 px-5 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2))]"
        >
          <IntroPanel />
          {industries.map((industry, i) => (
            <Card key={industry.id} industry={industry} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
