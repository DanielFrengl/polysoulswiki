"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function WikiEditor({
  initialContent,
  onSave,
}: {
  initialContent?: string;
  onSave: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "",
  });

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-2">
        <EditorContent editor={editor} />
      </div>
      <Button
        onClick={() => {
          if (editor) onSave(editor.getHTML());
        }}
      >
        Save
      </Button>
    </div>
  );
}
