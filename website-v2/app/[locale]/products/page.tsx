import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { ProductExplorer } from "@/components/product-explorer";
import {
  getProducts,
  getFilterCategories,
  type Locale,
} from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductsPage" });
  return { title: t("metaTitle") };
}

export default async function ProductsPage({
  params,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("ProductsPage");

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subheading={t("subheading")}
      />
      <div className="mt-14">
        <ProductExplorer
          products={getProducts(loc)}
          categories={getFilterCategories()}
          locale={loc}
        />
      </div>
    </div>
  );
}
