"use client";
import Link from "next/link";
import { fetchPages } from "../action";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

export default function WikiAdminPage() {
  const [pages, setPages] = useState<WikiPage[]>([]);

  useEffect(() => {
    const loadPages = async () => {
      const data = await fetchPages();
      setPages(data);
    };
    loadPages();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Wiki Admin</h1>
      <div className="space-y-4">
        {pages?.map((page) => (
          <div
            key={page.id}
            className="border p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-medium">{page.title}</h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(page.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/wiki/${page.slug}`}>
                <Button variant="outline">View</Button>
              </Link>
              <Link href={`/wiki/edit/${page.slug}`}>
                <Button variant="default">Edit</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
