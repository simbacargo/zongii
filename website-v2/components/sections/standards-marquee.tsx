import { getTranslations } from "next-intl/server";
import { BadgeCheck } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";

export async function StandardsMarquee() {
  const t = await getTranslations("Standards");

  const items = [
    "BS EN ISO 1452",
    t("certified"),
    "ASTM D1785",
    t("years"),
    "TZS 476 · TBS",
    t("guaranteed"),
    "TRA Registered",
    t("tested"),
    "Tax Administration Act 2015",
  ];

  return (
    <section className="border-y border-border/60 bg-card/30 py-6">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {t("eyebrow")}
      </p>
      <Marquee durationSec={36}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-7 flex items-center gap-2.5 whitespace-nowrap font-display text-lg font-medium text-foreground/80">
              <BadgeCheck className="size-4 text-gold" />
              {item}
            </span>
            <span className="size-1 rounded-full bg-gold/50" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
