import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getDatabase, ref, get, child, set} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './auth_google_signout.js'

const profile_img = document.getElementById('profile_img');
const uid_span = document.getElementById('uid_span');
const name_span = document.getElementById('name_span');
const email_span = document.getElementById('email_span');

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in user.");
        const db = getDatabase();
        const dbRef = ref(db);
        get(child(dbRef, `users/${user.uid}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    var uid = user.uid;
                    var val = snapshot.val();

                    var name = val.username;
                    var email = val.email;
                    var profile = val.profile_picture;

                    profile_img.setAttribute('src', profile);
                    uid_span.innerText = uid;
                    email_span.innerText = email;
                    name_span.innerText = name;
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        console.log("No logged in user.");
        // User is signed out ...
    }
});
