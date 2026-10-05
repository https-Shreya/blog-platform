import { useEffect, useState } from "react";
import "./AdminPanel.css";

const POSTS_API =
  "https://blog-platform-l89y.onrender.com/api/posts";

const USERS_API =
  "https://blog-platform-l89y.onrender.com/api/auth/users";

function AdminPanel({ user, onBack }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingPosts, setLoadingPosts] =
    useState(true);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [deletingUserId, setDeletingUserId] =
    useState(null);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []);

  // ========================================
  // GET BLOGS
  // ========================================

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);

      const response = await fetch(
        POSTS_API
      );

      const data =
        await response.json();

      if (response.ok) {
        setPosts(data);
      } else {
        setMessage(
          "Failed to load blogs."
        );
      }
    } catch (error) {
      console.error(
        "ADMIN POSTS ERROR:",
        error
      );

      setMessage(
        "Could not connect to the server."
      );
    } finally {
      setLoadingPosts(false);
    }
  };

  // ========================================
  // GET USERS
  // ========================================

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      const response = await fetch(
        USERS_API,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        setMessage(
          data.message ||
            "Failed to load users."
        );
      }
    } catch (error) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      setMessage(
        "Could not load users."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // ========================================
  // DELETE BLOG
  // ========================================

  const handleDeleteBlog = async (
    postId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this blog?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(postId);
      setMessage("");

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      const response = await fetch(
        `${POSTS_API}/admin/${postId}`,
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

      setPosts(
        (currentPosts) =>
          currentPosts.filter(
            (post) =>
              post._id !== postId
          )
      );

      setMessage(
        "Blog deleted successfully. 💜"
      );
    } catch (error) {
      console.error(
        "ADMIN DELETE ERROR:",
        error
      );

      setMessage(
        "Failed to delete blog."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // DELETE USER
  // ========================================

  const handleDeleteUser = async (
    userId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setMessage("");

      const token =
        localStorage.getItem(
          "bloglyToken"
        );

      const response = await fetch(
        `${USERS_API}/${userId}`,
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
            "Failed to delete user."
        );

        return;
      }

      setUsers(
        (currentUsers) =>
          currentUsers.filter(
            (currentUser) =>
              currentUser._id !==
              userId
          )
      );

      setMessage(
        "User deleted successfully. 💜"
      );
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      setMessage(
        "Failed to delete user."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // ========================================
  // ACCESS CHECK
  // ========================================

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-panel">
        <h2>Access Denied</h2>

        <p>
          You do not have permission
          to access this page.
        </p>

        <button onClick={onBack}>
          ← Back to Blogly
        </button>
      </div>
    );
  }

  // ========================================
  // ADMIN PANEL
  // ========================================

  return (
    <div className="admin-panel">

      {/* HEADER */}

      <div className="admin-header">

        <div>
          <p className="admin-label">
            ADMINISTRATION
          </p>

          <h1>
            Admin Panel 👑
          </h1>

          <p>
            Welcome, {user.name}.
            Manage Blogly from here.
          </p>
        </div>

        <button
          className="admin-back-btn"
          onClick={onBack}
        >
          ← Back to Blogly
        </button>

      </div>

      {/* STATS */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>
            Total Blogs
          </span>

          <strong>
            {posts.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Registered Users
          </span>

          <strong>
            {users.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>
            Admins
          </span>

          <strong>
            {
              users.filter(
                (account) =>
                  account.role ===
                  "admin"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* MESSAGE */}

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      {/* ========================================
          BLOG MANAGEMENT
      ======================================== */}

      <section className="admin-blogs">

        <div className="admin-section-heading">

          <p>
            BLOG MANAGEMENT
          </p>

          <h2>
            Published Blogs
          </h2>

        </div>

        {loadingPosts ? (
          <p>
            Loading blogs...
          </p>
        ) : posts.length === 0 ? (
          <div className="admin-empty">
            <h3>
              No blogs found.
            </h3>

            <p>
              There are currently no
              published blogs.
            </p>
          </div>
        ) : (
          <div className="admin-blog-list">

            {posts.map((post) => (

              <div
                className="admin-blog-card"
                key={post._id}
              >

                <div className="admin-blog-info">

                  <p className="admin-blog-category">
                    BLOG
                  </p>

                  <h3>
                    {post.title}
                  </h3>

                  <p>
                    By{" "}
                    <strong>
                      {post.author}
                    </strong>
                  </p>

                  <small>
                    {post.createdAt
                      ? new Date(
                          post.createdAt
                        ).toLocaleDateString()
                      : ""}
                  </small>

                </div>

                <button
                  className="admin-delete-btn"
                  onClick={() =>
                    handleDeleteBlog(
                      post._id
                    )
                  }
                  disabled={
                    deletingId ===
                    post._id
                  }
                >
                  {deletingId ===
                  post._id
                    ? "Deleting..."
                    : "🗑️ Delete"}
                </button>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* ========================================
          USER MANAGEMENT
      ======================================== */}

      <section className="admin-users">

        <div className="admin-section-heading">

          <p>
            USER MANAGEMENT
          </p>

          <h2>
            Registered Users
          </h2>

        </div>

        {loadingUsers ? (
          <p>
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <h3>
              No users found.
            </h3>

            <p>
              There are currently no
              registered users.
            </p>
          </div>
        ) : (
          <div className="admin-user-list">

            {users.map((account) => {

              const isCurrentAdmin =
                account._id ===
                user.id;

              return (
                <div
                  className="admin-user-card"
                  key={account._id}
                >

                  <div className="admin-user-avatar">
                    {account.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="admin-user-info">

                    <h3>
                      {account.name}
                    </h3>

                    <p>
                      {account.email}
                    </p>

                  </div>

                  <span
                    className={
                      account.role ===
                      "admin"
                        ? "admin-role-badge"
                        : "user-role-badge"
                    }
                  >
                    {account.role ===
                    "admin"
                      ? "👑 Admin"
                      : "User"}
                  </span>

                  {isCurrentAdmin ? (
                    <span className="current-admin-label">
                      You
                    </span>
                  ) : (
                    <button
                      className="admin-user-delete-btn"
                      onClick={() =>
                        handleDeleteUser(
                          account._id
                        )
                      }
                      disabled={
                        deletingUserId ===
                        account._id
                      }
                    >
                      {deletingUserId ===
                      account._id
                        ? "Deleting..."
                        : "🗑️ Delete"}
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminPanel;