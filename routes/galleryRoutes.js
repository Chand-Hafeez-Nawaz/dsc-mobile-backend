const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Gallery = require("../models/Gallery");

/* ================= CLOUDINARY STORAGE ================= */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "DSC_GALLERY",
      resource_type: isVideo ? "video" : "image",
    };
  },
});

const upload = multer({ storage });

/* ================= CREATE MULTIPLE MEDIA ================= */

router.post("/", upload.array("media", 20), async (req, res) => {
  console.log("FILES RECIEVED:",req.files)
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const mediaItems = [];

    for (const file of req.files) {
      const mediaType = file.mimetype.startsWith("video")
        ? "video"
        : "image";

      const newMedia = await Gallery.create({
        mediaType,
        media: file.path, // Cloudinary secure URL
      });

      mediaItems.push(newMedia);
    }

    res.status(201).json(mediaItems);
  } catch (error) {
    console.error("Gallery upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const media = await Gallery.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    console.error("Fetch gallery error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE ================= */

router.delete("/:id", async (req, res) => {
  try {
    const mediaItem = await Gallery.findById(req.params.id);

    if (!mediaItem) {
      return res.status(404).json({ message: "Not found" });
    }

    // Extract public_id safely
    const urlParts = mediaItem.media.split("/");
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicIdWithoutExtension = fileWithExtension.substring(
      0,
      fileWithExtension.lastIndexOf(".")
    );

    const publicId = `DSC_GALLERY/${publicIdWithoutExtension}`;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: mediaItem.mediaType === "video" ? "video" : "image",
    });

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete gallery error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;