const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const createDefaultAdmin = async () => {
  const existing = await User.findOne({ email: "admin@mobile.in" });

  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "admin@mobile.in",
      password: hashed,
    });
    console.log("Mobile Admin Created");
  }
};

module.exports = { login, createDefaultAdmin };