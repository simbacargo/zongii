import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact-form";
import { CONTACT_INFO } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return { title: t("metaTitle") };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8">
      <Reveal className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
          {t("eyebrow")}
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t("subheading")}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-2">
          <div className="glass h-full rounded-3xl p-8">
            <h2 className="font-display text-xl font-semibold">
              {t("infoTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("infoBody")}
            </p>

            <ul className="mt-8 space-y-6 text-sm">
              <InfoRow icon={<MapPin className="size-4" />} label={t("address")}>
                {CONTACT_INFO.address}
              </InfoRow>
              <InfoRow icon={<Phone className="size-4" />} label={t("phone")}>
                <div className="flex flex-col gap-1">
                  {CONTACT_INFO.phones.map((p) => (
                    <a
                      key={p}
                      href={`tel:${p.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-gold"
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </InfoRow>
              <InfoRow icon={<Mail className="size-4" />} label={t("email")}>
                <div className="flex flex-col gap-1">
                  <a
                    href={`mailto:${CONTACT_INFO.emailGeneral}`}
                    className="transition-colors hover:text-gold"
                  >
                    {CONTACT_INFO.emailGeneral}
                  </a>
                  <a
                    href={`mailto:${CONTACT_INFO.emailSales}`}
                    className="text-muted-foreground transition-colors hover:text-gold"
                  >
                    {t("sales")}: {CONTACT_INFO.emailSales}
                  </a>
                </div>
              </InfoRow>
              <InfoRow icon={<Clock className="size-4" />} label={t("hours")}>
                {CONTACT_INFO.hours}
              </InfoRow>
            </ul>

            <div className="mt-8 border-t border-border/60 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("follow")}
              </p>
              <div className="mt-4 flex gap-3">
                {[
                  { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" },
                  { label: "WhatsApp", path: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-xl border border-border/60 bg-secondary/40 text-foreground/70 transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 font-medium text-foreground/90">{children}</div>
      </div>
    </li>
  );
}
