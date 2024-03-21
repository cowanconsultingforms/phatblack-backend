const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin with service account
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

      await admin.auth().deleteUser(userId);

      res.status(200).send({ result: `User with ID ${userId} deleted successfully` });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send({ error: error.message });
    }
  });
});
