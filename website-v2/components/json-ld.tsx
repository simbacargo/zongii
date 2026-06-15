import { CONTACT_INFO } from "@/lib/content";

const BASE = "https://zongii.co.tz";

export function OrganizationJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Zongii Mining Co. Ltd",
    url: `${BASE}/${locale}`,
    description:
      "Tanzania's trusted supplier of mining, plumbing, building and construction supplies.",
    foundingDate: "2002",
    email: CONTACT_INFO.emailGeneral,
    telephone: CONTACT_INFO.phones[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pamba Road, P.O. Box 6419",
      addressLocality: "Mwanza",
      addressCountry: "TZ",
    },
    areaServed: "Tanzania",
    contactPoint: CONTACT_INFO.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      contactType: "sales",
      areaServed: "TZ",
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
