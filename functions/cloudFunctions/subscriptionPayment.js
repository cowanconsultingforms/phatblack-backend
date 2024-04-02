// require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const stripe = require("stripe")(functions.config().stripe.key);

// CORS handler to enable CORS
const corsHandler = cors({origin: true});

// Cloud Function to handle a subscription payment
const subscriptionPayment = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {// Use corsHandler to wrap async functions
    if (req.method !== "POST") {
      return res.status(405).send({error: "Method Not Allowed"});
    }
    const {paymentCost, id, user} = req.body;
    try {
      // create payment
      const subscription = await stripe.paymentIntents.create({
        amount: paymentCost,
        currency: "usd",
        payment_method: id,
        automatic_payment_methods: {
          enabled: true,
        },
        description: "PhatBlack Premium",
        confirm: true,
      });
        // update users role to premium user after subscribing

      await admin.firestore().collection("users").doc(user).update({
        role: "premium_user",
      });
      console.log(subscription);
    } catch (error) {
      res.json({message: "Processing Subscription Failed", success: false});
      console.log(paymentCost, id, user);
    }
  });
});

module.exports = subscriptionPayment;
