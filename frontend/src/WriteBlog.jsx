
import { useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";
import { uploadImage } from "./cloudinaryUpload";
import "./WriteBlog.css";

const API_URL = "http://localhost:5000/api/posts";

function WriteBlog({
  user,
  onPublished,
  editingPost,
  onUpdated,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [message, setMessage] = useState("");

  const isEditing = Boolean(editingPost);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
      setImage(editingPost.image || "");
      setMessage("");
    } else {
      setTitle("");
      setContent("");
      setImage("");
      setMessage("");
    }
  }, [editingPost]);

  const handleCoverImage = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    try {
      setImageUploading(true);
      setMessage("Uploading cover image...");

      const imageUrl = await uploadImage(file);

      setImage(imageUrl);
      setMessage("Cover image uploaded successfully! ✓");
    } catch (error) {
      console.error("COVER IMAGE ERROR:", error);
      setMessage("Cover image upload failed.");
    } finally {
      setImageUploading(false);
    }

    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please fill in the title and story.");
      return;
    }

    if (!user) {
      setMessage("Please log in before publishing.");
      return;
    }

    if (imageUploading) {
      setMessage(
        "Please wait for the image to finish uploading."
      );
      return;
    }

    try {
      setMessage(
        isEditing
          ? "Saving changes..."
          : "Publishing blog..."
      );

      const token = localStorage.getItem("bloglyToken");

      const endpoint = isEditing
        ? `${API_URL}/${editingPost._id}`
        : API_URL;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: user.name,
          content,
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            (isEditing
              ? "Failed to update blog."
              : "Failed to publish blog.")
        );
        return;
      }

      if (isEditing) {
        setMessage("Blog updated successfully! 💜");

        if (onUpdated) {
          setTimeout(() => {
            onUpdated(data.post);
          }, 700);
        }
      } else {
        setMessage("Blog published successfully! 🎉");

        setTitle("");
        setContent("");
        setImage("");

        if (onPublished) {
          setTimeout(() => {
            onPublished();
          }, 1000);
        }
      }
    } catch (error) {
      console.error(
        isEditing
          ? "UPDATE BLOG ERROR:"
          : "PUBLISH ERROR:",
        error
      );

      setMessage(
        isEditing
          ? "Update failed: " + error.message
          : "Publish failed: " + error.message
      );
    }
  };

  return (
    <div className="write-page">
      <div className="paper">

        <div className="paper-header">
          <p>
            {isEditing
              ? "MAKE IT EVEN BETTER"
              : "BUILT TO BE READ"}
          </p>

          <h1>
            {isEditing
              ? "Edit Your Blog"
              : "Write a Blog"}
          </h1>

          <span>
            {isEditing
              ? "Update your story and save your changes."
              : "Put your thoughts into words."}
          </span>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Blog Title *</label>

            <input
              type="text"
              placeholder="Give your story a title..."
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Author</label>

            <input
              type="text"
              value={user ? user.name : ""}
              disabled
            />
          </div>

          <div className="field">
            <label>Cover Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImage}
              disabled={imageUploading}
            />

            {image && (
              <div style={{ marginTop: "15px" }}>
                <img
                  src={image}
                  alt="Cover preview"
                  style={{
                    width: "220px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
          </div>

          <div className="field content-field">
            <label>Your Story *</label>

            <BlogEditor
              content={content}
              setContent={setContent}
            />
          </div>

          <div className="publish-area">
            <button
              type="submit"
              disabled={imageUploading}
            >
              {imageUploading
                ? "Uploading..."
                : isEditing
                ? "Save Changes"
                : "Publish Blog"}
            </button>
          </div>

          {message && (
            <p className="form-message">
              {message}
            </p>
          )}

        </form>
      </div>
    </div>
  );
}

export default WriteBlog;

