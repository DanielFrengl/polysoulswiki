
"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function deletePage(slug: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wiki_pages")
    .delete()
    .eq("slug", slug);

  if (error) {
    throw error;
  }

  redirect("/wiki/dashboard");
}
