const express = require("express");
const Post = require("../models/Post");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// TEST ROUTE
// ========================================

router.get("/test", (req, res) => {
  res.send("Post route works!");
});

// ========================================
// CREATE A NEW POST
// ========================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      image,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message:
          "Title and content are required.",
      });
    }

    const newPost = new Post({
      title,
      content,
      author: req.user.name || author,
      authorId: req.user.userId,
      image,
    });

    const savedPost =
      await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(
      "CREATE POST ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create post",
      error: error.message,
    });
  }
});

// ========================================
// GET ALL POSTS
// ========================================

router.get("/", async (req, res) => {
  try {
    const posts =
      await Post.find().sort({
        createdAt: -1,
      });

    res.json(posts);
  } catch (error) {
    console.error(
      "GET POSTS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch posts",
      error: error.message,
    });
  }
});

// ========================================
// ADMIN: DELETE ANY BLOG
// IMPORTANT: THIS MUST COME BEFORE /:id
// ========================================

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message:
            "Blog not found.",
        });
      }

      await Post.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Blog deleted by admin successfully.",
      });
    } catch (error) {
      console.error(
        "ADMIN DELETE POST ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete blog as admin.",
        error: error.message,
      });
    }
  }
);

// ========================================
// EDIT YOUR OWN BLOG
// ========================================

router.put(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const {
        title,
        content,
        image,
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          message:
            "Title and content are required.",
        });
      }

      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message:
            "Blog not found.",
        });
      }

      if (
        !post.authorId ||
        post.authorId.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own blogs.",
        });
      }

      post.title =
        title.trim();

      post.content =
        content;

      post.image =
        image || "";

      const updatedPost =
        await post.save();

      res.json({
        message:
          "Blog updated successfully.",
        post: updatedPost,
      });
    } catch (error) {
      console.error(
        "UPDATE POST ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update blog.",
        error: error.message,
      });
    }
  }
);

// ========================================
// DELETE YOUR OWN BLOG
// ========================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          message:
            "Blog not found.",
        });
      }

      if (
        !post.authorId ||
        post.authorId.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own blogs.",
        });
      }

      await Post.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Blog deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE POST ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete blog.",
        error: error.message,
      });
    }
  }
);

module.exports = router;