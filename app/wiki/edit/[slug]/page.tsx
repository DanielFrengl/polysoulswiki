// app/wiki/edit/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase/client";
import PageForm from "@/components/wiki/PageForm";

export default function WikiEditorPage() {
  const params = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<{
    title: string;
    slug: string;
    content: string;
  } | null>(null);

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

  const handleSave = async (data: {
    title: string;
    slug: string;
    content: string;
  }) => {
    const { error } = await supabase
      .from("wiki_pages")
      .update({
        title: data.title,
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", data.slug);

    if (!error) {
      router.push(`/wiki/${data.slug}`);
    } else {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-xl font-semibold mb-6">Edit Page</h1>
      {initialData && (
        <PageForm initialData={initialData} onSubmit={handleSave} />
      )}
    </div>
  );
}
