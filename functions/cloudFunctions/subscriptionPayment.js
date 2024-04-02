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
    let{paymentCost, id, user} = req.body;
    try{
        //create payment
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
        //update users role to premium user after subscribing
        await admin.firestore().collection("users").doc(user).update({
            role: "premium_user",
        });
        console.log(subscription);
        res.json({message: "Successfully Subscribed", success: true});
    } catch(error){
        res.json({message: "Processing Subscription Failed", success: false});
        console.log(paymentCost, id, user);
    }
    });
});

module.exports = subscriptionPayment;