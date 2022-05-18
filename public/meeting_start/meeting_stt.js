import "../firebase_initialization.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { startRecord, stopRecord, setEmotion } from "./meeting_emotions.js";

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
                setDoc(chatRef, { caller: name });
            } else {
                updateDoc(chatRef, {
                    callee: name,
                    start: getTimestamp()
                });
            }
        } else {
            // console.log("No User.");
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

                    // 키워드 추출
                    async function postData(url = '', data = {}) {
                        // 옵션 기본 값은 *로 강조
                        const response = await fetch(url, {
                            method: 'POST', // *GET, POST, PUT, DELETE 등
                            // mode: 'cors', // no-cors, *cors, same-origin
                            // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                            // credentials: 'same-origin', // include, *same-origin, omit
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                // 'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            // redirect: 'follow', // manual, *follow, error
                            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                            body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
                        });
                        return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
                    }

                    postData('https://open-py.jp.ngrok.io/google-nlp', parsed_data).then((data) => {
                        if (data) {
                            // console.log(Object.keys(data)[0]); // JSON 데이터가 `data.json()` 호출에 의해 파싱됨
                        }
                    });

                    if (speecher == name) {

                        let myBox = document.createElement("div");
                        myBox.setAttribute("class", "myBox");

                        let myText = document.createElement("div");

                        myText.setAttribute("class", "myText");
                        myText.textContent = text;

                        // console.log("My Text : ", myText.textContent);

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
                        console.log("Opponent text : ", oppText.textContent);
                        oppBox.append(oppText);
                        document
                            .querySelector('.chatLog')
                            .append(oppBox);

                        if (!isOpponent) {
                            addUserLog(speecher);
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

                        // console.log("Opponent Emotion : " + emotion);
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

    async function addUserLog(opponent) {

        const userCol = collection(db, "users");
        const userRef = doc(userCol, uid);
        chatLogCol = collection(userRef, "chat_logs");
        startTime = getTimestamp();

        setDoc(doc(chatLogCol, startTime), {
            roomID: roomId,
            opponent: opponent
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