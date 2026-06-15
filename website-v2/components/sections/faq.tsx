import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";

const KEYS = ["range", "delivery", "quality", "bulk", "quote", "hours"];

export async function Faq() {
  const t = await getTranslations("Faq");
  const items = KEYS.map((key) => ({
    key,
    q: t(`items.${key}.q`),
    a: t(`items.${key}.a`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            {t("subheading")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion multiple={false} className="glass rounded-2xl px-5 sm:px-7">
            {items.map((it) => (
              <AccordionItem key={it.key} value={it.key}>
                <AccordionTrigger className="py-5 font-display text-base font-semibold sm:text-lg">
                  {it.q}
                </AccordionTrigger>
                <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                  {it.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
