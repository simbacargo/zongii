import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CtaButton } from "@/components/cta-button";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { NewsCard } from "@/components/news-card";
import { getNews, type Locale } from "@/lib/catalog";

export async function NewsTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations("News");
  const articles = getNews(locale).slice(0, 3);

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          align="left"
          className="mx-0"
        />
        <div className="hidden sm:block">
          <CtaButton href="/news" variant="outline" size="md">
            {t("viewAll")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </CtaButton>
        </div>
      </div>

      <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
        {articles.map((article) => (
          <RevealItem key={article.id} className="h-full">
            <NewsCard article={article} locale={locale} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
