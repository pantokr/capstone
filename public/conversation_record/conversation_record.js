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



google.charts.load("current", {packages:["corechart"]});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['a', 'b'],
    ['Good', 10],
    ['Sad', 2],
    ['Bad', 3],
    ['Normal', 5],
  ]);

  var options = {
      backgroundColor: {
          fill: '#f0faf9',
      },
    title: '',
    is3D: true,
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
  chart.draw(data, options);


  var desc = documnet.getElementById("desc");
  desc.textContent= "가장 많이 나온 감정은 " ;
  
}

async function showChats() {
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);
    const querySnapshot = await getDocs(collection(chatRef, "speeches"));
    let cnt = 0;
    let sub_stTime = document.querySelector(".sub_stTime");
    sub_stTime.textContent += date;

    let title_area = document.querySelector(".title_area");
    title_area.textContent = opponent + "님과의 대화";

    querySnapshot.forEach((doc) => {
        let parsed_data = JSON.parse(JSON.stringify(doc.data()));
        let speecher = parsed_data.speecher;
        let text = parsed_data.text;
      
        let box = document.createElement("box");
        box.setAttribute("class", "box");
        box.setAttribute("id",cnt);

        console.log(myName);

        if (speecher == myName) {
            
            let myBox = document.createElement("div");
            myBox.setAttribute("class", "myBox");
            myBox.setAttribute("id", cnt);

            let myText = document.createElement("div");

            myText.setAttribute("class", "myText");
            myText.textContent = text;
            
            

            console.log("my text: ", myText.textContent);

            myBox.append(myText);
            box.append(myBox);
            document
                .querySelector(".chatLog")
                .append(box);

            

        } else {
            let oppBox = document.createElement('div');
            oppBox.setAttribute("class", "oppBox");
            oppBox.setAttribute("id", cnt);

            let oppText = document.createElement('div');
            oppText.setAttribute("class", "oppText");
            
            oppText.textContent = text;
            console.log("opponent text : ", oppText.textContent);
           
            
            oppBox.append(oppText);
            box.append(oppBox);
            document
                .querySelector('.chatLog')
                .append(box);


        }

        cnt += 1;
        let minbox = document.querySelector(".min-content");
        minbox.scrollTop = minbox.scrollHeight;

        // // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
    });
}


document.querySelector("#input_search_text").addEventListener('keyup',(e)=>{
  if (e.keyCode === 27) { 
    console.log("esc 누름");
    unfilter(); 
  }
});
document.querySelector("#icon_cancel").addEventListener("click", unfilter);

function unfilter(){
  var value,  myBox, oppBox, myText, oppText, myidx, oppidx , i,j, minbox, regex2, orgmy, orgopp, box;
  myidx = 0;
  myidx = 0;

  value = document.getElementById("input_search_text").value.toUpperCase();
  if(value === "") return;
  
  myBox = document.getElementsByClassName("myBox");
  oppBox = document.getElementsByClassName("oppBox");
  
  minbox = document.querySelector(".min-content");


  for(i=0;i<myBox.length;i++){
      myText = myBox[i].getElementsByClassName("myText");
      
    if(myText[0].innerHTML.toUpperCase().indexOf(value) > -1){
      
      var regex = new RegExp(value,'gi');
      myText[0].innerHTML = myText[0].innerHTML.replace(regex, "<span class='unhighlight-my'>" + value + "</span>") ;
     
    }else {
      //   myBox[i].style.display = "none";
    }
  }
  for(j=0;j<oppBox.length;j++){
      oppText = oppBox[j].getElementsByClassName("oppText");
      
    if(oppText[0].innerHTML.toUpperCase().indexOf(value) > -1){
      var regex = new RegExp(value, 'gi');
      oppText[0].innerHTML = oppText[0].innerHTML.replace(regex, "<span class='unhighlight-opp'>" + value + "</span>") ;
    }else {
      //   oppBox[j].style.display = "none";
    }

  }
  document.getElementById("input_search_text").value = "";
  
  // window.location.reload();
  // setTimeout("window.location.reload()", 1000);
}


// 검색기능
document.querySelector("#input_search_text").addEventListener('keyup',(e)=>{
  if (e.keyCode === 13) { 
    console.log("enterkey 누름");
    filter(); 
  }
});


document.querySelector('.icon_search').addEventListener("click", filter);

var flag ;
function filter(){

    var value,  myBox, oppBox, myText, oppText, myidx, oppidx , i,j, minbox, myid, oppid, min,  box, idx;
    var flag = 0;
    myidx = 1000000;
    myidx = 1000000;
     idx = 100000;
    value = document.getElementById("input_search_text").value.toUpperCase();


    box = document.getElementsByClassName('box');
    myBox = document.getElementsByClassName("myBox");
    oppBox = document.getElementsByClassName("oppBox");
    
    minbox = document.querySelector(".min-content");

    for(i = 0 ; i < box.length ; i++){
      myBox = box[i].getElementsByClassName("myBox");
      oppBox = box[i].getElementsByClassName("oppBox");

      for(j = 0 ; j < myBox.length ; j++){
        myText = myBox[j].getElementsByClassName("myText");
       if(myText[0].innerHTML.toUpperCase().indexOf(value) > -1){
        
        myid = i
        myidx = Math.max(myidx , myid );
        var regex = new RegExp(value,'gi');
        myText[0].innerHTML = myText[0].innerHTML.replace(regex, "<span class='highlight'>" + value + "</span>") ;

       
        var offset = document.getElementById(i).offsetTop;
        minbox.scrollTo({top : offset, behavior : 'smooth'});
        
       }
        
      }
      for(j = 0 ; j < oppBox.length ; j++){
        oppText = oppBox[j].getElementsByClassName("oppText");
        
        if(oppText[0].innerHTML.toUpperCase().indexOf(value) > -1){
          oppid = i;
          oppidx = Math.max(oppidx , oppid );
          var regex = new RegExp(value, 'gi');
          oppText[0].innerHTML = oppText[0].innerHTML.replace(regex, "<span class='highlight'>" + value + "</span>") ;
          
          // minbox.scrollTop = box[i].scrollHeight;
         
            var offset = document.getElementById(i).offsetTop;
            minbox.scrollTo({top : offset, behavior : 'smooth'});
         
        }
      }
      // minbox.scrollTop =  box[i].scrollHeight;
      
      
    }
    
    
  }
  
