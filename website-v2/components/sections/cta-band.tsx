import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaButton } from "@/components/cta-button";

export async function CtaBand() {
  const t = await getTranslations("Cta");

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal className="relative overflow-hidden rounded-3xl border border-gold/20 bg-card/60 px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-slate-blue/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-gold/20 blur-[100px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("subheading")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CtaButton href="/contact" variant="gold">
              {t("primary")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </CtaButton>
            <CtaButton href="/products" variant="outline">
              {t("secondary")}
            </CtaButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
