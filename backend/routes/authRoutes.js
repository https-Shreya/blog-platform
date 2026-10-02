const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "blogly_secret_key";

// ========================================
// REGISTER
// ========================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Please fill in all fields.",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser =
      await newUser.save();

    res.status(201).json({
      message:
        "Account created successfully!",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create account.",
      error: error.message,
    });
  }
});

// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please enter your email and password.",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message:
        "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: "Login failed.",
      error: error.message,
    });
  }
});

// ========================================
// ADMIN: GET ALL USERS
// ========================================

router.get(
  "/users",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select(
            "-password"
          )
          .sort({
            createdAt: -1,
          });

      res.json(users);
    } catch (error) {
      console.error(
        "GET USERS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch users.",
        error: error.message,
      });
    }
  }
);

// ========================================
// ADMIN: DELETE USER
// ========================================

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      if (
        req.params.id ===
        req.user.userId
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own admin account.",
        });
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete user.",
        error: error.message,
      });
    }
  }
);

module.exports = router;