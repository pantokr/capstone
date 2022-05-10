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

        // console.log(a.herf);
        a.append(num);
        a.append(roomCode);
        a.append(date);
        a.append(opponent);
        li.append(a);
        list_componentouter.appendChild(li);

        let line = document.createElement("div");
        line.setAttribute("class", "line");
        list_componentouter.appendChild(line);

        // // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
    });
}


document.querySelector('.icon_search').addEventListener("click", filter);

function filter(){

    console.log("click!");
    var  value, name, item, i, s, option, idx;
    
    
    value = document.getElementById("input_search_text").value.toUpperCase();
    console.log("value : ",value);

    
    s = document.querySelector("select");
    console.log(s);
    option = s.options[s.selectedIndex].value;
    console.log("option : ",option);


    if(option == 'opponent'){
        idx = 3;
    }
    else if(option == 'date'){
        idx = 2;
    }

    item = document.getElementsByClassName("list_item");
    
    for(i=0;i<item.length;i++){
      name = item[i].getElementsByClassName("con_list");
        // console.log("name : ", name[3].innerHTML);

      if(name[idx].innerHTML.toUpperCase().indexOf(value) > -1){
        item[i].style.display = "block";
        
      }else {
          item[i].style.display = "none";
      }
    }

    
  }

  