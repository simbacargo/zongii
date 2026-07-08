import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Value } from "@/lib/content";

export async function WhyZongii({ values }: { values: Value[] }) {
  const t = await getTranslations("Why");

  return (
    <section className="border-y border-border bg-mist/70">
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
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
              className="plate group rounded-[4px] p-7 transition-colors hover:border-brand/50"
            >
              <span className="block size-2 rotate-45 bg-amber" aria-hidden />
              <h3 className="mt-6 font-display text-xl text-foreground">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
