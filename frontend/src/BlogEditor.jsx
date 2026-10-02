import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { uploadImage } from "./cloudinaryUpload";
import "./BlogEditor.css";

function BlogEditor({ content, setContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],

    content: content || "",

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },

    immediatelyRender: false,
  });

  /*
    When editing an existing blog,
    the content may arrive after the editor
    has already been created.

    This loads the existing blog content
    into the editor.
  */
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (
      content &&
      content !== editor.getHTML() &&
      !editor.isFocused
    ) {
      editor.commands.setContent(
        content,
        false
      );
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const input =
      document.getElementById(
        "blog-image-input"
      );

    if (input) {
      input.click();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    try {
      const imageUrl = await uploadImage(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
        })
        .run();
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error
      );

      alert(
        "Image upload failed. Please try again."
      );
    }

    event.target.value = "";
  };

  return (
    <div className="editor-wrapper">

      <div className="editor-toolbar">

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={
            editor.isActive("bold")
              ? "active"
              : ""
          }
        >
          B
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={
            editor.isActive("italic")
              ? "active"
              : ""
          }
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          • List
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          1. List
        </button>

        <button
          type="button"
          onClick={addImage}
        >
          🖼️ Image
        </button>

        <input
          id="blog-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{
            display: "none",
          }}
        />

      </div>

      <EditorContent
        editor={editor}
      />

    </div>
  );
}

export default BlogEditor;