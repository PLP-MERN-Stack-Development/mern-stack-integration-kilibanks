const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("username").isString().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    const exists = await User.findOne({
      $or: [{ email }, { username }],
    }).exec();
    if (exists)
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });

    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res
      .status(201)
      .json({
        success: true,
        data: {
          user: { id: user._id, username: user.username, email: user.email },
          token,
        },
      });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      data: {
        user: { id: user._id, username: user.username, email: user.email },
        token,
      },
    });
  })
);

module.exports = router;
