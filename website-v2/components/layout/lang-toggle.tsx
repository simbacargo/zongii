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
        "inline-flex items-center rounded-[3px] border border-border p-0.5 font-mono text-[11px] font-medium tracking-wider",
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
              "rounded-[2px] px-2.5 py-1 transition-colors",
              active
                ? "bg-primary text-primary-foreground"
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
