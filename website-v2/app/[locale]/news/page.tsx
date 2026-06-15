import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { NewsCard } from "@/components/news-card";
import { getNews, type Locale } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tn = await getTranslations({ locale, namespace: "News" });
  return { title: (await getTranslations({ locale, namespace: "NewsPage" }))("metaTitle"), description: tn("subheading") };
}

export default async function NewsPage({ params }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("News");
  const articles = getNews(loc);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subheading={t("subheading")}
      />
      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <RevealItem key={article.id} className="h-full">
            <NewsCard article={article} locale={loc} />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
