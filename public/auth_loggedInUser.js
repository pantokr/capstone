import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
 
const auth = getAuth();
const user = auth.currentUser;
if (!user) {
    alert('No logged in user');
}
else {
    alert("Yes logged in user");
}
