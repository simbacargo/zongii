import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ProductExplorer } from "@/components/product-explorer";
import { CtaButton } from "@/components/cta-button";
import {
  getProducts,
  getFilterCategories,
  type Locale,
} from "@/lib/catalog";

export async function Products({ locale }: { locale: Locale }) {
  const t = await getTranslations("Products");
  const products = getProducts(locale);
  const categories = getFilterCategories();

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow={t("eyebrow")}
        heading={t("heading")}
        subheading={t("subheading")}
      />
      <div className="mt-12">
        <ProductExplorer
          products={products}
          categories={categories}
          locale={locale}
        />
      </div>
      <div className="mt-12 flex justify-center">
        <CtaButton href="/products" variant="outline">
          {t("viewCatalogue")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </CtaButton>
      </div>
    </section>
  );
}
