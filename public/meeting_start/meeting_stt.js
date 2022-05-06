import "../firebase_initialization.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {startRecord, stopRecord, setEmotion} from "./meeting_emotions.js";

async function startSTT(roomId, isCaller) {

    faceapi
        .nets
        .tinyFaceDetector
        .loadFromUri('./models');
    faceapi
        .nets
        .faceLandmark68Net
        .loadFromUri('./models');
    faceapi
        .nets
        .faceRecognitionNet
        .loadFromUri('./models');
    faceapi
        .nets
        .faceExpressionNet
        .loadFromUri('./models');

    const muteBtn = document.getElementById("muteBtn");

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const auth = getAuth();
    const db = getFirestore();
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);
    const speechCol = collection(chatRef, 'speeches');

    let startTime = null;
    let chatLogCol = null;
    let name = null;
    let uid = null;
    let isOpponent = false;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            name = user.displayName;
            uid = user.uid;
            if (isCaller == true) {
                setDoc(chatRef, {caller: name});
            } else {
                updateDoc(chatRef, {
                    callee: name,
                    start: getTimestamp()
                });
            }
            addUserLog();

        } else {
            console.log("No User.");
        }
    });

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
                    let speecher = parsed_data.speecher;
                    let text = parsed_data.text;

                    if (speecher == name) {

                        let myBox = document.createElement("div");
                        myBox.setAttribute("class", "myBox");

                        let myText = document.createElement("div");

                        myText.setAttribute("id", "myText");
                        myText.textContent = text;

                        console.log("My Text : ", myText.textContent);

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
                        console.log("Opponent ext : ", oppText.textContent);
                        oppBox.append(oppText);
                        document
                            .querySelector('.chatLog')
                            .append(oppBox);

                        if (!isOpponent) {
                            updateDoc(doc(chatLogCol, startTime), {opponent: speecher});
                            isOpponent = true;
                        }
                    }
                    let minbox = document.querySelector('.min-content');
                    minbox.scrollTop = minbox.scrollHeight;

                } else if (change.type === "modified") {
                    let data = change
                        .doc
                        .data();
                    let parsed_data = JSON.parse(JSON.stringify(data))
                    let speecher = parsed_data.speecher;

                    let emotion = parsed_data.emotion;
                    if (speecher != name) {

                        console.log("Opponent Emotion : " + emotion);
                        if (emotion == 'Bad') {
                            setEmotion(1);
                        } else if (emotion == 'Good') {
                            setEmotion(2);
                        } else if (emotion == 'Sad') {
                            setEmotion(3);
                        } else {
                            setEmotion(4);
                        }
                    }
                }
            });
    });

    async function addUserLog() {

        const userCol = collection(db, "users");
        const userRef = doc(userCol, uid);
        chatLogCol = collection(userRef, "chat_logs");
        startTime = getTimestamp();

        setDoc(doc(chatLogCol, startTime), {
            roomID: roomId,
            opponent: ""
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
            isMuted = isMuted
                ? false
                : true;
        }

        recognition.onresult = function (e) {
            //console.log("isMuted: ", isMuted);
            if (!isMuted) {
                let texts = Array
                    .from(e.results)
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
                setDoc((speechRef), {
                    speecher: name,
                    isCaller: isCaller == true
                        ? "Caller"
                        : "Callee",
                    text: finalText
                });
                finalText = null;
                updateDoc(chatRef, {end: getTimestamp()});
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
        timestamp += (
            month > 9
                ? ""
                : "0"
        ) + month.toString() + "-";
        timestamp += (
            date > 9
                ? ""
                : "0"
        ) + date.toString() + " ";
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