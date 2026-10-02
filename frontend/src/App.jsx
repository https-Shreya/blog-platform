import { useEffect, useState } from "react";
import "./App.css";
import WriteBlog from "./WriteBlog";
import BlogDetails from "./BlogDetails";
import Auth from "./Auth";
import AdminPanel from "./AdminPanel";

const API_URL = "http://localhost:5000/api/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteBlog, setShowWriteBlog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] =
    useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPosts();

    const savedUser =
      localStorage.getItem("bloglyUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "USER LOAD ERROR:",
          error
        );

        localStorage.removeItem(
          "bloglyUser"
        );
      }
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setPosts(data);
    } catch (error) {
      console.error(
        "FAILED TO FETCH POSTS:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBlogPublished = () => {
    setShowWriteBlog(false);
    setEditingPost(null);

    fetchPosts();
  };

  const handleBlogUpdated = (updatedPost) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === updatedPost._id
          ? updatedPost
          : post
      )
    );

    setEditingPost(null);
    setShowWriteBlog(false);
    setSelectedPost(updatedPost);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  OPEN A BLOG
  ============================================
  */

  const openBlog = (post) => {
    console.log("OPENING BLOG:", post);

    setShowAdminPanel(false);
    setShowWriteBlog(false);
    setEditingPost(null);
    setSelectedPost(post);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  CLOSE BLOG READER
  ============================================
  */

  const closeBlog = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setShowWriteBlog(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  LOGIN
  ============================================
  */

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuth(false);
  };

  /*
  ============================================
  LOGOUT
  ============================================
  */

  const handleLogout = () => {
    localStorage.removeItem("bloglyToken");
    localStorage.removeItem("bloglyUser");

    setUser(null);
    setShowWriteBlog(false);
    setEditingPost(null);
    setSelectedPost(null);
    setShowAdminPanel(false);
  };

  /*
  ============================================
  OPEN WRITE BLOG
  ============================================
  */

  const openWriteBlog = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setShowAdminPanel(false);
    setSelectedPost(null);
    setEditingPost(null);
    setShowWriteBlog(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  OPEN EDIT BLOG
  ============================================
  */

  const openEditBlog = (post) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setShowAdminPanel(false);
    setSelectedPost(null);
    setEditingPost(post);
    setShowWriteBlog(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  OPEN ADMIN PANEL
  ============================================
  */

  const openAdminPanel = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setShowWriteBlog(false);
    setShowAdminPanel(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================
  CLOSE ADMIN PANEL
  ============================================
  */

  const closeAdminPanel = () => {
    setShowAdminPanel(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    fetchPosts();
  };

  /*
  ============================================
  ADMIN PANEL
  ============================================
  */

  if (showAdminPanel) {
    return (
      <AdminPanel
        user={user}
        onBack={closeAdminPanel}
      />
    );
  }

  /*
  ============================================
  BLOG READER
  ============================================
  */

  if (selectedPost) {
    return (
      <>
        <nav className="navbar">

          <h1>Blogly</h1>

          <div className="nav-links">

            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                closeBlog();
              }}
            >
              Home
            </a>

            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                closeBlog();
              }}
            >
              Blogs
            </a>

            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                closeBlog();
              }}
            >
              About
            </a>

          </div>

          <div className="nav-actions">

            {user ? (
              <>
                <span className="user-name">
                  Hi, {user.name}
                </span>

                {user.role === "admin" && (
                  <button
                    className="admin-btn"
                    onClick={
                      openAdminPanel
                    }
                  >
                    👑 Admin
                  </button>
                )}

                <button
                  className="login-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="login-btn"
                onClick={() =>
                  setShowAuth(true)
                }
              >
                Login
              </button>
            )}

            <button
              className="write-btn"
              onClick={openWriteBlog}
            >
              Write a Blog
            </button>

          </div>

        </nav>

        <BlogDetails
          post={selectedPost}
          user={user}
          onBack={closeBlog}
          onEdit={openEditBlog}
        />

        {showAuth && (
          <Auth
            onLogin={handleLogin}
            onClose={() =>
              setShowAuth(false)
            }
          />
        )}
      </>
    );
  }

  /*
  ============================================
  MAIN BLOG PAGE
  ============================================
  */

  return (
    <div className="app">

      <nav className="navbar">

        <h1>Blogly</h1>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#blogs">
            Blogs
          </a>

          <a href="#about">
            About
          </a>

        </div>

        <div className="nav-actions">

          {user ? (
            <>
              <span className="user-name">
                Hi, {user.name}
              </span>

              {user.role === "admin" && (
                <button
                  className="admin-btn"
                  onClick={
                    openAdminPanel
                  }
                >
                  👑 Admin
                </button>
              )}

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() =>
                setShowAuth(true)
              }
            >
              Login
            </button>
          )}

          <button
            className="write-btn"
            onClick={openWriteBlog}
          >
            Write a Blog
          </button>

        </div>

      </nav>

      {showWriteBlog && (
        <WriteBlog
          user={user}
          editingPost={editingPost}
          onPublished={
            handleBlogPublished
          }
          onUpdated={
            handleBlogUpdated
          }
        />
      )}

      <main>

        <section
          className="hero"
          id="home"
        >

          <div>

            <p className="small-heading">
              WELCOME TO BLOGLY
            </p>

            <h2>
              Share your ideas.
              <br />
              Inspire others.
            </h2>

            <p className="hero-text">
              A simple space to write,
              discover, and share stories
              that matter.
            </p>

            <button
              className="explore-btn"
              onClick={() =>
                document
                  .getElementById("blogs")
                  .scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Blogs
            </button>

          </div>

        </section>

        <section
          className="blogs-section"
          id="blogs"
        >

          <div className="section-heading">

            <p className="small-heading">
              LATEST STORIES
            </p>

            <h2>
              Featured Blogs
            </h2>

          </div>

          {loading ? (
            <p>
              Loading blogs...
            </p>
          ) : posts.length === 0 ? (
            <p>
              No blogs have been published
              yet.
            </p>
          ) : (
            <div className="blog-grid">

              {posts.map((post) => (

                <article
                  className="blog-card"
                  key={post._id}
                >

                  <div className="blog-image">

                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      "✦"
                    )}

                  </div>

                  <div className="blog-content">

                    <p className="category">
                      BLOG
                    </p>

                    <h3>
                      {post.title}
                    </h3>

                    <div className="blog-preview">

                      {post.content
                        .replace(
                          /<[^>]*>/g,
                          ""
                        )
                        .slice(0, 180)}

                      {post.content
                        .replace(
                          /<[^>]*>/g,
                          ""
                        ).length > 180
                        ? "..."
                        : ""}

                    </div>

                    <span>
                      By {post.author}
                    </span>

                    <button
                      type="button"
                      className="read-btn"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        openBlog(post);
                      }}
                    >
                      Read Full Story →
                    </button>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

        <section
          className="about-section"
          id="about"
        >

          <p className="small-heading">
            ABOUT BLOGLY
          </p>

          <h2>
            A place for your thoughts.
          </h2>

          <p>
            Blogly is a simple blogging
            platform where writers can
            create posts and readers can
            discover new ideas.
          </p>

        </section>

      </main>

      <footer>

        <p>
          © 2026 Blogly. Made with React.
        </p>

      </footer>

      {showAuth && (
        <Auth
          onLogin={handleLogin}
          onClose={() =>
            setShowAuth(false)
          }
        />
      )}

    </div>
  );
}

export default App;