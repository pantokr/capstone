import {
    getAuth,
    signInWithRedirect,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {getDatabase, ref, set} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
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
            // The signed-in user info.
            const user = result.user;
            const uid = user.uid;
            const name = user.displayName;
            const email = user.email;
            const photoURL = user.photoURL;
            const emailVerified = user.emailVerified;

            writeUserData(uid, name, email, photoURL);
            // ...
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
    // signInWithRedirect(auth, provider);
}

if (btn) {
    btn.addEventListener('click', signInGoogle);
}

function writeUserData(uid, name, email, photoUrl) {
    const db = getDatabase();
    set(ref(db, 'users/' + uid), {
        username: name,
        email: email,
        profile_picture: photoUrl
    })
        .then(() => {
            alert("User added succesfully");
        })
        .catch((error) => {
            alert("Error : " + error);
        });
    window.location.href = "./cover.html";
}