"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryMultiSelect from "@/components/wiki/CategoryMultiSelect";
import { createPage, updatePage } from "@/app/wiki/action";
import { slugify } from "@/lib/slug";
import type { CategoryWithCount, InfoboxField, PageInput } from "@/lib/types";

// The Tiptap editor is client-only and heavy; load it lazily.
const Editor = dynamic(() => import("@/components/wiki/Editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[28rem] w-full rounded-md" />,
});

export interface PageFormInitial {
  title: string;
  slug: string;
  summary: string;
  content: string;
  categorySlugs: string[];
  infobox: InfoboxField[];
}

interface PageFormProps {
  mode: "create" | "edit";
  categories: CategoryWithCount[];
  /** Existing slug when editing (the identity used for updatePage). */
  existingSlug?: string;
  initial?: PageFormInitial;
}

const EMPTY: PageFormInitial = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  categorySlugs: [],
  infobox: [],
};

export default function PageForm({
  mode,
  categories,
  existingSlug,
  initial = EMPTY,
}: PageFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [summary, setSummary] = useState(initial.summary);
  const [content, setContent] = useState(initial.content);
  const [categorySlugs, setCategorySlugs] = useState<string[]>(initial.categorySlugs);
  const [infobox, setInfobox] = useState<InfoboxField[]>(initial.infobox);
  const [comment, setComment] = useState("");

  const addInfoboxRow = () =>
    setInfobox((rows) => [...rows, { label: "", value: "" }]);
  const updateInfoboxRow = (i: number, patch: Partial<InfoboxField>) =>
    setInfobox((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const removeInfoboxRow = (i: number) =>
    setInfobox((rows) => rows.filter((_, j) => j !== i));

  const onTitleChange = (next: string) => {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const input: PageInput = {
      title: title.trim(),
      slug: slug.trim() || title.trim(),
      content,
      summary: summary.trim() ? summary.trim() : null,
      infobox: infobox
        .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
        .filter((f) => f.label.length > 0),
      categorySlugs,
      comment: comment.trim() ? comment.trim() : null,
    };

    startTransition(async () => {
      const result =
        mode === "edit" && existingSlug
          ? await updatePage(existingSlug, input)
          : await createPage(input);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "edit" ? "Page updated." : "Page created.");
      router.push(`/wiki/${result.data.slug}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="page-title">Title</Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Page title"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="page-slug">Slug</Label>
        <Input
          id="page-slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="page-slug"
        />
        <p className="text-xs text-muted-foreground">
          URL: /wiki/{slugify(slug || title) || "…"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="page-summary">Summary</Label>
        <Textarea
          id="page-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A short description shown in listings and search."
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categories</Label>
        <CategoryMultiSelect
          categories={categories}
          value={categorySlugs}
          onChange={setCategorySlugs}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Infobox</Label>
        <p className="text-xs text-muted-foreground">
          Optional label/value pairs shown in a sidebar card (e.g. stats for a
          character or item). Rows with an empty label are dropped.
        </p>
        {infobox.length > 0 && (
          <div className="flex flex-col gap-2">
            {infobox.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.label}
                  onChange={(e) => updateInfoboxRow(i, { label: e.target.value })}
                  placeholder="Label"
                  className="max-w-[12rem]"
                  aria-label={`Infobox label ${i + 1}`}
                />
                <Input
                  value={row.value}
                  onChange={(e) => updateInfoboxRow(i, { value: e.target.value })}
                  placeholder="Value"
                  aria-label={`Infobox value ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove infobox row ${i + 1}`}
                  onClick={() => removeInfoboxRow(i)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={addInfoboxRow}
        >
          <Plus className="size-4" />
          Add row
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Content</Label>
        <Editor initialContent={initial.content} onChange={setContent} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="page-comment">Edit summary</Label>
        <Input
          id="page-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What changed? (optional, saved in history)"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "edit" ? "Save changes" : "Create page"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
