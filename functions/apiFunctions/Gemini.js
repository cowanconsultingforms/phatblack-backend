const functions = require('firebase-functions');
const {GoogleGenerativeAI} = require("@google/generative-ai");
const cors = require('cors')({ origin: true });

const googleApiKey = functions.config().google.apikey;
const genAI = new GoogleGenerativeAI(googleApiKey);

async function generateContent(req, res) {
  const { query, model = "gemini-pro" } = req.body;
  try {
    const genModel = genAI.getGenerativeModel({ model });
    const results = await genModel.generateContent(query);
    res.json(results);
  } catch (error) {
    console.error("ERROR: ", error);
    res.status(500).send("ERROR, try again");
  }
}

module.exports = generateContent;