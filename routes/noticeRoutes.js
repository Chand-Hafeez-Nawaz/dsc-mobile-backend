const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Notice = require("../models/Notice");

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// Accept ANY file type
const upload = multer({ storage });

/* ================= CREATE NOTICE ================= */

router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.body) {
      return res.status(400).json({ message: "Invalid form data" });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const notice = await Notice.create({
      title,
      description,
      file: req.file ? req.file.path : null,
    });

    res.status(201).json(notice);
  } catch (error) {
    console.error("Create Notice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL NOTICES ================= */

router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error("Fetch Notices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE NOTICE ================= */

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    console.log("UPDATE BODY:", req.body);
    console.log("UPDATE FILE:", req.file);

    const { title, description } = req.body || {};

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (req.file) updateData.file = req.file.path;

    const updated = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Notice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE NOTICE ================= */

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Delete Notice Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;