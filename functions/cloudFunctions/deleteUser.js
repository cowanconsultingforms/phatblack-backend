const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

// CORS handler to enable CORS
const corsHandler = cors({origin: true});

// Cloud Function to delete a user
const deleteUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    if (req.method !== "DELETE") {
      return res.status(405).end("Method Not Allowed");
    }

    (async () => {
      try {
        const {userId} = req.body;
        if (!userId) {
          return res.status(400).send({error: "User ID is required"});
        }

        // Retrieve the user document to get the username
        const usersCol = admin.firestore().collection("users");
        const userDoc = await usersCol.doc(userId).get();
        if (!userDoc.exists) {
          return res.status(404).send({error: "User not found"});
        }
        const username = userDoc.data().username;

        // Delete the user from Firebase Authentication
        await admin.auth().deleteUser(userId);

        // Delete the user's document from "users" collection
        await admin.firestore().collection("users").doc(userId).delete();

        // Attempt to delete the user's username from "usernames" collection
        await admin.firestore().collection("usernames").doc(username).delete();

        // Sending response after all operations
        res.status(200).send({message: "User successfully deleted"});
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send({error: error.message});
      }
    })();
  });
});


module.exports = deleteUser;
