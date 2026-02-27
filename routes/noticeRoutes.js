const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Notice = require("../models/Notice");
const cloudinary = require("../config/cloudinary");

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

const upload = multer({ storage });

/* ================= CREATE NOTICE ================= */

router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw", // important for pdf/doc/docx
      folder: "notices",
    });

    await Notice.create({
      title,
      description,
      file: result.secure_url,
    });

    res.json({ message: "Notice created successfully" });

  } catch (error) {
    console.log("CREATE NOTICE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET ALL NOTICES ================= */

router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.log("Fetch Notices Error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE NOTICE ================= */

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const updateData = {
      title,
      description,
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "notices",
      });

      updateData.file = result.secure_url;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(updatedNotice);

  } catch (error) {
    console.log("UPDATE NOTICE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE NOTICE ================= */

router.delete("/:id", async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);

    if (!deletedNotice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });

  } catch (error) {
    console.log("DELETE NOTICE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;