const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const cors = require('cors')({
    origin: true
});

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.addMessage = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const { name } = req.body;

        res.send({
            text: "HELLO " + "name"
        });
    });

    return res.status(200).json({"sdf":"dsfsd"});
});

exports.fullName = functions.https.onCall((data, context) => {
    const firstName = data.firstName;
    const lastName = data.lastName;

    return {
        firstName: firstName,
        lastName: lastName
    }
});

exports.greet = functions.https.onRequest((request, response) => {
    const { name } = request.body;
    response.send(`Hello ${name}`);
});

