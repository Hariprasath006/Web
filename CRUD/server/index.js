const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const UserAuth = require("./models/UserAuth");
const connectDB = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));

// Connect to MongoDB Atlas
connectDB();

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const user = await UserAuth.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected CRUD Routes
app.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete("/users/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    console.error("Error deleting user:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/users", auth, async (req, res) => {
  try {
    const { name, age, city } = req.body;
    if (!name || !age || !city) {
      return res.status(400).json({ message: "All fields required" });
    }
    const user = new User({ name, age, city });
    await user.save();
    return res.json({ message: "User details added successfully", _id: user._id });
  } catch (err) {
    console.error("Error adding user:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

app.patch("/users/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, age, city } = req.body;
    if (!name || !age || !city) {
      return res.status(400).json({ message: "All fields required" });
    }
    const updatedUser = await User.findByIdAndUpdate(id, { name, age, city }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "User details updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, (err) => {
  if (err) {
    console.error("Server startup error:", err.message);
    return;
  }
  console.log(`Server is running on port ${port}`);
});