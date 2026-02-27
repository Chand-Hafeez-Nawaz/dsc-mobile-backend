const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    schoolName: {
      type: String,
      required: true,
    },

    students: {
      type: Number,
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    remarks: {
      type: String,
    },

    studentFile: {
      type: String, // file path
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);