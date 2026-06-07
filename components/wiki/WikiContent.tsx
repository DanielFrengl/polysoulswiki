"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { slugify } from "@/lib/slug";

interface WikiContentProps {
  html: string;
}

/**
 * Injects stable ids onto h2/h3 headings so the table of contents can link to
 * them. Implemented as a pure string transform (no DOM) so it produces identical
 * output on the server and the client — avoiding hydration mismatches.
 */
function addHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g,
    (match, tag: string, attrs: string, inner: string) => {
      // Respect an id that already exists on the heading.
      if (/\sid\s*=/.test(attrs)) return match;
      const text = inner.replace(/<[^>]*>/g, "");
      const base = slugify(text) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );
}

/**
 * Sanitizes wiki HTML and renders it with prose styling. Sanitization runs on
 * both server and client via isomorphic-dompurify.
 */
export default function WikiContent({ html }: WikiContentProps) {
  const sanitized = useMemo(() => {
    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    return addHeadingIds(clean);
  }, [html]);

  return (
    <article
      className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-md prose-a:text-primary"
      // Content is sanitized with DOMPurify above.
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
