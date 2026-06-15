import {
  PRODUCTS,
  INDUSTRIES,
  VALUES,
  STATS,
  NEWS_ARTICLES,
  FILTER_CATEGORIES,
  type Product,
  type Industry,
  type Value,
  type Stat,
  type NewsArticle,
} from "./content";
import { SW } from "./content-sw";

export type Locale = "en" | "sw";

/** Display label for a product category (filter keys stay English). */
export function categoryLabel(locale: Locale, category: string): string {
  if (locale === "en") return category;
  return SW.categories[category] ?? category;
}

export function getFilterCategories(): readonly string[] {
  return FILTER_CATEGORIES;
}

export function getProducts(locale: Locale): Product[] {
  if (locale === "en") return PRODUCTS;
  return PRODUCTS.map((p) => ({
    ...p,
    name: SW.products[p.id]?.name ?? p.name,
    description: SW.products[p.id]?.description ?? p.description,
  }));
}

export function getProduct(locale: Locale, id: string): Product | undefined {
  return getProducts(locale).find((p) => p.id === id);
}

export function getIndustries(locale: Locale): Industry[] {
  if (locale === "en") return INDUSTRIES;
  return INDUSTRIES.map((i) => ({
    ...i,
    label: SW.industries[i.id]?.label ?? i.label,
    description: SW.industries[i.id]?.description ?? i.description,
  }));
}

export function getValues(locale: Locale): Value[] {
  if (locale === "en") return VALUES;
  return VALUES.map((v) => ({
    ...v,
    title: SW.values[v.title]?.title ?? v.title,
    description: SW.values[v.title]?.description ?? v.description,
  }));
}

export function getStats(locale: Locale): Stat[] {
  if (locale === "en") return STATS;
  return STATS.map((s) => ({
    ...s,
    label: SW.stats[s.label] ?? s.label,
  }));
}

/** News list — title/excerpt localised, body stays English. */
export function getNews(locale: Locale): NewsArticle[] {
  if (locale === "en") return NEWS_ARTICLES;
  return NEWS_ARTICLES.map((n) => ({
    ...n,
    title: SW.news[n.id]?.title ?? n.title,
    excerpt: SW.news[n.id]?.excerpt ?? n.excerpt,
  }));
}

export function getArticle(locale: Locale, id: string): NewsArticle | undefined {
  return getNews(locale).find((n) => n.id === id);
}

/** Whether the long-form body of an article exists in the given locale. */
export function isBodyLocalised(locale: Locale): boolean {
  return locale === "en";
}
