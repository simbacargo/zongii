import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { ProcessSteps, type Step } from "@/components/process-steps";

export async function Process() {
  const t = await getTranslations("Process");

  const keys = ["enquire", "quote", "supply", "support"];
  const steps: Step[] = keys.map((key) => ({
    key,
    title: t(`steps.${key}.title`),
    desc: t(`steps.${key}.desc`),
  }));

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subheading={t("subheading")}
      />
      <ProcessSteps steps={steps} />
    </section>
  );
}
