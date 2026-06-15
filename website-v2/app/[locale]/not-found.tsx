import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <span className="text-gradient-gold font-display text-7xl font-bold sm:text-8xl">
        404
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-gold-soft"
      >
        Back to home
      </Link>
    </div>
  );
}
