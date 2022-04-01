import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
// import { provider } from "./auth_google_provider_create.js"

const firebaseConfig = {
  apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
  authDomain: "meecord-223cc.firebaseapp.com",
  databaseURL: "https://meecord-223cc-default-rtdb.firebaseio.com",
  projectId: "meecord-223cc",
  storageBucket: "meecord-223cc.appspot.com",
  messagingSenderId: "291741382850",
  appId: "1:291741382850:web:b7893d764decad8933e35b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const signInWithGoogle = () => {

signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}

const signInWithGoogleButton = document.getElementById('gooLogin');
signInWithGoogleButton.addEventListener('click', signInWithGoogle);


