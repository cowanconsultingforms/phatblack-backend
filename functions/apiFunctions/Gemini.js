const functions = require("firebase-functions");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const googleApiKey = functions.config().google.apikey;
const genAI = new GoogleGenerativeAI(googleApiKey);

/**
 * Generates content using a specified model from Google Generative AI.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 */
async function generateContent(req, res) {
  console.log("Request body:", req.body);
  const {query, model = "gemini-pro"} = req.body;
  try {
    const genModel = genAI.getGenerativeModel({model});
    const results = await genModel.generateContent({query});
    res.json(results);
  } catch (error) {
    console.error("ERROR: ", error);
    res.status(500).send("ERROR, try again");
  }
}

module.exports = generateContent;
