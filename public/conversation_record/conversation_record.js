import "../firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";



const url = new URL(window.location.href);
const urlParams = url.searchParams;
const roomId = urlParams.get("roomCode");
const date = urlParams.get("date");
const opponent = urlParams.get("opponent");
const auth = getAuth();
const db = getFirestore();

let myName = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        myName = user.displayName;
        showChats();
    } else {
        console.log("No User.");
    }
});


async function showChats() {
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);
    const querySnapshot = await getDocs(collection(chatRef, "speeches"));

    let sub_stTime = document.querySelector(".sub_stTime");
    sub_stTime.textContent += date;

    let title_area = document.querySelector(".title_area");
    title_area.textContent = opponent + "님과의 대화";

    querySnapshot.forEach((doc) => {
        let parsed_data = JSON.parse(JSON.stringify(doc.data()));
        let speecher = parsed_data.speecher;
        let text = parsed_data.text;
        console.log(myName);
        if (speecher == myName) {
            let myBox = document.createElement("div");
            myBox.setAttribute("class", "myBox");

            let myText = document.createElement("div");

            myText.setAttribute("class", "myText");
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
            oppText.setAttribute("class", "oppText");
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


document.querySelector('.icon_search').addEventListener("click", filter);

function filter(){

    var value, name, item, i;

    value = document.getElementById("input_search_text").value.toUpperCase();
    
    item = document.getElementsByClassName("myBox");
    
    for(i=0;i<item.length;i++){
      name = item[i].getElementsByClassName("myText");
    
      if(name[0].innerHTML.toUpperCase().indexOf(value) > -1){
        // item[i].style.display = "flex";
        //색 입히기
        
      }else {
        //   item[i].style.display = "none";
      }
    }

    
  }
  