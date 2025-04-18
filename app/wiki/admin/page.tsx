"use client";
import Link from "next/link";
import { fetchCategories, fetchPages, fetchPagesInCategories } from "../action";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
}

interface WikiCategoryPages {
  id: string;
  category_id: string;
  page_id: string;
}

type ViewMode = "categories" | "categoryPages";

export default function WikiAdminPage() {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);

  const [selectedCategory, setSelectedCategory]=useState<WikiCategory[]>([]);

  const [activeEditor, setActiveEditor] = useState<"page" | "category" | null>(
    null
  );

  



  const handleTabClick = (tab: "category" | "pages" | null) => {
    if (tab === "pages") {
    }
    if (tab === "category") {
      setSelectedCategory(categories)
    }
    setActiveEditor(tab);
  };

  useEffect(() => {
    const loadPages = async () => {
      const data = await fetchPages();
      setPages(data);
    };
    loadPages();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  return (
    <div className="mt-10">
      <h1 className="p-2 my-2 font-semibold text-2xl">Categories</h1>
      {activeEditor === null && (
        <div className="grid grid-cols-6 gap-4">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="text-center"
              onClick={() => handleTabClick("category")}
              
            >
              <Card>
                <CardTitle className="mx-2">{category.name}</CardTitle>
              </Card>
            </div>
          ))}
        </div>
      )}

      {activeEditor === "category" && (

      )}

      <div className="space-y-4 mt-20">
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
