import { useEffect, useState } from "react";
import "./BlogDetails.css";

const COMMENTS_API =
  "http://localhost:5000/api/comments";

const POSTS_API =
  "http://localhost:5000/api/posts";

function BlogDetails({
  post,
  user,
  onBack,
  onEdit,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [loadingComments, setLoadingComments] =
    useState(true);
  const [deleting, setDeleting] =
    useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState(null);

  // ========================================
  // LOAD COMMENTS
  // ========================================

  useEffect(() => {
    if (post?._id) {
      fetchComments();
    }
  }, [post?._id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);

      const response = await fetch(
        `${COMMENTS_API}/${post._id}`
      );

      const data = await response.json();

      if (response.ok) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(
        "COMMENT FETCH ERROR:",
        error
      );

      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // ========================================
  // ADD COMMENT
  // ========================================

  const handleCommentSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Please log in to post a comment."
      );
      return;
    }

    if (!text.trim()) {
      setMessage(
        "Please write a comment."
      );
      return;
    }

    try {
      setMessage("Posting comment...");

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      if (!token) {
        setMessage(
          "Your login session has expired. Please log in again."
        );
        return;
      }

      const response = await fetch(
        COMMENTS_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            postId: post._id,
            text: text.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "COMMENT SERVER ERROR:",
          data
        );

        setMessage(
          data.error ||
            data.message ||
            "Failed to post comment."
        );

        return;
      }

      setComments(
        (currentComments) => [
          data,
          ...currentComments,
        ]
      );

      setText("");

      setMessage(
        "Comment posted! 💜"
      );
    } catch (error) {
      console.error(
        "COMMENT ERROR:",
        error
      );

      setMessage(
        "Failed to post comment. Please try again."
      );
    }
  };

  // ========================================
  // CHECK BLOG OWNER
  // ========================================

  const isOwner =
    user &&
    post.authorId &&
    post.authorId.toString() ===
      user.id.toString();

  // ========================================
  // DELETE BLOG
  // ========================================

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this blog?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      const response = await fetch(
        `${POSTS_API}/${post._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete blog."
        );

        return;
      }

      alert(
        "Blog deleted successfully! 💜"
      );

      onBack();
    } catch (error) {
      console.error(
        "DELETE BLOG ERROR:",
        error
      );

      setMessage(
        "Failed to delete blog. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // EDIT BLOG
  // ========================================

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };

  // ========================================
  // DELETE COMMENT
  // ========================================

  const handleDeleteComment = async (
    comment
  ) => {
    if (!user) {
      return;
    }

    const isAdmin =
      user.role === "admin";

    const isCommentOwner =
      comment.userId &&
      comment.userId.toString() ===
        user.id.toString();

    if (!isAdmin && !isCommentOwner) {
      setMessage(
        "You can only delete your own comments."
      );

      return;
    }

    const confirmed =
      window.confirm(
        isAdmin
          ? "Are you sure you want to delete this comment?"
          : "Delete your comment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCommentId(
        comment._id
      );

      setMessage("");

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      const deleteUrl = isAdmin
        ? `${COMMENTS_API}/admin/${comment._id}`
        : `${COMMENTS_API}/${comment._id}`;

      const response = await fetch(
        deleteUrl,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to delete comment."
        );

        return;
      }

      setComments(
        (currentComments) =>
          currentComments.filter(
            (currentComment) =>
              currentComment._id !==
              comment._id
          )
      );

      setMessage(
        isAdmin
          ? "Comment removed by admin. 💜"
          : "Comment deleted successfully. 💜"
      );
    } catch (error) {
      console.error(
        "DELETE COMMENT ERROR:",
        error
      );

      setMessage(
        "Failed to delete comment. Please try again."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // ========================================
  // SAFETY CHECK
  // ========================================

  if (!post) {
    return null;
  }

  return (
    <div className="blog-details-page">

      <button
        className="back-btn"
        onClick={onBack}
      >
        ← Back to Blogs
      </button>

      <article className="full-blog">

        {/* BLOG HEADER */}

        <div className="full-blog-header">

          <p className="full-blog-category">
            BLOG
          </p>

          <h1>
            {post.title}
          </h1>

          <p className="full-blog-author">
            By {post.author}
          </p>

        </div>

        {/* COVER IMAGE */}

        {post.image && (
          <img
            className="full-blog-image"
            src={post.image}
            alt={post.title}
          />
        )}

        {/* FULL BLOG CONTENT */}

        <div
          className="full-blog-content"
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />

        {/* OWNER ACTIONS */}

        {isOwner && (
          <div className="blog-owner-actions">

            <p className="owner-action-label">
              YOUR BLOG
            </p>

            <div className="owner-action-buttons">

              <button
                className="edit-blog-btn"
                onClick={handleEdit}
              >
                ✏️ Edit Blog
              </button>

              <button
                className="delete-blog-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "🗑️ Delete Blog"}
              </button>

            </div>

          </div>
        )}

        {/* COMMENTS */}

        <section className="comments-section">

          <div className="comments-heading">

            <p>
              JOIN THE CONVERSATION
            </p>

            <h2>
              Comments
            </h2>

          </div>

          {/* COMMENT FORM */}

          {user ? (
            <form
              className="comment-form"
              onSubmit={
                handleCommentSubmit
              }
            >

              <div className="comment-user">
                Commenting as{" "}
                <strong>
                  {user.name}
                </strong>
              </div>

              <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(event) =>
                  setText(
                    event.target.value
                  )
                }
                rows="4"
              />

              <button type="submit">
                Post Comment
              </button>

            </form>
          ) : (
            <div className="login-to-comment">

              <p>
                Please log in to join the
                conversation.
              </p>

              <p>
                Use the Login button in
                the navbar.
              </p>

            </div>
          )}

          {/* COMMENT MESSAGE */}

          {message && (
            <p className="comment-message">
              {message}
            </p>
          )}

          {/* COMMENT LIST */}

          <div className="comments-list">

            {loadingComments ? (
              <p>
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the
                first to share your
                thoughts! 💜
              </p>
            ) : (
              comments.map(
                (comment) => {

                  const isAdmin =
                    user?.role ===
                    "admin";

                  const isCommentOwner =
                    user &&
                    comment.userId &&
                    comment.userId.toString() ===
                      user.id.toString();

                  const canDeleteComment =
                    isAdmin ||
                    isCommentOwner;

                  return (
                    <div
                      className="comment-card"
                      key={comment._id}
                    >

                      <div className="comment-main">

                        <span className="comment-author">
                          {comment.userName ||
                            comment.author ||
                            "User"}
                          :
                        </span>

                        <span className="comment-text">
                          {comment.text}
                        </span>

                      </div>

                      <div className="comment-footer">

                        <small>
                          {new Date(
                            comment.createdAt
                          ).toLocaleDateString()}
                        </small>

                        {canDeleteComment && (
                          <button
                            className="delete-comment-btn"
                            onClick={() =>
                              handleDeleteComment(
                                comment
                              )
                            }
                            disabled={
                              deletingCommentId ===
                              comment._id
                            }
                          >
                            {deletingCommentId ===
                            comment._id
                              ? "Deleting..."
                              : isAdmin
                              ? "🗑️ Remove"
                              : "🗑️ Delete"}
                          </button>
                        )}

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </section>

      </article>

    </div>
  );
}

export default BlogDetails;