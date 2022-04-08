import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getDatabase, ref, get, child} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
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

        const db = getDatabase();
        const dbRef = ref(db);

        var val = null;
        get(child(dbRef, `users/${uid}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    val = snapshot.val();

                    const name = val.username;
                    const gender = val.gender;
                    const email = val.email;
                    const profile = val.profile_picture;
                    const birth = val.birth;
                    const birth_y = val.birth.birth_year;
                    const birth_m = val.birth.birth_year;
                    const birth_d = val.birth.birth_year;

                    console.log(name);
                    console.log(gender);
                    console.log(email);
                    console.log(profile);
                    console.log(birth);

                    profile_img.setAttribute('src', profile);
                    uid_span.innerText = uid;
                    email_span.innerText = email;
                    name_span.innerText = name;
                } else {
                    console.log('Not in database');
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
