import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Loader from "../ui/loader";

export type CategoryPagesProps = {
  selectedCategory: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };

  categoryPages: {
    id: string;
    title: string;
    slug: string;
    created_at: string;
  }[];

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  handleBackToCategories: () => void;
  handleCategoryEditingClick: () => void;
};

export default function CategoryPages({
  selectedCategory,
  categoryPages,
  isLoading,
  setIsLoading,
  handleCategoryEditingClick,
  handleBackToCategories,
}: CategoryPagesProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <div>
          <h1 className="p-2 font-semibold text-2xl">
            Category: {selectedCategory.name}
          </h1>
        </div>
        <div className="gap-2">
          <Button variant="outline" onClick={handleCategoryEditingClick}>
            Edit
          </Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline" onClick={handleBackToCategories}>
            ← Back to Categories
          </Button>
        </div>
      </div>

      {isLoading && <Loader />}

      {!isLoading && categoryPages.length === 0 && (
        <p>No pages found in this category.</p>
      )}

      {!isLoading && categoryPages.length > 0 && (
        <div className="space-y-4">
          {categoryPages.map((page) => (
            <div
              key={page.id}
              className="border p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-grow">
                <h2 className="text-lg font-medium">{page.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(page.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/wiki/${page.slug}`} passHref legacyBehavior>
                  <Button asChild variant="outline">
                    <a>View</a>
                  </Button>
                </Link>
                <Link href={`/wiki/edit/${page.slug}`} passHref legacyBehavior>
                  <Button asChild variant="default">
                    <a>Edit</a>
                  </Button>
                </Link>
                {/* Consider adding a Delete button here */}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
