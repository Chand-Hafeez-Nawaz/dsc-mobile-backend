const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    file: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);