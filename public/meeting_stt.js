import "./firebase_initialization.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {startRecord, stopRecord, recognizeFaceEmotion} from "./meeting_emotions.js";

async function startSTT(roomId, isCaller) {

    faceapi
        .nets
        .tinyFaceDetector
        .loadFromUri('/models');
    faceapi
        .nets
        .faceLandmark68Net
        .loadFromUri('/models');
    faceapi
        .nets
        .faceRecognitionNet
        .loadFromUri('/models');
    faceapi
        .nets
        .faceExpressionNet
        .loadFromUri('/models');

    const muteBtn = document.getElementById("muteBtn");

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const auth = getAuth();
    const db = getFirestore();
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);

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

                        if (!isOpponent) {
                            updateDoc(doc(chatLogCol, startTime), {opponent: speecher});
                            isOpponent = true;
                        }
                    }
                    let minbox = document.querySelector('.min-content');
                    minbox.scrollTop = minbox.scrollHeight;

                }
            });
    });

    async function addUserLog() {

        const userCol = collection(db, "users");
        const userRef = doc(userCol, uid);
        chatLogCol = collection(userRef, "chat_logs");
        startTime = getTimestamp();
        // const chatDoc = await getDoc(chatRef); let data = chatDoc.data(); let
        // parsed_data = JSON.parse(JSON.stringify(data)); console.log("data : ",
        // parsed_data); let opponentName = name == parsed_data.caller ?
        // parsed_data.callee : parsed_data.caller; console.log("opName : ",
        // opponentName);

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
            console.log("isMuted: ", isMuted);
            if (!isMuted) {
                let texts = Array
                    .from(e.results)
                    .map((results) => results[0].transcript)
                    .join("");
                finalText = texts;
            }
        };

        // function getKeyByValue(object, value) {     return Object
        // .keys(object)         .find(key => object[key] === value); }

        recognition.onend = async function () {
            // 화상 감정 분석 부분<지우지 말아주세요>     try{         const detections = await
            // faceapi.detectAllFaces(remoteVideo, new
            // faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            // if(detections == null)         var emotions =
            // Object.keys(detections[0].expressions).map(function (key) { return
            // detections[0].expressions[key];         });         var max =
            // Math.max.apply(null,emotions);
            // console.log(getKeyByValue(detections[0].expressions,max));         await
            // addChatting();         recognition.start();     }     catch(e){
            // console.log("얼굴 인식 실패") await addChatting(); recognition.start();     }

            await addChatting();

            recognition.start();
            startRecord();
        };
        async function addChatting() {
            if (finalText != null) {

                var speechRef = doc(speechCol, getTimestamp());
                stopRecord(speechRef).then(() => {
                    recognizeFaceEmotion();
                })
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