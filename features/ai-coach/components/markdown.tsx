import React from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Lightweight renderer for coach replies: handles **bold**, inline app links
// (/app/...), bullet lists, and preserves line breaks. No markdown dependency.
// ---------------------------------------------------------------------------

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\/app\/[a-z0-9-]+)/g);

  parts.forEach((part, index) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (/^\/app\/[a-z0-9-]+$/.test(part)) {
      nodes.push(
        <Link
          key={`${keyPrefix}-${index}`}
          href={part}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {part}
        </Link>
      );
    } else {
      nodes.push(part);
    }
  });

  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, index) => {
        if (line.trim().length === 0) return null;

        if (/^[-*]\s+/.test(line.trim())) {
          const item = line.trim().replace(/^[-*]\s+/, "");
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
              <span>{renderInline(item, `li-${index}`)}</span>
            </div>
          );
        }

        return <p key={index}>{renderInline(line, `p-${index}`)}</p>;
      })}
    </div>
  );
}
