"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import WikiEditor from "./WikiEditor";

export default function PageForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: { title: string; slug: string; content: string }) => void;
  initialData?: { title: string; slug: string; content: string };
}) {
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
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Content</Label>
        <WikiEditor
          initialContent={content}
          onSave={(html) => setContent(html)}
        />
      </div>
    </form>
  );
}
