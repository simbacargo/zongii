"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/**
 * Word-by-word "rise from behind a mask" reveal for headings.
 * Words wrapped in asterisks (`the *right* fitting`) render as <em> —
 * styled by `.display-accent` as an italic Caslon accent.
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
  const words: { word: string; em: boolean }[] = [];
  let inEm = false;
  for (const raw of text.split(" ")) {
    let word = raw;
    let em = inEm;
    if (word.startsWith("*")) {
      em = true;
      inEm = true;
      word = word.slice(1);
    }
    if (word.endsWith("*")) {
      inEm = false;
      word = word.slice(0, -1);
    }
    words.push({ word, em });
  }

  return (
    <motion.span
      aria-label={words.map((w) => w.word).join(" ")}
      className={cn("display-accent inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map(({ word, em }, i) => (
        <span key={i} aria-hidden>
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
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
              {em ? <em>{word}</em> : word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
