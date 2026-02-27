const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
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

/* ================= CREATE EVENT ================= */

router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    let fileUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "events",
      });

      fileUrl = result.secure_url;

      // delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      file: fileUrl,
    });

    res.json(newEvent);
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
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE EVENT ================= */

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const updateData = { title, description, date };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "events",
      });

      updateData.file = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= DELETE EVENT ================= */

router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;