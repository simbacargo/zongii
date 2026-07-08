import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { StatsBar } from "@/components/sections/stats-bar";
import { CtaBand } from "@/components/sections/cta-band";
import { MakersSeal } from "@/components/makers-seal";
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
          <span className="flex items-center gap-4">
            <span className="h-px w-10 bg-brand/50" aria-hidden />
            <span className="stamp">{t("eyebrow")}</span>
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("heading")}
          </h1>
          <p className="mt-7 font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl">
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

        {/* The counter, photographed */}
        <Reveal className="mt-16">
          <div className="plate relative overflow-hidden rounded-[4px] p-2">
            <div className="relative aspect-[21/9] overflow-hidden rounded-[2px]">
              <Image
                src="/images/site/warehouse-warm.jpg"
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1216px"
                className="object-cover"
              />
            </div>
            <p className="stamp stamp-ink flex items-center justify-between px-2 py-3 text-[9px]">
              <span>{t("established")}</span>
              <span aria-hidden>2°31′S 32°54′E</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <div className="mt-10">
        <StatsBar stats={getStats(loc)} />
      </div>

      {/* Mission */}
      <section className="border-y border-border bg-mist/70">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
              <div>
                <span className="stamp">{t("missionEyebrow")}</span>
                <h2 className="mt-4 font-display text-3xl leading-[1.12] tracking-tight text-foreground sm:text-4xl">
                  {t("missionHeading")}
                </h2>
              </div>
              <p className="font-serif text-lg leading-relaxed text-muted-foreground">
                {t("missionBody")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            {t("valuesHeading")}
          </h2>
        </Reveal>
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <RevealItem
              key={value.title}
              hover
              className="plate rounded-[4px] p-7 transition-colors hover:border-brand/50"
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
      </section>

      {/* Credentials */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal className="plate flex flex-col items-start gap-6 rounded-[4px] p-8 sm:flex-row sm:items-center">
          <MakersSeal size={88} className="shrink-0 text-brand" />
          <div>
            <h3 className="font-display text-2xl text-foreground">
              {t("credentialsHeading")}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("credentials")}
            </p>
          </div>
        </Reveal>
      </section>

      <CtaBand />
    </div>
  );
}
