import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import "./index.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in user.");
        const db = getDatabase();
        const dbRef = ref(db);
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                var uid = user.uid;
                var name = snapshot.val().userName;
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    } else {
        console.log("No logged in user.");
        // User is signed out ...
    }
});

// if (user) {     return history.push("/todos")   } else {     firebase .auth()
// .signInWithPopup(provider)       .then(() => { history.push("/todos") })   }
// [END auth_state_listener_modular]