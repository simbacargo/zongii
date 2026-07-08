"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { spring, hoverLift, tap as tapToken } from "@/lib/motion";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "outline" | "foam";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[3px] font-mono font-medium uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  gold: "bg-primary text-primary-foreground hover:bg-brand-deep hover:text-paper",
  outline:
    "border border-ink/25 text-foreground hover:border-brand hover:text-brand-deep",
  foam: "bg-mist text-foreground hover:bg-brand/15",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-[11px] tracking-[0.14em]",
  lg: "px-7 py-3.5 text-xs tracking-[0.16em]",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

const hover = hoverLift;
const tap = tapToken;
const transition = spring.snappy;

export function CtaButton({
  children,
  variant = "gold",
  size = "lg",
  className,
  href,
  ...rest
}: CommonProps & { href: ComponentProps<typeof Link>["href"] }) {
  return (
    <motion.div className="inline-block" whileHover={hover} whileTap={tap} transition={transition}>
      <Link
        href={href}
        className={cn(base, variants[variant], sizes[size], className)}
        {...rest}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function CtaAnchor({
  children,
  variant = "gold",
  size = "lg",
  className,
  ...rest
}: CommonProps & Omit<HTMLMotionProps<"a">, "children" | "className">) {
  return (
    <motion.a
      whileHover={hover}
      whileTap={tap}
      transition={transition}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </motion.a>
  );
}

/** For scroll-to-section buttons on the same page. */
export function CtaButtonEl({
  children,
  variant = "gold",
  size = "lg",
  className,
  ...rest
}: CommonProps & Omit<HTMLMotionProps<"button">, "children" | "className">) {
  return (
    <motion.button
      whileHover={hover}
      whileTap={tap}
      transition={transition}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
