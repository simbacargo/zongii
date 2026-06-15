"use client";

import { duration, ease, viewportOnce } from "@/lib/motion";

/**
 * Returns Motion props for a scroll-into-view fade+rise reveal — spread onto
 * any `motion` element so you don't need a wrapper component.
 *
 * @example
 * <motion.div {...useReveal({ delay: 0.1 })}>…</motion.div>
 */
export function useReveal(opts?: {
  delay?: number;
  amount?: number;
  once?: boolean;
  y?: number;
}) {
  const {
    delay = 0,
    amount = viewportOnce.amount,
    once = true,
    y = 24,
  } = opts ?? {};

  return {
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount },
    variants: {
      hidden: { opacity: 0, y },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: duration.slow, ease: ease.out, delay },
      },
    },
  };
}
