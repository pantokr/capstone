import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getDatabase, ref, set} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './index.js';
// import './register_email_verification_complete.js';

const auth = getAuth();

const floating_email = document.getElementById('floating_email');
const floating_name = document.getElementById('floating_name');
const floating_birth_year = document.getElementById('floating_birth_year');
const floating_birth_month = document.getElementById('floating_birth_month');
const floating_birth_date = document.getElementById('floating_birth_date');
const floating_gender = document.getElementById('floating_gender');
const register_btn = document.getElementById('register_btn');

floating_name.addEventListener("invalid", () => {
    // 검증 후 폼 요소에 was-validated 클래스로 표시해 둔다
    document
        .forms[0]
        .classList
        .add("was-validated")
})

let today = new Date();

//year
var year = today.getFullYear();
for (var y = year - 10; y > year - 100; y--) {
    var newOpt = document.createElement('option');
    newOpt.innerText = y.toString();
    newOpt.setAttribute('value', y.toString());

    floating_birth_year.appendChild(newOpt);
}

// month
for (var m = 1; m <= 12; m++) {
    var newOpt = document.createElement('option');
    newOpt.innerText = m.toString();
    newOpt.setAttribute('value', m.toString());

    floating_birth_month.appendChild(newOpt);
}

var by = floating_birth_year.value;
var bm = floating_birth_month.value;

if ([
    1,
    3,
    5,
    7,
    8,
    10,
    12
].indexOf(Number(bm)) > -1) {
    for (var d = 1; d <= 31; d++) {

        var newOpt = document.createElement('option');
        newOpt.innerText = d;
        newOpt.setAttribute('value', d);

        floating_birth_date.appendChild(newOpt);
    }
} else {
    if (bm == 2) {
        if (by % 4 == 0 && by % 100 != 0 || by % 400 == 0) {
            for (var d = 1; d <= 29; d++) {

                var newOpt = document.createElement('option');
                newOpt.innerText = d;
                newOpt.setAttribute('value', d);

                floating_birth_date.appendChild(newOpt);
            }
        } else {
            for (var d = 1; d <= 28; d++) {

                var newOpt = document.createElement('option');
                newOpt.innerText = d;
                newOpt.setAttribute('value', d);

                floating_birth_date.appendChild(newOpt);
            }
        }
    } else {
        for (var d = 1; d <= 30; d++) {

            var newOpt = document.createElement('option');
            newOpt.innerText = d;
            newOpt.setAttribute('value', d);

            floating_birth_date.appendChild(newOpt);
        }
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {

        console.log("Logged in user.");

        const uid = user.uid;
        const name = user.displayName;
        const email = user.email;
        const profile = user.photoURL;

        floating_email.setAttribute('value', email);
        floating_name.setAttribute('value', name);

    } else {
        console.log("No logged in user.");
        // User is signed out ...
    }
});

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

function reloadDate() {

    while (floating_birth_date.hasChildNodes()) {
        floating_birth_date.removeChild(floating_birth_date.firstChild);
    }

    var by = floating_birth_year.value;
    var bm = floating_birth_month.value;

    if ([
        1,
        3,
        5,
        7,
        8,
        10,
        12
    ].indexOf(Number(bm)) > -1) {
        for (var d = 1; d <= 31; d++) {

            var newOpt = document.createElement('option');
            newOpt.innerText = d;
            newOpt.setAttribute('value', d);

            floating_birth_date.appendChild(newOpt);
        }
    } else {
        if (bm == 2) {
            if (by % 4 == 0 && by % 100 != 0 || by % 400 == 0) {
                for (var d = 1; d <= 29; d++) {

                    var newOpt = document.createElement('option');
                    newOpt.innerText = d;
                    newOpt.setAttribute('value', d);

                    floating_birth_date.appendChild(newOpt);
                }
            } else {
                for (var d = 1; d <= 28; d++) {

                    var newOpt = document.createElement('option');
                    newOpt.innerText = d;
                    newOpt.setAttribute('value', d);

                    floating_birth_date.appendChild(newOpt);
                }
            }
        } else {
            for (var d = 1; d <= 30; d++) {

                var newOpt = document.createElement('option');
                newOpt.innerText = d;
                newOpt.setAttribute('value', d);

                floating_birth_date.appendChild(newOpt);
            }
        }
    }
}

if (floating_birth_date) {
    floating_birth_month.addEventListener('change', reloadDate);
}

if (register_btn) {
    register_btn.addEventListener('click', writeUserData);
}