"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { CtaButton } from "@/components/cta-button";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { MakersSeal } from "@/components/makers-seal";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 lg:min-h-[92svh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-24">
        {/* Copy */}
        <motion.div
          variants={staggerContainer(0.12, 0.05)}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.p variants={staggerItem} className="stamp flex items-center gap-4">
            <span className="h-px w-10 bg-brand/50" aria-hidden />
            {t("badge")}
          </motion.p>

          <h1 className="mt-7 max-w-[13ch] font-display text-[clamp(2.75rem,6.5vw,5rem)] leading-[1.06] tracking-tight text-foreground">
            <TextReveal text={t("title")} delay={0.15} />
          </h1>

          <motion.p
            variants={staggerItem}
            className="mt-7 max-w-xl font-serif text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
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

          <motion.div variants={staggerItem} className="mt-14 max-w-xl">
            <div className="rule-brand" />
            <p className="stamp stamp-ink mt-4 text-[10px]">{t("specLine")}</p>
          </motion.div>
        </motion.div>

        {/* Plate photo + maker's mark */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-5"
        >
          <div className="plate relative overflow-hidden rounded-[4px] p-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] sm:aspect-[5/6]">
              <Image
                src="/images/site/taps-macro.jpg"
                alt={t("photoCaption")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="stamp stamp-ink flex items-center justify-between px-2 py-3 text-[9px]">
              <span>{t("photoCaption")}</span>
              <span aria-hidden>№ 001</span>
            </p>
          </div>
          <MakersSeal
            size={128}
            className="absolute -left-10 -top-10 hidden text-brand drop-shadow-sm md:block"
          />
        </motion.div>
      </div>
    </section>
  );
}
