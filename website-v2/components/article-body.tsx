import { Fragment, type ReactNode } from "react";

/** Renders inline **bold** segments within a line. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * Minimal renderer for the markdown-ish article bodies in content.ts.
 * Supports: blank-line paragraphs, "- " bullet lists, "1." ordered lists,
 * lines that are entirely **bold** become subheadings.
 */
export function ArticleBody({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);

        // Unordered list
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3 text-foreground/85">
                  <span className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-amber" />
                  <span className="leading-relaxed">
                    {inline(l.trim().slice(2))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={i} className="space-y-2 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3 text-foreground/85">
                  <span className="font-mono text-xs font-medium text-brand-deep">
                    {j + 1}.
                  </span>
                  <span className="leading-relaxed">
                    {inline(l.trim().replace(/^\d+\.\s/, ""))}
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        // Standalone bold line → subheading
        const single = block.trim();
        if (/^\*\*[^*]+\*\*$/.test(single)) {
          return (
            <h2
              key={i}
              className="pt-4 font-display text-xl font-semibold text-foreground"
            >
              {single.slice(2, -2)}
            </h2>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-foreground/85">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}
