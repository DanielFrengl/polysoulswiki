"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

import { createClient } from "@/utils/supabase/client";

type WikiPage = {
  title: string;
  slug: string;
};

export default function WikiPageSearch({
  onSelect,
}: {
  onSelect: (page: WikiPage) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPage[]>([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) {
        searchWiki(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const searchWiki = async (q: string) => {
    const supabase = createClient;
    const { data, error } = await supabase
      .from("wiki_pages")
      .select("title, slug")
      .ilike("title", `%${q}%`)
      .limit(10);

    if (!error && data) {
      setResults(data);
    } else {
      setResults([]);
    }
  };

  return (
    <Command className="max-w-md border rounded shadow bg-background relative z-50">
      <CommandInput
        placeholder="Search wiki pages..."
        value={query}
        onValueChange={(val) => setQuery(val)}
      />
      <CommandList>
        {results.length > 0 ? (
          results.map((page) => (
            <CommandItem
              key={page.slug}
              value={page.title}
              onSelect={() => {
                onSelect(page);
                setQuery(""); // Clear input after select
                setResults([]);
              }}
            >
              {page.title}
            </CommandItem>
          ))
        ) : (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
      </CommandList>
    </Command>
  );
}
