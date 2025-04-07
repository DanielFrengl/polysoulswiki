// src/components/wiki/TinyMCEEditor.tsx
"use client";

import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface TinyMCEEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
  height?: number;
}

export default function TinyMCEEditor({
  initialValue,
  onChange,
  height = 500,
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY || ""}
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      onEditorChange={(content) => onChange(content)}
      init={{
        height,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        link_list: [
          { title: "My page 1", value: "http://www.tinymce.com" },
          { title: "My page 2", value: "http://www.moxiecode.com" },
        ],
        // Enable internal wiki links with [[pageName]]
        setup: (editor) => {
          editor.ui.registry.addButton("wikilink", {
            text: "Wiki Link",
            onAction: () => {
              editor.windowManager.open({
                title: "Insert Wiki Link",
                body: {
                  type: "panel",
                  items: [
                    {
                      type: "input",
                      name: "page",
                      label: "Page Name",
                    },
                    {
                      type: "input",
                      name: "label",
                      label: "Display Text (Optional)",
                    },
                  ],
                },
                buttons: [
                  {
                    type: "cancel",
                    text: "Cancel",
                  },
                  {
                    type: "submit",
                    text: "Insert",
                    primary: true,
                  },
                ],
              });
            },
          });
        },
      }}
    />
  );
}
