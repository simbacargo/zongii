"use client";

import { useTheme } from "next-themes";
import { useThemeFamily, type ThemeFamily } from "@/hooks/use-theme-family";
import { cn } from "@/lib/utils";

type Option = {
  id: ThemeFamily;
  label: string;
  mode: "light" | "dark";
  swatch: string;
};

const OPTIONS: Option[] = [
  {
    id: "deepsea",
    label: "Deep Sea",
    mode: "dark",
    swatch: "linear-gradient(135deg, #0d1f2a 45%, #d4af6a 55%)",
  },
  {
    id: "arctic",
    label: "Arctic",
    mode: "light",
    swatch: "linear-gradient(135deg, #ffffff 45%, #4f46e5 55%)",
  },
];

/** Discreet floating control to switch theme family (keeps both shipping). */
export function ThemeSwitcher() {
  const { family, setFamily, mounted } = useThemeFamily();
  const { setTheme } = useTheme();

  function choose(o: Option) {
    setFamily(o.id);
    setTheme(o.mode);
  }

  return (
    <div className="glass-strong fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]">
      {OPTIONS.map((o) => {
        const active = mounted && family === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => choose(o)}
            title={`${o.label} theme`}
            aria-label={`Switch to ${o.label} theme`}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className="size-4 rounded-full ring-1 ring-border"
              style={{ backgroundImage: o.swatch }}
            />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
