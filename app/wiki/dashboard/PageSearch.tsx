"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { formatDate } from "@/lib/utils";
import { searchPages } from "@/app/wiki/action";
import type { WikiPageSummary } from "@/lib/types";

interface PageSearchProps {
  initialPages: WikiPageSummary[];
}

export default function PageSearch({ initialPages }: PageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPageSummary[]>(initialPages);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(() => {
      if (!q) {
        setResults(initialPages);
        return;
      }
      startTransition(async () => {
        setResults(await searchPages(q));
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query, initialPages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages by title or content…"
          className="pl-9"
          aria-label="Search pages"
        />
      </div>

      {results.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No pages found</EmptyTitle>
            <EmptyDescription>
              {query.trim()
                ? "Try a different search term."
                : "There are no pages yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((page) => (
            <li key={page.id}>
              <Link href={`/wiki/${page.slug}`} className="block">
                <Card className="transition-colors hover:border-primary">
                  <CardContent>
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-medium">{page.title}</h2>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(page.updatedAt)}
                      </span>
                    </div>
                    {page.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {page.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
