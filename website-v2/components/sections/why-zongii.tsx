import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Value } from "@/lib/content";

export async function WhyZongii({ values }: { values: Value[] }) {
  const t = await getTranslations("Why");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subheading={t("subheading")}
      />

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <RevealItem
            key={value.title}
            hover
            className="glass group relative overflow-hidden rounded-2xl p-7 transition-colors hover:border-gold/40"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gold/10 blur-2xl transition-opacity group-hover:opacity-100" />
            <div className="grid size-12 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-2xl">
              {value.icon}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">
              {value.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
