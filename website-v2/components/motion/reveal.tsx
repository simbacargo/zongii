"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  duration,
  ease,
  spring,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

/** Single scroll-into-view reveal (fade + rise). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: viewportOnce.amount }}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.slow, delay, ease: ease.out },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — direct `RevealItem` children animate in sequence. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

/** Item inside a `RevealGroup`. Pass `hover` to add card-lift on hover. */
export function RevealItem({
  children,
  className,
  y = 20,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={className}
      whileHover={hover ? "hover" : undefined}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.base, ease: ease.out },
        },
        ...(hover && {
          hover: {
            y: -6,
            boxShadow: "0 18px 50px -20px var(--glow-gold)",
            transition: spring.soft,
          },
        }),
      }}
    >
      {children}
    </motion.div>
  );
}
