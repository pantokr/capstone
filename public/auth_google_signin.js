import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './firebase_initialization.js'

const provider = new GoogleAuthProvider();
const auth = getAuth();

var btn = document.getElementById('gooLogin');

function signInGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken;
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
    const dbRef = ref(db);
    console.log(name);

    get(child(dbRef, `users/${uid}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log('Already in database.');
                window.location.href = './cover.html'
            } else {
                console.log('Not in database');
                window.location.href = "./register_google.html";
            }
        })
        .catch((error) => {
            console.error(error);
        })
}