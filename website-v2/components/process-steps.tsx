"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

export type Step = { key: string; title: string; desc: string };

/**
 * The one honest sequence on the page — numbered like ledger entries,
 * joined by a hairline that draws with scroll.
 */
export function ProcessSteps({ steps }: { steps: Step[] }) {
  const scope = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scope,
    offset: ["start 75%", "end 65%"],
  });

  return (
    <div ref={scope} className="relative mt-16">
      {/* Connecting line (desktop) — draws with scroll progress */}
      <div className="pointer-events-none absolute inset-x-0 top-4 hidden md:block">
        <div className="mx-[12.5%] h-px bg-border" />
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-[12.5%] top-0 h-px origin-left bg-brand"
        />
      </div>

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-10 md:grid-cols-4"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.key}
            variants={staggerItem}
            className="relative flex flex-col items-center text-center md:items-start md:text-left"
          >
            <span className="stamp relative z-10 bg-background px-2 text-sm md:-ml-2">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 font-display text-xl text-foreground">
              {step.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
