import { Link } from "@/i18n/navigation";
import { MakersSeal } from "@/components/makers-seal";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <MakersSeal size={96} disc={false} className="text-brand/60" />
      <span className="mt-6 font-display text-7xl text-foreground sm:text-8xl">
        404
      </span>
      <h1 className="mt-4 font-display text-2xl text-foreground sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 font-serif text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-[3px] bg-primary px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-deep"
      >
        Back to home
      </Link>
    </div>
  );
}
