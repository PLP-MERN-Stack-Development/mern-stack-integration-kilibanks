const express = require("express");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../models/Category");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 }).exec();
    res.json({ success: true, data: categories });
  })
);

router.post(
  "/",
  [
    body("name")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Name is required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    const existing = await Category.findOne({ name }).exec();
    if (existing)
      return res
        .status(409)
        .json({ success: false, error: "Category already exists" });

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  })
);

module.exports = router;
