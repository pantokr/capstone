import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getDatabase, ref, set} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './firebase_initialization.js';

const auth = getAuth();
function writeUserData() {

    const db = getDatabase();
    const user = auth.currentUser;

    const uid = user.uid;
    const email = user.email;
    const profile = user.photoURL;

    const name = floating_name.value;
    const birth_year = floating_birth_year.value;
    const birth_month = floating_birth_month.value;
    const birth_date = floating_birth_date.value;
    const gender = floating_gender.value;

    set(ref(db, 'users/' + uid), {
        username: name,
        email: email,
        profile_picture: profile,
        birth: {
            birth_year: birth_year,
            birth_month: birth_month,
            birth_date: birth_date
        },
        gender: gender
    })
        .then((success) => {
            window.location.href = "./cover.html";
        })
        .catch((error) => {
            console.error(error);
        });
}