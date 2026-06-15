"use client";

import { motion } from "motion/react";
import { duration, ease } from "@/lib/motion";

/** Subtle page-transition wrapper (Framer Motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
