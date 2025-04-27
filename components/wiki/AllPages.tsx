import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Loader from "../ui/loader";
import { WikiPage } from "@/app/wiki/admin/page";

type AllPagesProps = {
  allPages: WikiPage[];
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  handleBackToCategories: () => void;
  inCategories: string[];
};

export default function AllPages({
  allPages,
  handleBackToCategories,
  isLoading,
  setIsLoading,
}: AllPagesProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <h1 className="p-2 font-semibold text-2xl">All Wiki Pages</h1>
        <Button variant="outline" onClick={handleBackToCategories}>
          ← Back to Categories
        </Button>
      </div>
      {isLoading && <Loader />}
      {!isLoading && (
        <div className="space-y-4 mt-20">
          {allPages?.map((page) => (
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
      )}
    </>
  );
}
