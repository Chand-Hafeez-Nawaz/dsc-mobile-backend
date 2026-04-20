const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const School = require("../models/School");

const {
  sendApprovalMail,
  sendRejectionMail,
} = require("../utils/sendSchoolMail");

/* ================= REGISTER SCHOOL ================= */

router.post("/register", async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;

    if (!name || !email || !contact || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await School.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "School already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await School.create({
      name,
      email,
      contact,
      password: hashedPassword,
      isApproved: false,
    });

    res.status(201).json({
      message: "Registration successful. Waiting for admin approval.",
    });
  } catch (error) {
    console.error("School Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN SCHOOL ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const school = await School.findOne({ email });
    if (!school) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!school.isApproved) {
      return res.status(403).json({
        message: "Your registration is not approved yet",
      });
    }

    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      role: "school",
      schoolId: school._id,
    });
  } catch (error) {
    console.error("School Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET PENDING SCHOOLS ================= */

router.get("/pending", async (req, res) => {
  try {
    const schools = await School.find({ isApproved: false }).sort({
      createdAt: -1,
    });

    res.json(schools);
  } catch (error) {
    console.error("Fetch Pending Schools Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET APPROVED SCHOOLS ================= */

router.get("/approved", async (req, res) => {
  try {
    const schools = await School.find({ isApproved: true }).sort({
      approvedAt: -1,
    });

    res.json(schools);
  } catch (error) {
    console.error("Fetch Approved Schools Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= APPROVE SCHOOL ================= */

router.put("/approve/:id", async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    console.log("APPROVING SCHOOL:", school);

    // 🔥 SEND MAIL
    await sendApprovalMail(school.email, school.name);

    res.json({ message: "School approved & email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ================= REJECT SCHOOL ================= */

router.delete("/reject/:id", async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // ✅ Mail should not break rejection
    try {
      await sendRejectionMail(school);
    } catch (mailError) {
      console.log("Mail failed but school rejected:", mailError.message);
    }

    await School.findByIdAndDelete(req.params.id);

    res.json({ message: "School rejected successfully" });
  } catch (error) {
    console.error("Reject School Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;