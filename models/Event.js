const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    file: {
      type: String, // stores file path
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);