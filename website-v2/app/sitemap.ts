import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { NEWS_ARTICLES } from "@/lib/content";

const BASE = "https://zongii.co.tz";

const STATIC_PATHS = ["", "/products", "/about", "/news", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...NEWS_ARTICLES.map((a) => `/news/${a.id}`),
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path.startsWith("/news/") ? "monthly" : "weekly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${BASE}/${l}${path}`]),
          ),
        },
      });
    }
  }

  return entries;
}
