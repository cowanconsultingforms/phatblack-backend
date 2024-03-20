const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.receiveMessage = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    if (request.method !== 'POST') {
      return response.status(405).send('Method Not Allowed');
    }

    console.log(request.body.message);

    response.send({result: `Message received: ${request.body.message}`});
  });
});
