"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Extract h2/h3 headings from raw HTML, matching the ids WikiContent injects. */
function extractHeadings(html: string): TocItem[] {
  const regex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase() === "h2" ? 2 : 3;
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    items.push({ id, text, level: level as 2 | 3 });
  }
  return items;
}

export default function TableOfContents({ html }: { html: string }) {
  const items = useMemo(() => extractHeadings(html), [html]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 font-semibold text-foreground">On this page</p>
      <ul className="flex flex-col gap-1 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l border-transparent py-1 pl-3 text-muted-foreground transition-colors hover:text-foreground",
                item.level === 3 && "pl-6",
                activeId === item.id && "border-primary font-medium text-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
