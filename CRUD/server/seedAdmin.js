const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserAuth = require("./models/UserAuth");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();
  try {
    const username = "admin";
    const password = "admin123"; // Change this to a secure password
    const existingUser = await UserAuth.findOne({ username });
    if (existingUser) {
      console.log("Admin user already exists");
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new UserAuth({ username, password: hashedPassword });
    await admin.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err.message);
    process.exit(1);
  }
};

seedAdmin();