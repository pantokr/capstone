import {getAuth, signInWithPopup, GoogleAuthProvider} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getFirestore, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import "./firebase_initialization.js";

const provider = new GoogleAuthProvider();
const auth = getAuth();

var btn = document.getElementById("gooLogin");

function signInGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;

            const uid = user.uid;
            registerUserData(uid);
        })
        .catch((error) => {
            console.log('Google Login Error.');
        });
}

if (btn) {
    btn.addEventListener("click", signInGoogle);
}

async function registerUserData(uid) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        console.log(userSnap.data());
        window.location.href = "./cover";
    } else {
        console.log('No User.');
        window.location.href = "./register_google/register_google.html";
    }
}
