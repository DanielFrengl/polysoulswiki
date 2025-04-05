"use client";

import { useState } from "react";
import WikiEditor from "@/ui/components/WikiEditor";
import { supabase } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function WikiDashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_");

  const handleSubmit = async () => {
    const slug = slugify(title);
    const { data: user } = await supabase.auth.getUser();

    // Insert a new page version first
    const { data: edit, error: editError } = await supabase
      .from("wiki_edits")
      .insert({
        author_id: user?.user?.id,
        content: content,
        summary: "Initial page creation",
      })
      .select()
      .single();

    if (editError) {
      console.error(editError);
      return;
    }

    // Then insert the wiki page linking to that version
    const { error: pageError } = await supabase.from("wiki_pages").insert({
      title,
      slug,
      current_version: edit.id,
    });

    if (pageError) {
      console.error(pageError);
    } else {
      router.push(`/wiki/${slug}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 Create New Wiki Page</h1>

      <input
        type="text"
        placeholder="Page Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <WikiEditor content={content} onChange={setContent} />

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Create Page
      </button>
    </div>
  );
}
