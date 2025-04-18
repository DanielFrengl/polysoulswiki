"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

type WikiPage = {
  title: string;
  slug: string;
};

export default function WikiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPage[]>([]); // ✅ Fixed type

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
      setResults(data as WikiPage[]); // optional cast
    } else {
      setResults([]);
    }
  };

  return (
    <Command className="max-w-md border rounded shadow bg-background">
      <CommandInput
        placeholder="Search"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {results.length > 0 && (
          <ul className="absolute bg-white z-50 border rounded shadow mt-2 px-20 text-black">
            {results.map((page) => (
              <li key={page.slug} className="p-2 hover:bg-gray-100">
                <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </CommandList>
    </Command>
  );
}
