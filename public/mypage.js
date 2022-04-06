import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './auth_google_signout.js'

const profile_img = document.getElementById('profile_img');
const uid_span = document.getElementById('uid_span');
const name_span = document.getElementById('name_span');
const email_span = document.getElementById('email_span');

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        
        console.log("Logged in user.");
        var uid = user.uid;

        const name = user.displayName;
        const email = user.email;
        const profile = user.photoURL;

        profile_img.setAttribute('src', profile);
        uid_span.innerText = uid;
        email_span.innerText = email;
        name_span.innerText = name;
    } else {
        console.log("No logged in user.");
        // User is signed out ...
    }
});
