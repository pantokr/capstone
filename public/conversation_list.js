import "./firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


const auth = getAuth();
const db = getFirestore();

let uid = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        printDocData();
    } else {
        console.log("No User.");
    }
});

async function printDocData() {
    const userCol = collection(db, "users");
    const userRef = doc(userCol, uid);
    // const chatLogCol = collection(userRef, "chat_logs");
    const querySnapshot = await getDocs(collection(userRef, "chat_logs"));
    querySnapshot.forEach((doc) => {
        let parsed_data = JSON.parse(JSON.stringify(doc.data()));

        const list_componentouter = document.querySelector('.list_componentouter');
        let li = document.createElement('li');
        let a = document.createElement('a');
        let num = document.createElement('div');
        let roomCode = document.createElement('div');
        let date = document.createElement('div');
        let length = document.createElement('div');

        li.setAttribute("class", "list_item");
        a.setAttribute("class", "list_row");
        num.setAttribute("class", "num");
        roomCode.setAttribute("class", "roomCode");
        date.setAttribute("class", "date");
        length.setAttribute("class", "length");

        console.log(parsed_data.roomID);

        a.append(num);
        a.append(roomCode);
        a.append(date);
        a.append(length);
        li.append(a);
        console.log("OK");
        list_componentouter.appendChild(li);

        roomCode.innerText += parsed_data.roomID;
        

        // // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
    });
}