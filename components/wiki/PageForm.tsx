"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import WikiEditor from "./WikiEditor";

type PageFormProps = {
  initialData?: {
    title: string;
    slug: string;
    content: string;
  };
  onSubmit: (data: { title: string; slug: string; content: string }) => void;
  onChange: (field: "title" | "slug" | "content", value: string) => void;
  children: React.ReactNode;
};

export default function PageForm({
  initialData,
  onSubmit,
  onChange,
  children,
}: PageFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, slug, content });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="">
          <Label className="mb-2">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label className="mb-2">Slug</Label>
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
