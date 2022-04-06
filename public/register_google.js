import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './index.js';

const auth = getAuth();

const floating_email = document.getElementById('floating_email');
const floating_name = document.getElementById('floating_name');
const floating_birth_year = document.getElementById('floating_birth_year');
const floating_birth_month = document.getElementById('floating_birth_month');
const floating_birth_date = document.getElementById('floating_birth_date');
const floating_gender = document.getElementById('floating_gender');
const register_btn = document.getElementById('register_btn');

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("invalid", () => {
    // 검증 후 폼 요소에 was-validated 클래스로 표시해 둔다
    document.forms[0].classList.add("was-validated")
  })
})

let today = new Date();
for (var i = today.getFullYear() - 10; i > today.getFullYear() - 100; i--) {
  var newOpt = document.createElement('option');
  newOpt.innerText = i.toString();
  newOpt.setAttribute('value', i.toString());

  floating_birth_year.appendChild(newOpt);
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
      birth_date: birth_date,
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

if (register_btn) {
  register_btn.addEventListener('click', writeUserData);
}