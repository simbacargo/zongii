import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { StandardsMarquee } from "@/components/sections/standards-marquee";
import { StatsBar } from "@/components/sections/stats-bar";
import { Products } from "@/components/sections/products";
import { WhyZongii } from "@/components/sections/why-zongii";
import { Process } from "@/components/sections/process";
import { Industries } from "@/components/sections/industries";
import { Faq } from "@/components/sections/faq";
import { NewsTeaser } from "@/components/sections/news-teaser";
import { CtaBand } from "@/components/sections/cta-band";
import {
  getStats,
  getValues,
  getIndustries,
  type Locale,
} from "@/lib/catalog";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  return (
    <>
      <Hero />
      <StandardsMarquee />
      <StatsBar stats={getStats(loc)} />
      <Products locale={loc} />
      <WhyZongii values={getValues(loc)} />
      <Process />
      <Industries industries={getIndustries(loc)} />
      <Faq />
      <NewsTeaser locale={loc} />
      <CtaBand />
    </>
  );
}
