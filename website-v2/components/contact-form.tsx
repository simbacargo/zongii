"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema } from "@/lib/contact-schema";
import { duration } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success";
type Field = "name" | "company" | "phone" | "email" | "message";

const empty = { name: "", company: "", phone: "", email: "", message: "" };

export function ContactForm() {
  const t = useTranslations("Contact");
  const [form, setForm] = useState(empty);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [scope, animate] = useAnimate();

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const errorMessage: Record<string, string> = {
    name: t("validName"),
    phone: t("validPhone"),
    email: t("validEmail"),
    message: t("validMessage"),
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse({ ...form, website });
    if (!result.success) {
      const fieldErrors: Partial<Record<Field, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as Field;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = errorMessage[issue.message] ?? issue.message;
        }
      }
      setErrors(fieldErrors);
      if (scope.current) {
        animate(
          scope.current,
          { x: [0, -8, 8, -6, 6, 0] },
          { duration: 0.4, ease: "easeInOut" },
        );
      }
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("idle");
      toast.error(t("errorTitle"), { description: t("errorBody") });
    }
  }

  function reset() {
    setForm(empty);
    setErrors({});
    setStatus("idle");
  }

  return (
    <div className="plate rounded-[4px] p-6 sm:p-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center"
          >
            <div className="grid size-16 place-items-center rounded-full border border-brand/40 text-brand-deep">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="mt-5 font-display text-2xl text-foreground">
              {t("successTitle")}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("successBody")}
            </p>
            <button
              onClick={reset}
              className="mt-6 text-sm font-semibold text-brand-deep underline-offset-4 hover:underline"
            >
              {t("sendAnother")}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={scope}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("labelName")} error={errors.name} required>
                <Input
                  value={form.name}
                  onChange={set("name")}
                  placeholder={t("placeholderName")}
                  aria-invalid={!!errors.name}
                />
              </Field>
              <Field label={`${t("labelCompany")} (${t("optional")})`}>
                <Input
                  value={form.company}
                  onChange={set("company")}
                  placeholder={t("placeholderCompany")}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("labelPhone")} error={errors.phone} required>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder={t("placeholderPhone")}
                  aria-invalid={!!errors.phone}
                />
              </Field>
              <Field label={`${t("labelEmail")} (${t("optional")})`} error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder={t("placeholderEmail")}
                  aria-invalid={!!errors.email}
                />
              </Field>
            </div>

            <Field label={t("labelMessage")} error={errors.message} required>
              <Textarea
                rows={5}
                value={form.message}
                onChange={set("message")}
                placeholder={t("placeholderMessage")}
                aria-invalid={!!errors.message}
                className="resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[3px] bg-primary py-3.5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-deep disabled:opacity-70"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                <>
                  {t("submit")}
                  <Send className="size-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-brand-deep">*</span>}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.fast }}
            className={cn("mt-1.5 text-xs text-destructive")}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
