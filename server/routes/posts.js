const express = require("express");
const { body, param, validationResult, query } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const Category = require("../models/Category");

const router = express.Router();

router.get(
  "/",
  [query("page").optional().isInt({ min: 1 }).toInt(), query("limit").optional().isInt({ min: 1 }).toInt()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const category = req.query.category;

    const filter = {};
    if (category) {
      const cat = await Category.findOne({ $or: [{ _id: category }, { name: category }] }).exec();
      if (cat) filter.category = cat._id;
    }
    const q = req.query.q;

    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: re }, { content: re }, { excerpt: re }];
    }

    const posts = await Post.find(filter)
      .populate("author", "username email")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await Post.countDocuments(filter);

    res.json({ success: true, data: posts, meta: { page, limit, total } });
  })
);

router.get(
  "/:id",
  [param("id").notEmpty()],
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    let post = await Post.findById(id).populate("author", "username email").populate("category", "name").exec();
    if (!post) {
      post = await Post.findOne({ slug: id }).populate("author", "username email").populate("category", "name").exec();
    }
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  })
);

router.post(
  "/",
  [body("title").isString().isLength({ min: 1 }), body("content").isString().isLength({ min: 1 }), body("category").optional().isString()],
  auth,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, featuredImage, excerpt, tags, category } = req.body;

    let categoryId = null;
    if (category) {
      const cat = await Category.findOne({ $or: [{ _id: category }, { name: category }] }).exec();
      if (cat) categoryId = cat._id;
      else {
        const newCat = await Category.create({ name: category });
        categoryId = newCat._id;
      }
    }

    const post = new Post({ title, content, featuredImage, excerpt, tags, category: categoryId, author: req.user ? req.user._id : null });
    await post.save();
    res.status(201).json({ success: true, data: post });
  })
);

router.put(
  "/:id",
  [param("id").notEmpty(), body("title").optional().isString(), body("content").optional().isString()],
  auth,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const update = req.body;

    if (update.category) {
      const cat = await Category.findOne({ $or: [{ _id: update.category }, { name: update.category }] }).exec();
      if (cat) update.category = cat._id;
      else {
        const newCat = await Category.create({ name: update.category });
        update.category = newCat._id;
      }
    }

    const post = await Post.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate("category", "name").exec();
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  })
);

router.delete(
  "/:id",
  [param("id").notEmpty()],
  auth,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id).exec();
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });
    if (!req.user || (post.author && String(post.author) !== String(req.user._id) && req.user.role !== "admin")) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    await post.remove();
    res.json({ success: true, message: "Post deleted" });
  })
);

router.post(
  "/:id/comments",
  [param("id").notEmpty(), body("content").isString().isLength({ min: 1 })],
  auth,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const { content } = req.body;
    const post = await Post.findById(id).exec();
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });

    const comment = { user: req.user._id, content };
    post.comments.push(comment);
    await post.save();
    await post.populate({ path: "comments.user", select: "username email" });
    const last = post.comments[post.comments.length - 1];
    res.status(201).json({ success: true, data: last });
  })
);

module.exports = router;
const express = require("express");
const { body, param, validationResult, query } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const Category = require("../models/Category");

const router = express.Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const category = req.query.category;

    const filter = {};
    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: category }, { name: category }],
      }).exec();
      if (cat) filter.category = cat._id;
    }
    const q = req.query.q;

    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: re }, { content: re }, { excerpt: re }];
    }

    const posts = await Post.find(filter)
      .populate("author", "username email")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await Post.countDocuments(filter);

    res.json({ success: true, data: posts, meta: { page, limit, total } });
  })
);

// GET /api/posts/:id - get single post by id or slug
router.get(
  "/:id",
  [param("id").notEmpty()],
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    let post = null;
      post = await Post.findById(id)
        .populate("author", "username email")
        .populate("category", "name")
        .exec();
      post = await Post.findOne({ slug: id })
        .populate("author", "username email")
        .populate("category", "name")
        .exec();
    }
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  })
);

// POST /api/posts - create post
router.post(
  "/",
  [
    body("title")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Title is required"),
    body("content")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Content is required"),
    body("category").optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, content, featuredImage, excerpt, tags, category } = req.body;

    let categoryId = null;
    if (category) {
      // accept either category id or name
      const cat = await Category.findOne({
        $or: [{ _id: category }, { name: category }],
      }).exec();
      if (cat) categoryId = cat._id;
      else {
        // create the category automatically if not exists
        const newCat = await Category.create({ name: category });
        categoryId = newCat._id;
      }
    }

    const post = new Post({
      title,
      content,
      featuredImage,
      excerpt,
      tags,
      category: categoryId,
      // author: req.user._id (if auth is implemented)
      author: req.user ? req.user._id : null,
    });

    await post.save();
    res.status(201).json({ success: true, data: post });
  })
);

// PUT /api/posts/:id - update post
router.put(
  "/:id",
  [
    param("id").notEmpty(),
    body("title").optional().isString(),
    body("content").optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const update = req.body;

    // if category provided, resolve id
    if (update.category) {
      const cat = await Category.findOne({
        $or: [{ _id: update.category }, { name: update.category }],
      }).exec();
      if (cat) update.category = cat._id;
      else {
        const newCat = await Category.create({ name: update.category });
        update.category = newCat._id;
      }
    }

    const post = await Post.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .exec();

    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, data: post });
  })
);

// DELETE /api/posts/:id - delete post
router.delete(
  "/:id",
  [param("id").notEmpty()],
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const post = await Post.findByIdAndDelete(id).exec();
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });
    res.json({ success: true, message: "Post deleted" });
  })
);

module.exports = router;

router.delete("/:id", async (req, res) => {
  res.json({
    success: true,
    message: `Delete post ${req.params.id} - placeholder`,
  });
});

module.exports = router;
