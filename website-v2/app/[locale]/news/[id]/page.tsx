import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { NEWS_ARTICLES } from "@/lib/content";
import { getArticle, getNews, isBodyLocalised, type Locale } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { ArticleBody } from "@/components/article-body";
import { NewsCard } from "@/components/news-card";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    NEWS_ARTICLES.map((a) => ({ locale, id: a.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const article = getArticle(locale as Locale, id);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/news/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("News");

  const article = getArticle(loc, id);
  if (!article) notFound();

  const related = getNews(loc)
    .filter((a) => a.id !== id)
    .slice(0, 3);

  return (
    <div className="pt-32">
      <article className="mx-auto max-w-3xl px-5 sm:px-8">
        <Link
          href="/news"
          className="stamp inline-flex items-center gap-2 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          {t("backToNews")}
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="stamp text-[10px]">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("publishedOn")} · {formatDate(article.date, loc)}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 font-serif text-lg leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        {!isBodyLocalised(loc) && (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0 text-brand-deep" />
            {t("englishOnlyNote")}
          </div>
        )}

        <div className="my-10 h-px bg-border/60" />

        <div className="text-[1.0625rem]">
          <ArticleBody content={article.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-5 pb-8 sm:px-8">
          <Reveal className="mb-10">
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              {t("related")}
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <NewsCard key={a.id} article={a} locale={loc} />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8" />
    </div>
  );
}
