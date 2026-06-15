export function formatDate(date: string, locale: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "sw" ? "sw-TZ" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
