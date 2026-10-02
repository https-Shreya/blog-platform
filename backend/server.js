const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("Blog Platform API is running!");
});

app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);

// Error handler
app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    message: "Server error",
    error: error.message,
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
  });