require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* ================= MIDDLEWARES ================= */

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= ENSURE UPLOADS FOLDER ================= */

const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(uploadPath));

/* ================= ROOT ROUTE ================= */

app.get("/", (req, res) => {
  res.json({ message: "Mobile Backend Running" });
});

/* ================= ROUTES ================= */

const noticeRoutes = require("./routes/noticeRoutes");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const schoolRoutes = require("./routes/schoolRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/schools", schoolRoutes);

/* ================= DATABASE & SERVER START ================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected (Mobile DB)");

    const { createDefaultAdmin } = require("./controllers/AuthController");
    await createDefaultAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed ❌");
    console.error(err.message);
  });