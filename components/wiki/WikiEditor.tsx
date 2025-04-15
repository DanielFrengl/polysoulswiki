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
      value={editorContent}
      init={{
        content_css: "default",
        height: 500,
        menubar: true,
        newline_behavior: "linebreak",
        paste_as_text: false, // allow rich text pasting
        paste_retain_style_properties: "all",
        paste_merge_formats: false,
        paste_webkit_styles: "all",
        paste_data_images: true, // allow pasting inline images if needed
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
          "paste",
        ],
        toolbar:
          "undo redo | formatselect fontselect fontsizeselect | " +
          "bold italic underline strikethrough forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image media codesample emoticons | " +
          "table | formatpainter removeformat | searchreplace preview fullscreen | help",
      }}
      onEditorChange={(_, editor) => handleEditorChange(editor.getContent())}
    />
  );
};

export default WikiEditor;
