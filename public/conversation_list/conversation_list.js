import "../firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


const auth = getAuth();
const db = getFirestore();

let uid = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        printDocData();
        console.log(uid);
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
        let checkbox = document.createElement("input");


        li.setAttribute("class", "list_item");
        a.setAttribute("class", "list_row");
        num.setAttribute("class", "con_list");
        num.setAttribute("style", "width:5%;");
        roomCode.setAttribute("class", "con_list");
        roomCode.setAttribute("style", "width:35%;");
        date.setAttribute("class", "con_list");
        date.setAttribute("style", "width:30%;");
        opponent.setAttribute("class", "con_list");
        opponent.setAttribute("style", "width:20%;");

        checkbox.setAttribute("class", "check");
        checkbox.setAttribute("id", doc.id);
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("style", "width:10%; position: absolute;  padding-left : 1rem;  margin-top: 0.48rem; display: none;");

        num.innerText += cnt;
        cnt += 1;
        roomCode.innerText += parsed_data.roomID;
        date.innerText += doc.id;
        opponent.innerText += parsed_data.opponent;

        a.href = "../conversation_record/?roomCode="
            + parsed_data.roomID
            + "&date=" + doc.id
            + "&opponent=" + parsed_data.opponent;

        // console.log(a.herf);
        a.append(num);
        a.append(roomCode);
        a.append(date);
        a.append(opponent);
        a.append(checkbox);
        li.append(a);

        list_componentouter.appendChild(li);

        let line = document.createElement("div");
        line.setAttribute("class", "line");
        list_componentouter.appendChild(line);

    });
}
function showCheck() {
    var check = document.getElementsByClassName("check");
    for (var i = 0; i < check.length; i++) {
        check[i].style.display = "inline-block";

    }
}
function hiddenCheck() {
    var check = document.getElementsByClassName("check");
    for (var i = 0; i < check.length; i++) {
        check[i].style.display = "none";

    }
}
//편집 버튼
document.querySelector('.edit').addEventListener("click", edit);

async function edit() {
    document.querySelector('.edit').style.display = "none";
    document.querySelector('.delete').style.display = "inline-block";
    document.querySelector('.cancel').style.display = "inline-block";

    showCheck();

}
//취소 버튼
document.querySelector('.cancel').addEventListener("click", handleCancelDeleteBtn);
//삭제 버튼
document.querySelector('.delete').addEventListener("click", deleteList);

function handleCancelDeleteBtn() {
    hiddenCheck();
    document.querySelector('.edit').style.display = "inline-block";
    document.querySelector('.delete').style.display = "none";
    document.querySelector('.cancel').style.display = "none";
}

async function deleteList() {
    const userCol = collection(db, "users");
    const userRef = doc(userCol, uid);
    let logCol = collection(userRef, "chat_logs");
    const querySnapshot = await getDocs(collection(userRef, "chat_logs"));


    querySnapshot.forEach(async (docum) => {
        const checkbox = document.getElementById(docum.id);
        if (checkbox.checked) {
            await deleteDoc(doc(db, "users", uid, "chat_logs", docum.id));
        }
    });
    setTimeout("window.location.reload()", 1000);
}

document.querySelector('.icon_search').addEventListener("click", filter);

function filter() {

    console.log("click!");
    var value, name, item, i, s, option, idx;


    value = document.getElementById("input_search_text").value.toUpperCase();
    console.log("value : ", value);


    s = document.querySelector("select");
    console.log(s);
    option = s.options[s.selectedIndex].value;
    console.log("option : ", option);


    if (option == 'opponent') {
        idx = 3;
    }
    else if (option == 'date') {
        idx = 2;
    }

    item = document.getElementsByClassName("list_item");

    for (i = 0; i < item.length; i++) {
        name = item[i].getElementsByClassName("con_list");
        // console.log("name : ", name[3].innerHTML);

        if (name[idx].innerHTML.toUpperCase().indexOf(value) > -1) {
            item[i].style.display = "block";

        } else {
            item[i].style.display = "none";
        }
    }
}

