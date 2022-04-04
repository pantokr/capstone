import {
    getAuth,
    signInWithRedirect,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {provider} from './auth_google_provider_create.js';

const auth = getAuth();

var btn = document.getElementById('gooLogin');

function signInGoogle() {
    setPersistence(auth, browserSessionPersistence)
        .then(() => {
            return signInWithPopup(auth, provider);
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
        });

    // signInWithRedirect(auth, provider);
}
btn.addEventListener('click', signInGoogle);
