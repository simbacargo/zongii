import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { cn } from "@/lib/utils";

/**
 * Catalog-plate section header: a stamped spec label between hairline
 * rules, a Caslon headline (supports `*italic accent*` markers), and an
 * optional serif standfirst.
 */
export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "center",
  className,
}: {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={cn(
              "flex items-center gap-4",
              align === "center" && "justify-center",
            )}
          >
            <span className="h-px w-10 bg-brand/50" aria-hidden />
            <span className="stamp">{eyebrow}</span>
            <span className="h-px w-10 bg-brand/50" aria-hidden />
          </span>
        </Reveal>
      )}
      <h2 className="mt-5 font-display text-3xl leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
        <TextReveal text={heading} />
      </h2>
      {subheading && (
        <Reveal delay={0.15} className="mt-5">
          <p className="font-serif text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
            {subheading}
          </p>
        </Reveal>
      )}
    </div>
  );
}
