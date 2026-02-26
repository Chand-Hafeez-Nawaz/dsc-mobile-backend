const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String, // 🔥 REQUIRED for Cloudinary delete
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);