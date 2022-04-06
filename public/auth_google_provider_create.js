import {GoogleAuthProvider} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/user.gender.read');

export {
    provider
};