const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Notice = require("../models/Notice");
const cloudinary = require("../config/cloudinary");

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
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

    if (!title || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    let fileUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "notices",
      });

      fileUrl = result.secure_url;

      // delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const newNotice = await Notice.create({
      title,
      description,
      file: fileUrl,
    });

    res.json(newNotice);
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
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE NOTICE ================= */

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const updateData = { title, description };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "notices",
      });

      updateData.file = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE NOTICE ================= */

router.delete("/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;