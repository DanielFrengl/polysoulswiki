"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchPages } from "@/app/wiki/action";
import type { WikiPageSummary } from "@/lib/types";

export default function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPageSummary[]>([]);
  const [, startTransition] = useTransition();

  // Cmd/Ctrl+K to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(() => {
      if (!q) {
        setResults([]);
        return;
      }
      startTransition(async () => setResults(await searchPages(q)));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/wiki/${slug}`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground gap-2"
        aria-label="Search the wiki"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? "No pages found." : "Type to search the wiki."}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((page) => (
                <CommandItem
                  key={page.id}
                  value={page.title}
                  onSelect={() => go(page.slug)}
                >
                  <span className="font-medium">{page.title}</span>
                  {page.summary && (
                    <span className="text-muted-foreground ml-2 line-clamp-1 text-xs">
                      {page.summary}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
