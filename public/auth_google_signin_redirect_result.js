import {getAuth, getRedirectResult, GoogleAuthProvider} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const auth = getAuth();
getRedirectResult(auth)
    .then((result) => {
        const user = result.user;
        if (!user) {
            // User not logged in, start login.
            // firebase.auth().signInWithRedirect(provider);
          } else {
            // user logged in, go to home page.
            console.log(user.displayName);
            location.href = "./cover.html";
          }
        // // This gives you a Google Access Token. You can use it to access Google APIs.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;

        // // The signed-in user info.
        // const user = result.user;

        // location.href = "./cover.html";
        // console.log(user.displayName);
    })
    .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
    });