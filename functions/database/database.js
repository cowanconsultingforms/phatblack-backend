const functions = require("firebase-functions");
const mongoose = require("mongoose");
const mongoURI = functions.config().mongo.uri;

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await mongoose.model("SearchData").createIndexes();
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
