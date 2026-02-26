const express = require("express");
const router = express.Router();
const multer = require("multer");
const Notice = require("../models/Notice");

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ✅ CREATE NOTICE
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const notice = new Notice({
      title,
      description,
      file: req.file ? req.file.path : null,
    });

    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    console.log("Notice Create Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ GET ALL NOTICES
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;