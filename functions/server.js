const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = require('../serviceKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://phat-black-default-rtdb.firebaseio.com"
});

const corsHandler = cors({origin: true});

exports.deleteUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => { // Use corsHandler to wrap your async function
    if (req.method !== 'DELETE') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).send({ error: "User ID is required" });
      }

      // Retrieve the user document to get the username
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).send({ error: "User not found" });
      }
      const username = userDoc.data().username;

      // Delete the user from Firebase Authentication
      await admin.auth().deleteUser(userId);

      // Delete the user's document from "users" collection
      await admin.firestore().collection('users').doc(userId).delete();

      // Delete the user's username from "usernames" collection
      await admin.firestore().collection('usernames').doc(username).delete();

      res.status(200).send({ result: `User with ID ${userId} deleted successfully` });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send({ error: error.message });
    }
  });
});


// Setup Express app for API endpoints
const express = require('express');
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Define API routes for the Express app
const generateContent = require('./apiFunctions/Gemini');
app.post('/generateContent', generateContent);

// Export the Express API as a Cloud Function called "api"
exports.api = functions.https.onRequest(app);