"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LangToggle } from "./lang-toggle";
import { CtaButton } from "@/components/cta-button";
import { cn } from "@/lib/utils";

function useNavLinks() {
  const t = useTranslations("Nav");
  return [
    { label: t("products"), href: "/products" as const },
    { label: t("industries"), href: "/#industries" as const },
    { label: t("about"), href: "/about" as const },
    { label: t("news"), href: "/news" as const },
  ];
}

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gold font-display text-lg font-bold text-on-accent shadow-[0_8px_24px_-8px_var(--glow-gold)] transition-transform group-hover:scale-105">
        Z
      </span>
      <span className="font-display text-lg font-bold uppercase tracking-[0.2em] text-foreground">
        Zongii
      </span>
    </Link>
  );
}

export function Navbar() {
  const t = useTranslations("Nav");
  const links = useNavLinks();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  const isActive = (href: string) =>
    href !== "/" && !href.includes("#") && pathname.startsWith(href);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-border/60 py-2.5"
          : "border-b border-transparent py-4",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark />

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                isActive(link.href) && "text-foreground",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gold"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle />
          <ThemeToggle />
          <CtaButton href="/contact" size="md">
            {t("getQuote")}
          </CtaButton>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Menu"
              className="grid size-9 place-items-center rounded-full border border-border/60 text-foreground"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="glass-strong w-80 border-border/60"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col gap-1 px-6 pt-14">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-border/40 py-4 font-display text-2xl font-semibold text-foreground/90 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-6 flex items-center justify-between">
                  <LangToggle />
                </div>
                <div onClick={() => setOpen(false)}>
                  <CtaButton href="/contact" className="mt-6 w-full">
                    {t("getQuote")}
                  </CtaButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
