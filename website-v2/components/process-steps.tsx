"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import {
  MessageSquare,
  FileText,
  Truck,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";

const ICONS: Record<string, LucideIcon> = {
  enquire: MessageSquare,
  quote: FileText,
  supply: Truck,
  support: LifeBuoy,
};

export type Step = { key: string; title: string; desc: string };

export function ProcessSteps({ steps }: { steps: Step[] }) {
  const scope = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scope,
    offset: ["start 75%", "end 65%"],
  });

  return (
    <div ref={scope} className="relative mt-16">
      {/* Connecting line (desktop) — draws with scroll progress */}
      <div className="pointer-events-none absolute inset-x-0 top-7 hidden md:block">
        <div className="mx-[12.5%] h-px bg-border/70" />
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-[12.5%] top-0 h-px origin-left bg-gold"
        />
      </div>

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-10 md:grid-cols-4"
      >
        {steps.map((step, i) => {
          const Icon = ICONS[step.key] ?? MessageSquare;
          return (
            <motion.div
              key={step.key}
              variants={staggerItem}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="relative z-10 grid size-14 place-items-center rounded-full border border-gold/30 bg-background text-gold shadow-[0_0_0_6px_var(--background)]">
                <Icon className="size-6" />
                <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-gold font-display text-xs font-bold text-on-accent">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
