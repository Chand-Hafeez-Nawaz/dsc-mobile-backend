const School = require("../models/School.js");

const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().select("-password");
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllSchools };