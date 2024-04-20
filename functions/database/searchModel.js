const mongoose = require("mongoose");

// We define the schema for our search data
const searchSchema = new mongoose.Schema({
  title: { // Used for searching / path to Firestore document
    type: String,
    required: true,
    unique: true,
  },
  description: { // Used for searching
    type: String,
  },
  tags: { // Used for searching
    type: [String],
  },
  timestamp: { // Used for sorting in the future
    type: Date,
    default: Date.now,
  },
  firestoreCollection: { // Used for returning path to Firestore collection
    type: String,
    required: true,
  },
});

const SearchData = mongoose.model("SearchData", searchSchema); // Create a model from the schema
module.exports = SearchData;
