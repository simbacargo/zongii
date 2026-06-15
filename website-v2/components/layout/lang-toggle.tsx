"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { en: "EN", sw: "SW" };

export function LangToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 p-0.5 text-xs font-semibold",
        isPending && "opacity-60",
      )}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-gold text-on-accent"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {LABELS[loc] ?? loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
