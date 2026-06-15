"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/**
 * Word-by-word "rise from behind a mask" reveal for headings.
 * Renders inline spans; pass it inside a heading element.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      aria-label={text}
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%" },
              show: {
                y: 0,
                transition: { duration: 0.65, ease: ease.out },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
