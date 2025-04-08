"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";

interface WikiEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}

const WikiEditor = ({ initialContent, onSave }: WikiEditorProps) => {
  const [editorContent, setEditorContent] = useState(initialContent);

  useEffect(() => {
    setEditorContent(initialContent);
  }, [initialContent]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onSave(content); // Update the parent state
  };

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      initialValue={editorContent}
      init={{
        height: 600,
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
          "emoticons",
          "codesample",
          "directionality",
        ],
        toolbar:
          "undo redo | formatselect fontselect fontsizeselect | " +
          "bold italic underline strikethrough forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media codesample emoticons | " +
          "table | formatpainter removeformat | searchreplace preview fullscreen | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
      onEditorChange={(_, editor) => handleEditorChange(editor.getContent())}
    />
  );
};

export default WikiEditor;
