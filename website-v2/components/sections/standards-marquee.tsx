import { getTranslations } from "next-intl/server";
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
    <section className="border-y border-border bg-mist/60 py-5">
      <Marquee durationSec={40}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center">
            <span className="stamp mx-8 whitespace-nowrap text-[11px]">
              {item}
            </span>
            <span className="size-1.5 rotate-45 bg-amber/80" aria-hidden />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
