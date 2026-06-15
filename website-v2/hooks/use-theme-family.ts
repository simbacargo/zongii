"use client";

import { useEffect, useState } from "react";

export type ThemeFamily = "deepsea" | "arctic";
export const THEME_FAMILIES: ThemeFamily[] = ["deepsea", "arctic"];
const STORAGE_KEY = "theme-family";

/** Inline script (no FOUC) — sets data-theme before first paint. Default: arctic. */
export const themeFamilyScript = `(function(){try{var f=localStorage.getItem('${STORAGE_KEY}');if(f!=='arctic'&&f!=='deepsea')f='arctic';document.documentElement.setAttribute('data-theme',f);}catch(e){document.documentElement.setAttribute('data-theme','arctic');}})();`;

/**
 * Reads/writes the active theme family (separate axis from light/dark).
 * `mounted` guards against hydration mismatch in UI that reflects the family.
 */
export function useThemeFamily() {
  const [family, setFamilyState] = useState<ThemeFamily>("arctic");
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- read persisted family after mount */
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeFamily | null;
      if (stored === "arctic" || stored === "deepsea") setFamilyState(stored);
    } catch {
      /* ignore */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function setFamily(next: ThemeFamily) {
    setFamilyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", next);
  }

  return { family, setFamily, mounted };
}
