const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Visit = require("../models/Visit");
const School = require("../models/School");

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

/* ================= CREATE VISIT REQUEST ================= */

router.post(
  "/request",
  upload.single("file"),
  async (req, res) => {
    try {
      const { schoolId, students, visitDate, remarks } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File required" });
      }

      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      const visit = await Visit.create({
        school: school._id,
        schoolName: school.name,
        students,
        visitDate,
        remarks,
        studentFile: req.file.path,
      });

      res.status(201).json({
        message: "Visit request submitted",
        visit,
      });
    } catch (error) {
      console.error("Visit Request Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= GET ALL VISITS ================= */

router.get("/all", async (req, res) => {
  try {
    const pending = await Visit.find({ status: "pending" }).sort({
      createdAt: -1,
    });

    const completed = await Visit.find({
      status: { $in: ["approved", "rejected"] },
    }).sort({ updatedAt: -1 });

    res.json({ pending, completed });
  } catch (error) {
    console.error("Fetch Visits Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE STATUS ================= */

router.put("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    visit.status = status;
    await visit.save();

    res.json({ message: "Visit updated successfully" });
  } catch (error) {
    console.error("Update Visit Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SCHOOL VISITS ================= */

router.get("/school/:schoolId", async (req, res) => {
  try {
    const visits = await Visit.find({
      school: req.params.schoolId,
    }).sort({ createdAt: -1 });

    res.json(visits);
  } catch (error) {
    console.error("School Visits Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;