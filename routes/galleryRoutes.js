const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Gallery = require("../models/Gallery");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= UPLOAD ================= */

router.post("/", upload.array("media", 20), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedItems = [];

    for (let file of files) {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        async (error, result) => {
          if (error) throw error;

          const newItem = await Gallery.create({
            url: result.secure_url,
            type: result.resource_type === "video" ? "video" : "image",
          });

          uploadedItems.push(newItem);
        }
      );

      result.end(file.buffer);
    }

    res.status(201).json(uploadedItems);
  } catch (error) {
    console.error("Gallery Upload Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    console.error("Fetch Gallery Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;