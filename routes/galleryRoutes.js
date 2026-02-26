const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Gallery = require("../models/Gallery");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= UPLOAD ================= */

router.post("/", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary using promise wrapper
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const newItem = await Gallery.create({
      url: result.secure_url,
      public_id: result.public_id, // REQUIRED for delete
      type: result.resource_type === "video" ? "video" : "image",
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Gallery Upload Error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    console.error("Fetch Gallery Error:", error);
    res.status(500).json({ message: "Server error while fetching gallery" });
  }
});

/* ================= DELETE ================= */

router.delete("/:id", async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete from Cloudinary
    if (galleryItem.public_id) {
      await cloudinary.uploader.destroy(galleryItem.public_id, {
        resource_type:
          galleryItem.type === "video" ? "video" : "image",
      });
    }

    // Delete from MongoDB
    await Gallery.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Gallery Error:", error);
    res.status(500).json({ message: "Server error while deleting" });
  }
});

module.exports = router;