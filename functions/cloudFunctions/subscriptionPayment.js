// require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

const stripeKey = functions.config().stripe.key;
const monthlyPlan = functions.config().stripe.monthly;
const yearlyPlan = functions.config().stripe.yearly;
const stripe = require("stripe")(stripeKey);
// const stripe = require("stripe")(process.env.SECRET_KEY);


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
      // Fetch user's email from Firestore
      const u = await admin.firestore().collection("users").doc(user).get();
      const userData = u.data();
      const userEmail = userData.email;

      // Create a customer
      const customer = await stripe.customers.create({
        payment_method: id,
        email: userEmail,
        invoice_settings: {
          default_payment_method: id,
        },
      });

      if (paymentCost === 100) {
        // Current time variable for billing cycle
        const currentTime = Math.floor(Date.now() / 1000);

        // Create a subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{price: monthlyPlan}],
          billing_cycle_anchor: currentTime,
        });

        console.log("Recurring subscription created:", subscription);

        // Update user's role to premium_user and add customer ID
        await admin.firestore().collection("users").doc(user).update({
          role: "premium_user",
          customerId: customer.id,
        });

        console.log("Payment completed successfully");

        res.status(200).json({
          message: "Payment completed successfully",
          success: true,
        });
      } else if (paymentCost === 0) {
        // Create a subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{price: monthlyPlan}],
          trial_period_days: 30,
        });

        console.log("1 month free trial subscription created:", subscription);

        // Update user's role to premium_user and add customer ID
        await admin.firestore().collection("users").doc(user).update({
          role: "premium_user",
          customerId: customer.id,
        });

        console.log("1 month free trial subscription completed successfully");

        res.status(200).json({
          message: "Free trial + payment successful",
          success: true,
        });
      } else if (paymentCost === 1080) {
        // Current time variable for billing cycle
        const currentTime = Math.floor(Date.now() / 1000);

        // Create a subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{price: yearlyPlan}],
          billing_cycle_anchor: currentTime,
        });

        console.log("Recurring subscription created:", subscription);

        // Update user's role to premium_user and add customer ID
        await admin.firestore().collection("users").doc(user).update({
          role: "premium_user",
          customerId: customer.id,
        });

        console.log("Payment and subscription completed successfully");

        res.status(200).json({
          message: "Payment completed successfully",
          success: true,
        });
      } else if (paymentCost === 100000) {
        // Handle lifetime subscription non-recurring
        const paymentIntent = await stripe.paymentIntents.create({
          amount: paymentCost, // Amount in cents
          currency: "usd",
          customer: customer.id,
          payment_method: id,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          confirm: true,
          description: "Lifetime Subscription",
        });

        console.log("One time payment subscription created:", paymentIntent);

        // Update user's role to premium_user and add customer ID
        await admin.firestore().collection("users").doc(user).update({
          role: "premium_user",
          customerId: customer.id,
        });

        console.log("Payment and subscription completed successfully");

        res.status(200).json({
          message: "Lifetime paymentcompleted successfully",
          success: true,
        });
      }
    } catch (error) {
      console.error("Error handling subscription payment:", error);
      res.status(500).json({
        message: "Failed to handle subscription payment",
        success: false,
      });
    }
  });
});

module.exports = subscriptionPayment;
