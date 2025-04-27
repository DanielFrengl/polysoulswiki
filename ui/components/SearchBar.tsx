"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type WikiPage = {
  title: string;
  slug: string;
};

export default function WikiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) {
        searchWiki(query);
      } else {
        setResults([]);
        setIsOpen(false);
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
      setResults(data as WikiPage[]);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/wiki/${slug}`);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search wiki pages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-black dark:text-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((page) => (
              <div
                key={page.slug}
                onClick={() => handleSelect(page.slug)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {page.title}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
