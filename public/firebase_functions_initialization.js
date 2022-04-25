// Import the functions you need from the SDKs you need
import { app } from './firebase_initialization.js';
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries Your web app's
// Firebase configuration
// Initialize Firebase
const functions = getFunctions(app);

const addMessage = httpsCallable(functions, 'addMessage');
addMessage({ name: "test_text" })
    .then((result) => {
        // Read result of the Cloud Function.
        /** @type {any} */
        
        console.log(result.text);
    })
    .catch((error) => {
        // Getting the Error details.
        const code = error.code;
        const message = error.message;
        const details = error.details;

        console.log(code);
        console.log(message);
        console.log(details);
    });