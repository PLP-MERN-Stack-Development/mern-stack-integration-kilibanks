const express = require("express");
const multer = require("multer");
const path = require("path");

const uploadDir = process.env.UPLOAD_DIR || "uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", uploadDir));
  },
  filename: function (req, file, cb) {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res
    .status(201)
    .json({ success: true, data: { url, filename: req.file.filename } });
});

module.exports = router;
