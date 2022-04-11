// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries Your web app's
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
    authDomain: "meecord-223cc.firebaseapp.com",
    databaseURL: "https://meecord-223cc-default-rtdb.firebaseio.com",
    projectId: "meecord-223cc",
    storageBucket: "meecord-223cc.appspot.com",
    messagingSenderId: "291741382850",
    appId: "1:291741382850:web:d91f54be8c6b004733e35b"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {
    app
}