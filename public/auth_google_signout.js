import {getAuth, signOut} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import './index.js';
const auth = getAuth();

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

const btn = document.getElementById('signout_btn');
if(btn){
    btn.addEventListener('click', signOutGoogle);
}

export {
    signOutGoogle
};