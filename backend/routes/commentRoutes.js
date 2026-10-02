const express = require("express");
const Comment = require("../models/Comment");
const User = require("../models/User");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// GET COMMENTS FOR A BLOG
// ========================================

router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    }).sort({
      createdAt: -1,
    });

    res.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch comments.",
      error: error.message,
    });
  }
});

// ========================================
// ADD COMMENT
// ========================================

router.post("/", protect, async (req, res) => {
  try {
    console.log("COMMENT REQUEST BODY:", req.body);
    console.log("COMMENT USER:", req.user);

    const { postId, text } = req.body;

    if (!postId || !text || !text.trim()) {
      return res.status(400).json({
        message:
          "Post ID and comment text are required.",
      });
    }

    const userId =
      req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID is missing from your login session. Please log in again.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message:
          "User account could not be found. Please log in again.",
      });
    }

    const newComment = new Comment({
      postId: postId,
      userId: user._id,
      userName: user.name,
      text: text.trim(),
    });

    const savedComment =
      await newComment.save();

    console.log(
      "COMMENT SAVED:",
      savedComment
    );

    res.status(201).json(savedComment);
  } catch (error) {
    console.error(
      "CREATE COMMENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to add comment.",
      error:
        error.message,
        details:
          error.errors
            ? Object.keys(error.errors).map(
                (key) => ({
                  field: key,
                  message:
                    error.errors[key].message,
                })
              )
            : [],
    });
  }
});

// ========================================
// ADMIN: DELETE ANY COMMENT
// ========================================

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const comment =
        await Comment.findById(
          req.params.id
        );

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found.",
        });
      }

      await Comment.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Comment deleted by admin successfully.",
      });
    } catch (error) {
      console.error(
        "ADMIN DELETE COMMENT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete comment as admin.",
        error: error.message,
      });
    }
  }
);

// ========================================
// DELETE YOUR OWN COMMENT
// ========================================

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const comment =
        await Comment.findById(
          req.params.id
        );

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found.",
        });
      }

      if (
        !comment.userId ||
        comment.userId.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own comments.",
        });
      }

      await Comment.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Comment deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE COMMENT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete comment.",
        error: error.message,
      });
    }
  }
);

module.exports = router;