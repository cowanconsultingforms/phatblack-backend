const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  tags: {
    type: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  firestoreCollection: {
    type: String,
    required: true,
  },
});

const SearchData = mongoose.model("SearchData", searchSchema);
module.exports = SearchData;
