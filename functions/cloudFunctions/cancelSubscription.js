require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

const trialPlan = functions.config().stripe.trial;
const stripeKey = functions.config().stripe.key;
const stripe = require("stripe")(stripeKey);

// const stripe = require("stripe")(process.env.SECRET_KEY);


// CORS handler to enable CORS
const corsHandler = cors({origin: true});

// Cloud Function to handle cancelling a subscription
const cancelSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {// Use corsHandler to wrap async functions
    if (req.method !== "POST") {
      return res.status(405).send({error: "Method Not Allowed"});
    }
    const {user, subId, payId} = req.body;

    console.log(req.body);

    if (!subId && !payId) {
      return res.status(400).json({
        message: "Missing subcriptionId or paymentId",
        success: false,
      });
    }

    try {
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const price = sub.items.data[0].price.id;
        if (price === trialPlan) {
          // cancel immediately if subscription is free trial
          const subscription = await stripe.subscriptions.update(
              subId,
              {
                cancel_at_period_end: true,
              },
          );
          console.log(subscription);
        } else if (price === process.env.MONTHLY_PLAN_KEY) {
          // cancel at period end if subscription is monthly
          const subscription = await stripe.subscriptions.update(
              subId,
              {
                cancel_at_period_end: true,
              },
          );

          console.log(subscription);
        } else if (price === process.env.YEARLY_PLAN_KEY) {
          // cancel in 30 days
          const endDate = Math.floor(Date.now()/1000) + (30*24*60*60);

          const subscription = await stripe.subscriptions.update(
              subId,
              {
                cancel_at: endDate,
              },
          );

          console.log(subscription);
        }

        // succesful cancel
        console.log("Recurring subscription cancelled");

        // Update user's role to premium_user,
        // add custmer,
        // add subscription ID for cancelling purposes
        await admin.firestore().collection("users").doc(user).update({
          role: "user",
          subscriptionId: "",
          paymentId: "",
        });

        console.log("Subscription cancelled successfully");

        res.status(200).json({
          message: "Subscription cancelled successfully",
          success: true,
        });
      }

      if (payId) {
        // error if trying to cancel with lifetime subscription
        res.status(400).json({
          message: "No cancellations/refunds for lifetime subscription.",
          success: false,
        });
        return;
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        message: "Failed to cancel subscription",
        success: false,
      });
    }
  });
});

module.exports = cancelSubscription;
