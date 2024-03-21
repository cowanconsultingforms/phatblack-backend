const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const serviceAccount = require("../serviceKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://phat-black-default-rtdb.firebaseio.com"
});

// Cloud Function to delete a user
exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).send({ error: 'Method Not Allowed' });
    }

    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).send({ error: "User ID is required" });
      }

      // Step 1: Retrieve the user document to get the username
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).send({ error: "User not found" });
      }
      const username = userDoc.data().username;

      // Step 2: Delete the user from Firebase Authentication
      await admin.auth().deleteUser(userId);

      // Step 3: Delete the user's document from "users" collection
      await admin.firestore().collection('users').doc(userId).delete();

      // Step 4: Delete the user's username from "usernames" collection
      await admin.firestore().collection('usernames').doc(username).delete();

      res.status(200).send({ result: `User with ID ${userId} deleted successfully` });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send({ error: error.message });
    }
  });
});
