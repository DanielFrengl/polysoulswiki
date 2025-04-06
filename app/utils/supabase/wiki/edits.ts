import { supabase } from "../client";

export async function logEdit(pageId: string, content: string, editorId: string) {
    const { data, error } = await supabase.from("wiki_edits").insert([
      { page_id: pageId, content, editor_id: editorId }
    ]);
    if (error) throw new Error(error.message);
    return data;
  }
  
  export async function createWikiEdit(page_id: string, user_id: string, content: string) {
    const { data, error } = await supabase.from("wiki_edits").insert([
      { page_id, user_id, content },
    ]);
    if (error) throw new Error(error.message);
    return data;
  }