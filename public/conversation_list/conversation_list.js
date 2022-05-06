import "../firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
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
    let cnt = 1;

    const userCol = collection(db, "users");
    const userRef = doc(userCol, uid);
    const querySnapshot = await getDocs(collection(userRef, "chat_logs"));

    querySnapshot.forEach((doc) => {
        let parsed_data = JSON.parse(JSON.stringify(doc.data()));

        const list_componentouter = document.querySelector('.list_componentouter');
        let li = document.createElement('li');
        let a = document.createElement('a');
        let num = document.createElement('button');
        let roomCode = document.createElement('button');
        let date = document.createElement('button');
        let opponent = document.createElement('button');

        li.setAttribute("class", "list_item");
        a.setAttribute("class", "list_row");
        num.setAttribute("class", "con_list");
        num.setAttribute("style", "width:10%;");
        roomCode.setAttribute("class", "con_list");
        roomCode.setAttribute("style", "width:40%;");
        date.setAttribute("class", "con_list");
        date.setAttribute("style", "width:30%;");
        opponent.setAttribute("class", "con_list");
        opponent.setAttribute("style", "width:20%;");

        num.innerText += cnt;
        cnt += 1;
        roomCode.innerText += parsed_data.roomID;
        date.innerText += doc.id;
        opponent.innerText += parsed_data.opponent;

        a.href = "../conversation_record/?roomCode=" 
            + parsed_data.roomID 
            + "&date=" + doc.id
            + "&opponent=" + parsed_data.opponent;

        console.log(a.herf);
        a.append(num);
        a.append(roomCode);
        a.append(date);
        a.append(opponent);
        li.append(a);
        list_componentouter.appendChild(li);


        // // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
    });
}