import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Engraved maker's mark — the stamp a supplier leaves on its fittings.
 * Ring text turns slowly (CSS `animate-seal`; reduced-motion kills it),
 * the centre stays still. Colour comes from `currentColor`.
 */
export function MakersSeal({
  size = 128,
  className,
  disc = true,
}: {
  size?: number;
  className?: string;
  /** Opaque backing disc — keep for overlaps, drop for watermarks/dark grounds. */
  disc?: boolean;
}) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("select-none", className)}
      aria-hidden
    >
      <defs>
        <path
          id={`${id}-arc`}
          d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0"
          fill="none"
        />
      </defs>

      {/* opaque disc so the mark can sit over photos and captions */}
      {disc && <circle cx="60" cy="60" r="59.5" fill="var(--background)" />}

      {/* knurled outer edge */}
      <circle cx="60" cy="60" r="58.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.85" />
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="1 2.2"
        opacity="0.55"
      />

      {/* turning ring text */}
      <g
        className="animate-seal"
        style={{ transformOrigin: "60px 60px", transformBox: "view-box" }}
      >
        <text
          fontSize="8"
          letterSpacing="2.6"
          fill="currentColor"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <textPath href={`#${id}-arc`}>
            ZONGII · MWANZA · TANZANIA · SINCE 2002 ·
          </textPath>
        </text>
      </g>

      {/* centre */}
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.8" />
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fontSize="9"
        letterSpacing="1.5"
        fill="currentColor"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        EST.
      </text>
      <text
        x="60"
        y="76"
        textAnchor="middle"
        fontSize="19"
        fill="currentColor"
        style={{ fontFamily: "var(--font-display)" }}
      >
        2002
      </text>
      <line x1="48" y1="61.5" x2="72" y2="61.5" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
    </svg>
  );
}
