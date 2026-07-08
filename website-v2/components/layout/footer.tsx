import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT_INFO } from "@/lib/content";
import { MakersSeal } from "@/components/makers-seal";

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
    <footer className="relative mt-auto bg-brand-deep text-paper">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <div className="flex items-start justify-between gap-6 sm:justify-start sm:gap-10">
              <div>
                <p className="font-display text-2xl tracking-[0.14em]">ZONGII</p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/65">
                  {t("tagline")}
                </p>
                <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-brand-soft">
                  {t("established")}
                </p>
              </div>
              <MakersSeal size={104} disc={false} className="shrink-0 text-brand-soft/90" />
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-paper/50">{t("explore")}</h3>
            <ul className="mt-5 space-y-3">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/75 transition-colors hover:text-brand-soft"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-paper/50">
              {t("contactHeading")}
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex flex-col gap-1 border-b border-paper/10 pb-4">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-paper/40">VISIT</span>
                <span className="text-paper/75">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex flex-col gap-1 border-b border-paper/10 pb-4">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-paper/40">CALL</span>
                <span className="flex flex-wrap gap-x-5 gap-y-0.5">
                  {CONTACT_INFO.phones.map((p) => (
                    <a
                      key={p}
                      href={`tel:${p.replace(/\s/g, "")}`}
                      className="text-paper/75 transition-colors hover:text-brand-soft"
                    >
                      {p}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex flex-col gap-1 border-b border-paper/10 pb-4">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-paper/40">WRITE</span>
                <a
                  href={`mailto:${CONTACT_INFO.emailGeneral}`}
                  className="text-paper/75 transition-colors hover:text-brand-soft"
                >
                  {CONTACT_INFO.emailGeneral}
                </a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-paper/40">HOURS</span>
                <span className="text-paper/75">{CONTACT_INFO.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-paper/10 py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/40 sm:flex-row">
          <p>
            © {year} Zongii Mining Co. Ltd. {t("rights")}
          </p>
          <p>2°31′S 32°54′E — Mwanza, Tanzania</p>
        </div>
      </div>
    </footer>
  );
}
