import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT_INFO } from "@/lib/content";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();

  const explore = [
    { label: nav("products"), href: "/products" as const },
    { label: nav("industries"), href: "/#industries" as const },
    { label: nav("about"), href: "/about" as const },
    { label: nav("news"), href: "/news" as const },
    { label: nav("contact"), href: "/contact" as const },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border/60 bg-card/40">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gold font-display text-lg font-bold text-on-accent">
              Z
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-[0.2em]">
              Zongii
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("tagline")}
          </p>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground/80">
            {t("established")}
          </p>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("explore")}
          </h3>
          <ul className="mt-5 space-y-3">
            {explore.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("contactHeading")}
          </h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="text-foreground/80">{CONTACT_INFO.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="flex flex-col gap-0.5">
                {CONTACT_INFO.phones.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="text-foreground/80 transition-colors hover:text-gold"
                  >
                    {p}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a
                href={`mailto:${CONTACT_INFO.emailGeneral}`}
                className="text-foreground/80 transition-colors hover:text-gold"
              >
                {CONTACT_INFO.emailGeneral}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="text-foreground/80">{CONTACT_INFO.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <p>
            © {year} Zongii Mining Co. Ltd. {t("rights")}
          </p>
          <p>Mwanza · Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
