import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaButton } from "@/components/cta-button";
import { MakersSeal } from "@/components/makers-seal";

export async function CtaBand() {
  const t = await getTranslations("Cta");

  return (
    <section className="border-t border-border bg-mist/60">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden px-5 py-20 text-center sm:px-8 sm:py-24">
        <MakersSeal
          size={320}
          disc={false}
          className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 text-brand/[0.13] lg:block"
        />
        <div className="relative">
          <span className="flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-brand/50" aria-hidden />
            <span className="stamp">{t("eyebrow")}</span>
            <span className="h-px w-10 bg-brand/50" aria-hidden />
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
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
