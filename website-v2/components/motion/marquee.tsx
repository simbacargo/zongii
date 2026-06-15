import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless CSS marquee. Children are rendered twice and the track scrolls
 * -50%, so the loop is continuous. Pauses on hover. No JS runtime cost.
 */
export function Marquee({
  children,
  className,
  durationSec = 32,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  durationSec?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/marquee marquee-mask relative w-full overflow-hidden",
        className,
      )}
    >
      <div
        className="animate-marquee flex w-max shrink-0"
        style={
          {
            "--marquee-duration": `${durationSec}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {children}
        <span aria-hidden className="contents">
          {children}
        </span>
      </div>
    </div>
  );
}
