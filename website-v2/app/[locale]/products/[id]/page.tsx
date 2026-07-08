import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PRODUCTS, CONTACT_INFO } from "@/lib/content";
import { getProduct, getProducts, categoryLabel, type Locale } from "@/lib/catalog";
import { CtaButton, CtaAnchor } from "@/components/cta-button";
import { ProductCard } from "@/components/product-card";
import { ProductScene } from "@/components/three/product-scene";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({ locale, id: p.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = getProduct(locale as Locale, id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, type: "website" },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/products/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("ProductDetail");
  const tProducts = await getTranslations("Products");

  const product = getProduct(loc, id);
  if (!product) notFound();

  const related = getProducts(loc)
    .filter((p) => p.id !== id && p.categories.some((c) => product.categories.includes(c)))
    .slice(0, 3);

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Link
          href="/products"
          className="stamp inline-flex items-center gap-2 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToProducts")}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="plate relative aspect-square overflow-hidden rounded-[4px] lg:aspect-auto lg:min-h-[480px]">
            <ProductScene image={product.image} name={product.name} />
          </Reveal>

          <div className="flex flex-col justify-center">
            <p className="stamp flex items-center gap-4 text-[10px]">
              <span className="h-px w-8 bg-brand/50" aria-hidden />
              {product.categories.map((cat) => categoryLabel(loc, cat)).join(" · ")}
            </p>

            <h1 className="mt-4 font-display text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-lg font-serif text-[1.0625rem] leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CtaAnchor
                href={`mailto:${CONTACT_INFO.emailSales}?subject=${encodeURIComponent(`Enquiry: ${product.name}`)}`}
              >
                {tProducts("viewProduct")}
              </CtaAnchor>
              <CtaButton href="/products" variant="outline">
                {tProducts("viewCatalogue")}
              </CtaButton>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 border-t border-border pt-14">
            <Reveal className="mb-10">
              <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                {t("related")}
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={loc} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
