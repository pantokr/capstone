import './index.js'
import {getAuth, sendSignInLinkToEmail} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const register_btn = document.getElementById('register_btn');
function sendEmail() {
    const floating_email = document.getElementById('floating_email');
    const id_verification = document.getElementById('id_verification');

    if (floating_email.validity.valid) {

        var email = floating_email.value;

        id_verification.setAttribute('style', 'display:block');
        id_verification.innerText = email + "\n\n위 주소로 인증 메일을 전송했습니다.\n 메일을 확인해주세요";

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: "http://localhost:5500/",            // This must be true.
            handleCodeInApp: true
          };

        const auth = getAuth();
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                // The link was successfully sent. Inform the user. Save the email locally so
                // you don't need to ask the user for it again if they open the link on the same
                // device.
                window
                    .localStorage
                    .setItem('emailForSignIn', email);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ...
            });
    } else {
        id_verification.setAttribute('style', 'display:none');
    }
}
register_btn.addEventListener('click', sendEmail);