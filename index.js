const express = require("express");
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { nanoid } = require("nanoid");
const path = require("path");

// Create Express app
const app = express();
const port = 3000;

// Setup LowDB
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ posts: [] }).write();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes

// GET all posts
app.get("/posts", (req, res) => {
  const posts = db.get("posts").value();
  res.json(posts);
});

// GET post by ID
app.get("/posts/:id", (req, res) => {
  const post = db.get("posts").find({ id: req.params.id }).value();
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// CREATE post
app.post("/posts", (req, res) => {
  const { title, content, updatedAt } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const post = {
    id: nanoid(),
    title,
    content,
    updatedAt: updatedAt || new Date().toISOString(),
  };
  db.get("posts").push(post).write();
  res.status(201).json(post);
});

// UPDATE post
app.put("/posts/:id", (req, res) => {
  const { title, content, updatedAt } = req.body;
  const post = db.get("posts").find({ id: req.params.id });
  if (!post.value()) {
    return res.status(404).json({ error: "Post not found" });
  }
  post
    .assign({
      title: title ?? post.value().title,
      content: content ?? post.value().content,
      updatedAt: updatedAt || new Date().toISOString(),
    })
    .write();
  res.json(post.value());
});

// DELETE post
app.delete("/posts/:id", (req, res) => {
  const post = db.get("posts").find({ id: req.params.id }).value();
  if (!post) return res.status(404).json({ error: "Post not found" });

  db.get("posts").remove({ id: req.params.id }).write();
  res.json(post);
});

// Start server
app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
