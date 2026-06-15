"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

type CounterProps = {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

/** Scroll-triggered count-up (Motion). Renders via a MotionValue — no re-renders. */
export function Counter({
  value,
  suffix = "",
  className,
  duration = 1.8,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  const count = useMotionValue(0);
  const text = useTransform(
    count,
    (v) => Math.round(v).toLocaleString() + suffix,
  );

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, duration, reduce, count]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
