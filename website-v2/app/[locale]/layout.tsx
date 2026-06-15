import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { clashDisplay, inter, playfair } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Toaster } from "@/components/ui/sonner";
import { OrganizationJsonLd } from "@/components/json-ld";
import { Analytics } from "@/components/analytics";
import { themeFamilyScript } from "@/hooks/use-theme-family";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL("https://zongii.co.tz"),
    title: {
      default: `${t("siteName")} | ${t("homeTitle")}`,
      template: `%s | ${t("siteName")}`,
    },
    description: t("description"),
    icons: { icon: "/favicon.ico" },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: `${t("siteName")} | ${t("homeTitle")}`,
      description: t("description"),
      locale,
    },
    alternates: {
      languages: { en: "/en", sw: "/sw" },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${clashDisplay.variable} ${inter.variable} ${playfair.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-mesh">
        <script
          dangerouslySetInnerHTML={{ __html: themeFamilyScript }}
        />
        <Providers>
          <NextIntlClientProvider>
            <ScrollProgress />
            <ThemeSwitcher />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-center" />
          </NextIntlClientProvider>
        </Providers>
        <OrganizationJsonLd locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
