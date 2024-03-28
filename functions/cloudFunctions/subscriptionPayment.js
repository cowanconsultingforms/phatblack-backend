require("dotenv").config();
const functions = require('firebase-functions');
const cors = require("cors");
const stripe = require('stripe')(process.env.SECRET_KEY);

// CORS handler to enable CORS
const corsHandler = cors({origin: true});

// Cloud Function to handle a subscription payment
const subscriptionPayment = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {// Use corsHandler to wrap async functions
    if (req.method !== "POST") {
        return res.status(405).send({error: "Method Not Allowed"});
    }
    let{payment, id} = req.body;
    try{
        //create payment
        const subscription = await stripe.paymenIntents.create({
            payment,
            currency: "USD",
            description: "PhatBlack Premium",
            payment_method: id,
            confirm: true,
        });
        //update users role to premium user after subscribing
        //await admin.firestore().collection("users").doc(role).update("premium_user");
        console.log("Payment amount: " + subscription);
        res.json({message: "Successfully Subscribed", success: true});
    } catch(error){
        res.json({message: "Processing Subscription Failed", success: false})
    }
    });
});

module.exports = subscriptionPayment;