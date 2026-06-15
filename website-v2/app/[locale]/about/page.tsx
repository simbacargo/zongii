import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { StatsBar } from "@/components/sections/stats-bar";
import { CtaBand } from "@/components/sections/cta-band";
import { ShieldCheck } from "lucide-react";
import { getValues, getStats, type Locale } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("metaTitle") };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("About");
  const values = getValues(loc);

  return (
    <div className="pt-32">
      {/* Intro */}
      <section className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("heading")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("lead")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <p className="text-base leading-relaxed text-foreground/85">
              {t("bodyOne")}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base leading-relaxed text-foreground/85">
              {t("bodyTwo")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-16">
        <StatsBar stats={getStats(loc)} />
      </div>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="glass-strong overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {t("missionEyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("missionHeading")}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("missionBody")}
            </p>
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("valuesHeading")}
          </h2>
        </Reveal>
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <RevealItem
              key={value.title}
              hover
              className="glass rounded-2xl p-7"
            >
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

      {/* Credentials */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal className="flex flex-col items-start gap-5 rounded-2xl border border-border/60 bg-card/40 p-8 sm:flex-row sm:items-center">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              {t("credentialsHeading")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t("credentials")}
            </p>
          </div>
        </Reveal>
      </section>

      <CtaBand />
    </div>
  );
}
