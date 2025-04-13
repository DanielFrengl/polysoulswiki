"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

export default function WikiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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
    const { data, error } = await supabase
      .from("wiki_pages")
      .select("title, slug")
      .ilike("title", `%${q}%`)
      .limit(10);

    if (!error) setResults(data);
  };

  return (
    <div className="max-w-md">
      <input
        type="text"
        placeholder="Search wiki pages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      {results.length > 0 && (
        <ul className="bg-white shadow rounded mt-2">
          {results.map((page: any) => (
            <li key={page.slug} className="border-b last:border-none">
              <Link
                href={`/wiki/${page.slug}`}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
