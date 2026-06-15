import type { Transition, Variants } from "motion/react";

/* ------------------------------------------------------------------ *
 *  Zongii motion design system — single source of truth.
 *  Subtle, intentional, transform/opacity-only. Tuned for 60fps.
 * ------------------------------------------------------------------ */

/** Easing curves. `out` = decelerate (entrances); `inOut` = symmetric. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.83, 0, 0.17, 1],
} as const;

/** Durations in seconds. */
export const duration = {
  fast: 0.25,
  base: 0.5,
  slow: 0.7,
} as const;

/** Spring presets. */
export const spring = {
  /** Buttons, toggles — quick and crisp. */
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 },
  /** Cards, magnetic — smooth follow. */
  soft: { type: "spring", stiffness: 300, damping: 26, mass: 0.6 },
  /** Large/ambient — slow settle. */
  gentle: { type: "spring", stiffness: 120, damping: 20 },
} satisfies Record<string, Transition>;

/** Shared whileInView viewport config — reveal once, when ~25% visible. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

const outBase: Transition = { duration: duration.base, ease: ease.out };
const outSlow: Transition = { duration: duration.slow, ease: ease.out };

/* ----------------------------- Variants ---------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: outSlow },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: outBase },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: outBase },
};

export const blurUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: outSlow,
  },
};

/** Container that staggers its direct children (use with `staggerItem`). */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: outBase },
};

/* --------------------------- Interactions -------------------------- */

/** Hover-lift + animated shadow for cards. Pair with `whileHover="hover"`. */
export const cardHover: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -6,
    boxShadow: "0 18px 50px -20px var(--glow-gold)",
    transition: spring.soft,
  },
};

/** Button hover/press. */
export const hoverLift = { y: -2, scale: 1.03 } as const;
export const tap = { scale: 0.97 } as const;
