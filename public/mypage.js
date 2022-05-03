import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import './auth_google_signout.js'

const auth = getAuth();

const profile_img = document.getElementById('profile_img');
const uid_span = document.getElementById('uid_span');
const email_span = document.getElementById('email_span');
const name_span = document.getElementById('name_span');
const age_span = document.getElementById('age_span');
const gender_span = document.getElementById('gender_span');

// const modal = document.getElementById('modal');
const floating_name = document.getElementById('floating_name');
const floating_birth_year = document.getElementById('floating_birth_year');
const floating_birth_month = document.getElementById('floating_birth_month');
const floating_birth_date = document.getElementById('floating_birth_date');
const floating_gender = document.getElementById('floating_gender');
const updateBtn = document.getElementById('update_btn');

floating_name.addEventListener("invalid", () => {
    // 검증 후 폼 요소에 was-validated 클래스로 표시해 둔다
    document
        .forms[0]
        .classList
        .add("was-validated")
})

settleBirthForm();
// 여기부터 99줄까지 날짜박스 코드

onAuthStateChanged(auth, (user) => {
    if (user) {
        var uid = user.uid;

        getUserData(uid);

    } else {
        console.log("No User.");
    }
});

const open = () => {
    document
        .querySelector(".modal")
        .classList
        .remove("hidden");
}

const close = () => {
    document
        .querySelector(".modal")
        .classList
        .add("hidden");
}

document
    .querySelector(".openBtn")
    .addEventListener("click", open);
document
    .querySelector(".close")
    .addEventListener("click", close);
document
    .querySelector(".bg")
    .addEventListener("click", close);

updateBtn.addEventListener("click", handleUpdateonClick);

// 달이 바뀌면 날짜가 바뀌는 함수 달이 바뀌면 그 달의 날짜도 바뀜 (31일 or 30일 or 29/28일 ...)
if (floating_birth_date) {
    floating_birth_month.addEventListener('change', reloadDate);
}

function settleBirthForm() {
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
    var month_31 = [
        1,
        3,
        5,
        7,
        8,
        10,
        12
    ];

    //date
    if (month_31.indexOf(Number(bm)) > -1) {
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

function reloadDate() {

    while (floating_birth_date.hasChildNodes()) {
        floating_birth_date.removeChild(floating_birth_date.firstChild);
    }

    var by = floating_birth_year.value;
    var bm = floating_birth_month.value;
    var month_31 = [
        1,
        3,
        5,
        7,
        8,
        10,
        12
    ];

    if (month_31.indexOf(Number(bm)) > -1) {
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

function handleUpdateonClick() {

    document
        .querySelector(".modal")
        .classList
        .add("hidden");

    name_span.innerText = floating_name.value;
    age_span.innerText = `${floating_birth_year.value} . ${floating_birth_month.value} . ${floating_birth_date.value}`;
    gender_span.innerText = floating_gender.value === "male"
        ? "남자"
        : "여자";

    setUserData();

}

function getUserData(uid) {
    const db = getFirestore();
    getDoc(doc(db, 'users', uid))
        .then((snapshot) => {
            if (snapshot.exists()) {
                var val = snapshot.data();

                const profile = val.profile_picture;
                const name = val.username;
                const email = val.email;
                const birth = val.birth;
                const birth_y = val.birth.birth_year;
                const birth_m = val.birth.birth_month;
                const birth_d = val.birth.birth_date;
                const gender = val.gender;

                profile_img.setAttribute('src', profile);

                uid_span.innerText = uid;
                email_span.innerText = email;
                name_span.innerText = name;
                age_span.innerText = `${birth_y} . ${birth_m} . ${birth_d}`;
                gender_span.innerText = gender === "male"
                    ? "남자"
                    : "여자";

            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function setUserData() {

    const db = getFirestore();
    const user = auth.currentUser;

    const uid = user.uid;
    const email = user.email;
    const profile = user.photoURL;

    const name = floating_name.value;
    const birth_year = floating_birth_year.value;
    const birth_month = floating_birth_month.value;
    const birth_date = floating_birth_date.value;
    const gender = floating_gender.value;

    setDoc(doc(db, 'users', uid), {
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
        .then(() => {
            console.log('Modified.');
        })
        .catch((error) => {
            console.error(error);
        });
}
