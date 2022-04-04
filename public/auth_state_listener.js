import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        location.href = "./cover.html";
        console.log(user.displayName);
        // ...
    } else {
        console.log("No logged in user.");

        // User is signed out ...
    }
});
// [END auth_state_listener_modular]