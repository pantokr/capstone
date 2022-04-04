import {getAuth, signInWithPopup, GoogleAuthProvider} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {provider} from './auth_google_provider_create.js';

const auth = getAuth();

var btn = document.getElementById('gooLogin');

function signInGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google
            // API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info. ...
        })
        .catch((error) => {
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
btn.addEventListener('click', signInGoogle);
