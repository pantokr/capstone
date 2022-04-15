import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in user.");
    } else {
        console.log("No logged in user.");
    }
});
