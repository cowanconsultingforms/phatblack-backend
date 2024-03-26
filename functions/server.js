const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const serviceAccount = require("../serviceKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://phat-black-default-rtdb.firebaseio.com",
});

// Import Cloud Functions
const deleteUser = require("./cloudFunctions/deleteUser");

// Export them as Cloud Functions
exports.deleteUser = deleteUser;

// Setup Express app for API endpoints
const express = require("express");
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// Import API functions and setup API endpoints
const generateContent = require("./apiFunctions/Gemini");
app.post("/generateContent", generateContent);

// Export the Express API as a Cloud Function called "api".
exports.api = functions.https.onRequest(app);
