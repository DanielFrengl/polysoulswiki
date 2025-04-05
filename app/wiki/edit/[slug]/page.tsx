"use client";

import { useState, useEffect } from "react";
import WikiEditor from "@/ui/components/WikiEditor";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabase/client";

export default function WikiEdit({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Load current wiki content
    const loadContent = async () => {
      const { data } = await supabase
        .from("wiki_pages")
        .select("current_version(id, content)")
        .eq("slug", params.slug)
        .single();

      setContent(data?.current_version?.content || "");
    };

    loadContent();
  }, [params.slug]);

  const handleSave = async () => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("wiki_edits")
      .insert({
        page_id: params.slug,
        author_id: user?.user?.id,
        content: content,
        summary: "Edit made via TinyMCE",
      })
      .select()
      .single();

    // Update current version on the wiki page
    if (data) {
      await supabase
        .from("wiki_pages")
        .update({ current_version: data.id })
        .eq("slug", params.slug);
    }

    router.push(`/wiki/${params.slug}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Edit Wiki Page</h1>
      <WikiEditor content={content} onChange={setContent} />
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
