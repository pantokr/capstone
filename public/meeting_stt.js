import "./firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

async function startSTT(roomId, isCaller) {
    const muteBtn = document.getElementById("muteBtn");

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const auth = getAuth();
    const db = getFirestore();
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);

    let name = null;
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            name = user.displayName;
            if (isCaller == true) {
                setDoc(chatRef, { caller: name });
            } else {
                updateDoc(chatRef, {
                    callee: name,
                    start: getTimestamp()
                });
            }
        } else {
            console.log("No User.");
        }
    });

    const speechCol = collection(chatRef, 'speeches');

    recognizeChat();

    onSnapshot(speechCol, (snapshot) => {
        snapshot
            .docChanges()
            .forEach(async (change) => {
                if (change.type === "added") {
                    let data = change
                        .doc
                        .data();
                    let parsed_data = JSON.parse(JSON.stringify(data))
                    let isCaller = parsed_data.isCaller;
                    let speecher = parsed_data.speecher;
                    let text = parsed_data.text;

                    if (speecher == name) {
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

                        let minbox = document.querySelector(".min-content");
                        minbox.scrollTop = minbox.scrollHeight;
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

                        let minbox = document.querySelector('.min-content');
                        minbox.scrollTop = minbox.scrollHeight;
                    }
                }
            });
    });

    function recognizeChat() {
        let recognition = new SpeechRecognition();
        let finalText = null;
        let isMuted = false;
        recognition.lang = "ko-KR";

        recognition.start();

        muteBtn.onclick = function() {
            isMuted = isMuted ? false : true;
        }

        recognition.onresult = function (e) {
            console.log("isMuted: ", isMuted);
            if (!isMuted) {
                let texts = Array
                    .from(e.results)
                    .map((results) => results[0].transcript)
                    .join("");
                finalText = texts;
                console.log("result");
            }
        };

        recognition.onend = async function () {
            // 화상 감정 분석 부분<지우지 말아주세요> 
            function getKeyByValue(object, value) {   
                return Object.keys(object).find(key => object[key] === value); 
            } 
            const detections = await faceapi.detectAllFaces(remoteVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            
            var emotions = Object.keys(detections[0].expressions).map(function (key) {
                return detections[0].expressions[key]; 
            }); 
            var max = Math.max.apply(null,emotions); 
            console.log(getKeyByValue(detections[0].expressions,max));

            await addChatting();
            recognition.start();
        };
        async function addChatting() {
            if (finalText != null) {
                setDoc(doc(speechCol, getTimestamp()), {
                    speecher: name,
                    isCaller: isCaller == true
                        ? "Caller"
                        : "Callee",
                    text: finalText
                });
                finalText = null;
                updateDoc(chatRef, { end: getTimestamp() });
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
        timestamp += (year % 2000).toString() + ":";
        timestamp += (
            month > 9
                ? ""
                : "0"
        ) + month.toString() + ":";
        timestamp += (
            date > 9
                ? ""
                : "0"
        ) + date.toString() + ":";
        timestamp += (
            hours > 9
                ? ""
                : "0"
        ) + hours.toString() + ":";
        timestamp += (
            minutes > 9
                ? ""
                : "0"
        ) + minutes.toString() + ":";
        timestamp += (
            seconds > 9
                ? ""
                : "0"
        ) + seconds.toString();

        return timestamp;
    }
}

export {
    startSTT
};
