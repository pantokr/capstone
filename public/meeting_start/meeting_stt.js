import "../firebase_initialization.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { startRecord, stopRecord, setEmotion } from "./meeting_emotions.js";

let startTime = null;
let uid = null;

//good, sad, bad, normal count
var emotionCount = [0, 0, 0, 0];
var emotionHistory = [];

async function startSTT(roomId, isCaller) {
  faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  faceapi.nets.faceExpressionNet.loadFromUri("./models");

  const muteBtn = document.getElementById("muteBtn");

  window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const auth = getAuth();
  const db = getFirestore();
  const chatCol = collection(db, "chats");
  const chatRef = doc(chatCol, roomId);
  const speechCol = collection(chatRef, "speeches");

  let chatLogCol = null;
  let name = null;
  let isOpponent = false;

  // 키워드 배열을 담을 해시맵
  const keyMap = [];
  for (var i = 0; i < 4; i++) {
    keyMap[i] = new Map();
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      name = user.displayName;
      uid = user.uid;
      if (isCaller == true) {
        setDoc(chatRef, { caller: uid });
      } else {
        updateDoc(chatRef, {
          callee: uid,
          start: getTimestamp(),
        });
      }
    } else {
      // console.log("No User.");
    }
  });

  recognizeChat();

  onSnapshot(speechCol, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        let data = change.doc.data();
        let parsed_data = JSON.parse(JSON.stringify(data));
        let speecher = parsed_data.speecher;
        let text = parsed_data.text;

        // STT 박스
        if (speecher == name) {
          let myBox = document.createElement("div");
          myBox.setAttribute("class", "myBox");

          let myText = document.createElement("div");

          myText.setAttribute("class", "myText");
          myText.textContent = text;

          // console.log("My Text : ", myText.textContent);

          myBox.append(myText);
          document.querySelector(".chatLog").append(myBox);
        } else {
          let oppBox = document.createElement("div");
          oppBox.setAttribute("class", "oppBox");

          let oppText = document.createElement("div");
          oppText.setAttribute("class", "oppText");

          oppText.textContent = text;
          // console.log("Opponent text : ", oppText.textContent);
          oppBox.append(oppText);
          document.querySelector(".chatLog").append(oppBox);

          if (!isOpponent) {
            addUserLog(speecher, uid);
            isOpponent = true;
          }
        }
        let minbox = document.querySelector(".min-content");
        minbox.scrollTop = minbox.scrollHeight;
      } else if (change.type === "modified") {
        let data = change.doc.data();
        let parsed_data = JSON.parse(JSON.stringify(data));
        let speecher = parsed_data.speecher;
        let emotion = parsed_data.emotion;
        if (speecher != name) {
          // console.log("Opponent Emotion : " + emotion);
          console.log("speecher: ", speecher, "name: ", name);
          if (emotion == "Bad") {
            setEmotion(1);
            setKeyword(0, parsed_data);
          } else if (emotion == "Good") {
            setEmotion(2);
            setKeyword(1, parsed_data);
          } else if (emotion == "Sad") {
            setEmotion(3);
            setKeyword(2, parsed_data);
          } else {
            setEmotion(4);
            setKeyword(3, parsed_data);
          }
          emotionHistory.push(emotion);
          console.log(emotionHistory);

          //emotion count
          if (emotion == "Good") {
            emotionCount[0]++;
          } else if (emotion == "Sad") {
            emotionCount[1]++;
          } else if (emotion == "Bad") {
            emotionCount[2]++;
          } else{
            //Normal
            emotionCount[3]++;
          }
        }
      }
    });
  });

  // 키워드 추출
  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
  }

  function setKeyword(idx, parsed_data) {
    let emotion = null;
    if (idx == 0) {
      emotion = "Bad";
    }
    if (idx == 1) {
      emotion = "Good";
    }
    if (idx == 2) {
      emotion = "Sad";
    }
    if (idx == 3) {
      emotion = "Normal";
    }

    const userCol = collection(db, "users");
    const userRef = doc(userCol, uid);
    const chatLogCol = collection(userRef, "chat_logs");
    const chatLogRef = doc(chatLogCol, startTime);
    const keywordCol = collection(chatLogRef, emotion);
    // const keywordRef = doc(keywordCol, keyName);

    postData("https://open-py.jp.ngrok.io/etri", parsed_data).then((data) => {
      console.log("Data : " + data);
      if (data) {
        for (var i = 0; i < Object.keys(data).length; i++) {
          const keyName = Object.keys(data)[i];
          if (!keyMap[idx].get(keyName)) {
            keyMap[idx].set(keyName, 1);
            setDoc(doc(keywordCol, keyName), {
              text: data[keyName].text,
              type: data[keyName].type,
              count: 1,
            });
          } else {
            var cnt = keyMap[idx].get(keyName);
            keyMap[idx].set(keyName, cnt + 1);
            updateDoc(doc(keywordCol, keyName), { count: cnt + 1 });
          }
          console.log(
            "keyName: ",
            Object.keys(data)[i],
            "count: ",
            keyMap[idx].get(keyName)
          );
        }
        // const keyName = Object.keys(data)[0];
        // console.log("size : ",Object.keys(data).length);
        // console.log("data : ", data);
        // console.log("키워드:", data[keyName].text);
        // console.log("키워드 종류: ", data[keyName].type);
      }
    });
  }

  async function addUserLog(opponent, opponentId) {
    const userCol = collection(db, "users");
    const userRef = doc(userCol, uid);
    chatLogCol = collection(userRef, "chat_logs");
    startTime = getTimestamp();

    setDoc(doc(chatLogCol, startTime), {
      roomID: roomId,
      opponent: opponent,
      opponentID: opponentId,
      good: 0,
      sad: 0,
      bad: 0,
      normal: 0,
    });
  }

  function recognizeChat() {
    let recognition = new SpeechRecognition();
    let finalText = null;
    let isMuted = false;
    recognition.lang = "ko-KR";
    recognition.maxAlternatives = 10000;

    recognition.start();
    startRecord();

    muteBtn.onclick = function () {
      isMuted = isMuted ? false : true;
    };

    recognition.onresult = function (e) {
      //console.log("isMuted: ", isMuted);
      if (!isMuted) {
        let texts = Array.from(e.results)
          .map((results) => results[0].transcript)
          .join("");
        finalText = texts;
      }
    };

    recognition.onend = async function () {
      await addChatting();

      recognition.start();
      startRecord();
    };

    async function addChatting() {
      if (finalText != null) {
        var speechRef = doc(speechCol, getTimestamp());
        stopRecord(speechRef);
        setDoc(speechRef, {
          speecher: name,
          speecherID: uid,
          isCaller: isCaller == true ? "Caller" : "Callee",
          text: finalText,
        });
        finalText = null;
        updateDoc(chatRef, { end: getTimestamp() });
      } else {
        stopRecord();
      }
    }
  }

  function getTimestamp() {
    let now = new Date();

    let year = now.getFullYear(); // 년도
    let month = now.getMonth() + 1; // 월
    let date = now.getDate(); // 날짜

    let hours = now.getHours(); // 시
    let minutes = now.getMinutes(); // 분
    let seconds = now.getSeconds(); // 초

    var timestamp = "";
    timestamp += (year % 2000).toString() + "-";
    timestamp += (month > 9 ? "" : "0") + month.toString() + "-";
    timestamp += (date > 9 ? "" : "0") + date.toString() + " ";
    timestamp += (hours > 9 ? "" : "0") + hours.toString() + ":";
    timestamp += (minutes > 9 ? "" : "0") + minutes.toString() + ":";
    timestamp += (seconds > 9 ? "" : "0") + seconds.toString();

    return timestamp;
  }
}

export { startSTT, startTime, uid, emotionHistory, emotionCount };
