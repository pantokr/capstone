import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {getDatabase, ref, get, child} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import './auth_google_signout.js'

const profile_img = document.getElementById('profile_img');
const uid_span = document.getElementById('uid_span');
const email_span = document.getElementById('email_span');
const name_span = document.getElementById('name_span');
const age_span = document.getElementById('age_span');
const gender_span = document.getElementById('gender_span');

// const modal = document.getElementById('modal');
const changed_name = document.getElementById('floatingName');
const changed_year = document.getElementById('floatingYear');
const changed_month = document.getElementById('floatingMonth');
const changed_date = document.getElementById('floatingDate');
const changed_gender = document.getElementById('floatingGender');
const updateBtn = document.getElementById('updateBtn');

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in user.");
        var uid = user.uid;

        const db = getDatabase();
        const dbRef = ref(db);
        
        console.log(db);
        console.log(dbRef);
        
        var val = null;

        get(child(dbRef, `users/${uid}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    val = snapshot.val();

                    const profile = val.profile_picture;
                    const name = val.username;
                    const email = val.email;
                    const birth = val.birth;
                    const birth_y = val.birth.birth_year;
                    const birth_m = val.birth.birth_month;
                    const birth_d = val.birth.birth_date;
                    const gender = val.gender;

                    console.log(profile);
                    console.log(email);
                    console.log(name);
                    console.log(birth);
                    console.log(gender);
                    console.log(birth_y);
                    console.log(birth_m);
                    console.log(birth_d);

                    profile_img.setAttribute('src', profile);

                    uid_span.innerText = uid;
                    email_span.innerText = email;
                    name_span.innerText = name;
                    age_span.innerText = `${birth_y} . ${birth_m} . ${birth_d}`;
                    gender_span.innerText = gender === "male" ? "남자" : "여자";

                    changed_name.value = name;
                    changed_year.value = birth_y;
                    changed_month.value = birth_m;
                    changed_date.value = birth_d;
                    changed_gender.value = gender;

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
function handleUpdateonClick(){
    
    document.querySelector(".modal").classList.add("hidden");

    
    name_span.innerText = changed_name.value;
    age_span.innerText = `${changed_year.value} . ${changed_month.value} . ${changed_date.value}`;
    gender_span.innerText = changed_gender.value === "male" ? "남자" : "여자";
    
    
}
updateBtn.addEventListener("click", handleUpdateonClick);