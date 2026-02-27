const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");

/* ================= MULTER CONFIG ================= */

// Storage configuration
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

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

/* ================= CREATE EVENT ================= */

router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw", // important for docs
      folder: "events",
    });

    await Event.create({
      title,
      description,
      date,
      file: result.secure_url,
    });

    res.json({ message: "Event created successfully" });

  } catch (error) {
    console.log("CREATE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= GET ALL EVENTS ================= */

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE EVENT ================= */

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const updateData = {
      title,
      description,
      date,
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "events",
      });

      updateData.file = result.secure_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);

  } catch (error) {
    console.log("UPDATE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE EVENT ================= */

router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });

  } catch (error) {
    console.log("DELETE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;