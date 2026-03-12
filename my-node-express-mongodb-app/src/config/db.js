const mongoose = require("mongoose");

// Connects Mongoose to MongoDB using the URI provided in the environment.
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  // Fail early with a clear message if the .env file is missing the DB URI.
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  // Open the MongoDB connection used by the rest of the backend.
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");
}

module.exports = connectDB;
