import {getAuth, signOut} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const auth = getAuth();
const btn = document.getElementById('logout_btn');

function signOutGoogle() {
    signOut(auth)
        .then(() => {
            // Sign-out successful.
            location.href = "./index.html";
        })
        .catch((error) => {
            // An error happened.
        });
}

btn.addEventListener('click', signOutGoogle);

export {
    signOutGoogle
};