"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { slugify } from "@/lib/utils";
import WikiPageSearch from "@/app/wiki/dashboard/PageSearch";
import { fetchPageIdsFromSlugs } from "@/app/wiki/action";

type CategoryFormProps = {
  initialData?: {
    name: string;
    description: string;
    slug: string;
    hasPages: string[];
  };
  onSubmit: (data: {
    name: string;
    description: string;
    slug: string;
    hasPages: string[];
  }) => void;
  onChange: (
    field: "name" | "description" | "slug" | "hasPages",
    value: string | string[]
  ) => void;
};

export default function CategoryPageForm({
  initialData,
  onSubmit,
  onChange,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [hasPages, setHasPages] = useState(initialData?.hasPages || []);

  // Update name and also update slug when name changes
  useEffect(() => {
    const change = async () => {
      onChange("name", name);

      const newSlug = await slugify(name);
      setSlug(newSlug);
      onChange("slug", newSlug);
    };

    change();
  }, [name]); // Only depend on `name` since the slug is generated from it

  useEffect(() => {
    onChange("description", description);
  }, [description]);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        onSubmit({ name, slug, description, hasPages }); // send IDs to backend
        console.log("Form submitted:", {
          name,
          slug,
          description,
          hasPages,
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Category Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label className="mb-2">URL / Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled
          />
        </div>
      </div>
      <div>
        <Label className="py-5">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="py-5">Pages</Label>
        <WikiPageSearch
          onSelect={(page) => {
            if (!hasPages.includes(page.slug)) {
              const updated = [...hasPages, page.slug];
              setHasPages(updated);
              onChange("hasPages", updated);
            }
          }}
        />
        <ul className="my-2 space-y-1 text-sm">
          {hasPages.map((slug) => (
            <li
              key={slug}
              className="border rounded p-2 flex justify-between items-center"
            >
              {slug}
              <button
                type="button"
                className="text-red-500 hover:underline text-xs"
                onClick={() => {
                  const updated = hasPages.filter((s) => s !== slug);
                  setHasPages(updated);
                  onChange("hasPages", updated);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
