const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);