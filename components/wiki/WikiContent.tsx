"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { slugify } from "@/lib/slug";

interface WikiContentProps {
  html: string;
}

/**
 * Sanitizes wiki HTML on the client and injects stable ids onto h2/h3 headings
 * so the table of contents can link to them. Rendered with prose styling.
 */
export default function WikiContent({ html }: WikiContentProps) {
  const sanitized = useMemo(() => {
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

    // Add ids to headings to match the TOC anchors.
    if (typeof window === "undefined") return clean;
    const doc = new DOMParser().parseFromString(clean, "text/html");
    const seen = new Map<string, number>();
    doc.querySelectorAll("h2, h3").forEach((heading) => {
      const base = slugify(heading.textContent ?? "") || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      heading.id = count === 0 ? base : `${base}-${count}`;
    });
    return doc.body.innerHTML;
  }, [html]);

  return (
    <article
      className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-md prose-a:text-primary"
      // Content is sanitized with DOMPurify above.
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
