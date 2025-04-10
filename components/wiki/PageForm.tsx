"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import WikiEditor from "./WikiEditor";
import { slugify } from "@/lib/utils";

type PageFormProps = {
  initialData?: {
    title: string;
    slug: string;
    content: string;
  };
  onSubmit: (data: { title: string; slug: string; content: string }) => void;
  onChange: (field: "title" | "slug" | "content", value: string) => void;
};

export default function PageForm({
  initialData,
  onSubmit,
  onChange,
}: PageFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");

  // Update title and also update slug when title changes
  useEffect(() => {
    const change = async () => {
      onChange("title", title);

      const newSlug = await slugify(title);
      setSlug(newSlug);
      onChange("slug", newSlug);
    };

    change();
  }, [title]); // Only depend on `title` since the slug is generated from it

  useEffect(() => {
    onChange("content", content);
  }, [content]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, slug, content });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
        <Label className="py-5">Content</Label>
        <WikiEditor
          initialContent={content}
          onSave={(html) => setContent(html)}
        />
      </div>
    </form>
  );
}
