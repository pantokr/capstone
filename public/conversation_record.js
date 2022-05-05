import "./firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";



const url = new URL(window.location.href);
const urlParams = url.searchParams;
const roomId = urlParams.get("roomCode");
const auth = getAuth();
const db = getFirestore();

let myName = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        myName = user.displayName;
        console.log("1", user.name);
        showChats();
    } else {
        console.log("No User.");
    }
});


async function showChats() {
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);
    const querySnapshot = await getDocs(collection(chatRef, "speeches"));

    querySnapshot.forEach((doc) => {
        let parsed_data = JSON.parse(JSON.stringify(doc.data()));
        let speecher = parsed_data.speecher;
        let text = parsed_data.text;
        console.log(myName);
        if (speecher == myName) {
            let myBox = document.createElement("div");
            myBox.setAttribute("class", "myBox");

            let myText = document.createElement("div");

            myText.setAttribute("id", "myText");
            myText.textContent = text;

            console.log("my text: ", myText.textContent);

            myBox.append(myText);
            document
                .querySelector(".chatLog")
                .append(myBox);

        } else {
            let oppBox = document.createElement('div');
            oppBox.setAttribute("class", "oppBox");

            let oppText = document.createElement('div');
            oppText.setAttribute("id", "oppText");
            oppText.textContent = text;
            console.log("opponent text : ", oppText.textContent);
            oppBox.append(oppText);
            document
                .querySelector('.chatLog')
                .append(oppBox);

        }
        let minbox = document.querySelector(".min-content");
        minbox.scrollTop = minbox.scrollHeight;

        // // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
    });
}