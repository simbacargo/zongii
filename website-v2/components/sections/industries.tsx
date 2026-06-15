"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { Industry } from "@/lib/content";
import { spring } from "@/lib/motion";

function IntroPanel() {
  const t = useTranslations("Industries");
  return (
    <div className="flex w-[80vw] shrink-0 flex-col justify-center sm:w-[26rem] lg:w-[30rem]">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
        {t("eyebrow")}
      </span>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {t("heading")}
      </h2>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
        {t("subheading")}
      </p>
    </div>
  );
}

function Card({ industry }: { industry: Industry }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={spring.soft}
      className="group relative flex h-[24rem] w-[17rem] shrink-0 snap-start overflow-hidden rounded-3xl border border-border/60"
    >
      <Image
        src={industry.image}
        alt={industry.label}
        fill
        sizes="272px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
      <div className="relative mt-auto p-6">
        <h3 className="font-display text-xl font-semibold text-white">
          {industry.label}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          {industry.description}
        </p>
      </div>
    </motion.article>
  );
}

export function Industries({ industries }: { industries: Industry[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
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
  if (reduce) {
    return (
      <section id="industries" className="overflow-hidden py-24">
        <div className="snap-x snap-mandatory overflow-x-auto px-5 sm:px-8 [scrollbar-width:none]">
          <div className="flex w-max gap-6">
            <IntroPanel />
            {industries.map((industry) => (
              <Card key={industry.id} industry={industry} />
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
          {industries.map((industry) => (
            <Card key={industry.id} industry={industry} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
