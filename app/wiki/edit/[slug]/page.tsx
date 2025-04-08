"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase/client";
import PageForm from "@/components/wiki/PageForm";
import WikiEditor from "@/components/wiki/WikiEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WikiEditorPage() {
  const params = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("wiki_pages")
        .select("title, slug, content")
        .eq("slug", params.slug)
        .single();

      if (data) setInitialData(data);
    };

    fetchData();
  }, [params.slug]);

  const handleSave = async () => {
    if (!initialData) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("wiki_pages")
      .update({
        title: initialData.title,
        content: initialData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", initialData.slug);

    console.log(initialData);

    setIsSaving(false);

    if (!error) {
      router.push(`/wiki/${initialData.slug}`);
      toast.success("Page updated successfully!");
    } else {
      console.error(error);
      toast.error("Failed to update page. Please try again.");
    }
  };

  const handleFieldChange = (
    field: "title" | "slug" | "content",
    value: string
  ) => {
    if (initialData) {
      setInitialData({ ...initialData, [field]: value });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6">Edit Page</h1>
      {initialData && (
        <>
          <PageForm
            initialData={initialData}
            onSubmit={() => {}}
            onChange={handleFieldChange}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              <WikiEditor
                initialContent={initialData.content}
                onSave={(content) => handleFieldChange("content", content)}
              />
            </div>
          </PageForm>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
