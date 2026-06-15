"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Ambient glows — gentle infinite drift (no scroll parallax) */}
      <motion.div
        aria-hidden
        animate={{ y: [0, 28, 0], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-10 size-[34rem] rounded-full bg-slate-blue/25 blur-[120px]"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, -24, 0], x: [0, -16, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-40 top-1/3 size-[30rem] rounded-full bg-gold/15 blur-[120px]"
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <motion.div
        variants={staggerContainer(0.12, 0.05)}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-5xl px-5 pt-28 pb-20 text-center sm:px-8"
      >
        <motion.div
          variants={staggerItem}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-gold" />
          </span>
          {t("badge")}
        </motion.div>

        <h1 className="mt-8 font-display text-[clamp(2.5rem,7vw,5.25rem)] font-bold leading-[1.02] tracking-tight">
          <TextReveal text={t("titleLead")} className="block" delay={0.15} />
          <span className="mt-1 block">
            <span className="text-gradient-gold">{t("highlightA")}</span>{" "}
            {t("and")}{" "}
            <span className="text-gradient-gold">{t("highlightB")}</span>
            {t("titleTail") ? ` ${t("titleTail")}` : ""}
          </span>
        </h1>

        <motion.p
          variants={staggerItem}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          variants={staggerItem}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <CtaButton href="/products" variant="gold">
              {t("ctaPrimary")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </CtaButton>
          </Magnetic>
          <Magnetic>
            <CtaButton href="/contact" variant="outline">
              {t("ctaSecondary")}
            </CtaButton>
          </Magnetic>
        </motion.div>

        <motion.p
          variants={staggerItem}
          className="mt-12 text-xs uppercase tracking-[0.2em] text-muted-foreground/70"
        >
          {t("trustLine")}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-muted-foreground/60"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">
          {t("scroll")}
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}
