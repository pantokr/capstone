import "./firebase_initialization.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

async function startSTT(roomId, isCaller) {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const auth = getAuth();
    const db = getFirestore();
    const chatCol = collection(db, 'chats');
    const chatRef = doc(chatCol, roomId);

    var name = null;
    onAuthStateChanged(auth, (user) => {
        if (user) {

            name = user.displayName;
            if (isCaller == true) {
                setDoc(chatRef, {caller: name});
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

    const speechCol = collection(doc(chatCol, roomId), 'speechs');
    const speechRef = doc(speechCol, getTimestamp());

    recognizeChat();

    onSnapshot(speechCol, snapshot => {
        snapshot
            .docChanges()
            .forEach(async change => {
                if (change.type === 'added') {
                    let data = change
                        .doc
                        .data();
                    let parsed_data = JSON.parse(JSON.stringify(data));

                    let speecher = parsed_data.speecher;
                    let isCaller = parsed_data.isCaller;
                    let text = parsed_data.text;

                    if (isCaller == "Caller") {
                        let callerBox = document.createElement('div');
                        callerBox.setAttribute("class", "callerBox");

                        let callerTextp = document.createElement('div');

                        callerTextp.setAttribute("id", "callerText");
                        callerTextp.textContent = JSON
                            .parse(JSON.stringify(data))
                            .text;

                        console.log("caller text : ", callerTextp.textContent);

                        callerBox.append(callerTextp);
                        document
                            .querySelector('.chatLog')
                            .append(callerBox);

                        let minbox = document.querySelector('.min-content');
                        minbox.scrollTop = minbox.scrollHeight;

                    } else {
                        let calleeBox = document.createElement('div');
                        calleeBox.setAttribute("class", "calleeBox");

                        let calleeTextp = document.createElement('div');

                        calleeTextp.setAttribute("id", "calleeText");
                        calleeTextp.textContent = JSON
                            .parse(JSON.stringify(data))
                            .text;

                        console.log("callee text : ", calleeTextp.textContent);

                        calleeBox.append(calleeTextp);
                        document
                            .querySelector('.chatLog')
                            .append(calleeBox);

                        let minbox = document.querySelector('.min-content');
                        minbox.scrollTop = minbox.scrollHeight;
                    }
                }
            });
    });

    // onSnapshot(collection(chatRef, 'calleeChat'), snapshot => {   snapshot
    // .docChanges()     .forEach(async change => {       if (change.type ===
    // 'added') {         let calleeBox = document.createElement('div');
    // calleeBox.setAttribute("class", "calleeBox");         let data = change .doc
    // .data();         let calleeTextp = document.createElement('div');
    // calleeTextp.setAttribute("id", "calleeText");         calleeTextp.textContent
    // = JSON .parse(JSON.stringify(data))           .text; console.log("callee
    // text: ", calleeTextp.textContent); calleeBox.append(calleeTextp); document
    // .querySelector('.chatLog') .append(calleeBox); let minbox =
    // document.querySelector('.min-content'); minbox.scrollTop
    // = minbox.scrollHeight;       }     }); });
    function recognizeChat() {
        let recognition = new SpeechRecognition();
        let finalText = null;
        recognition.lang = 'ko-KR';

        recognition.start();

        recognition.onresult = function (e) {
            let texts = Array
                .from(e.results)
                .map(results => results[0].transcript)
                .join("");
            finalText = texts;
        };

        recognition.onend = async function () {

            // 화상 감정 분석 부분 <지우지 말아주세요> function getKeyByValue(object, value) {   return
            // Object.keys(object).find(key => object[key] === value); } const detections =
            // await faceapi.detectAllFaces(remoteVideo, new
            // faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            // var emotions = Object.keys(detections[0].expressions).map(function (key) {
            // return detections[0].expressions[key]; }); var max = Math.max.apply(null,
            // emotions); console.log(getKeyByValue(detections[0].expressions,max))

            await addChatting(finalText);
            recognition.start();
        };
    }

    async function addChatting(finalText) {
        if (finalText != null) {
            await setDoc(doc(speechCol, getTimestamp())
                // speechRef
                , {
                speecher: name,
                isCaller: (
                    isCaller == true
                        ? "Caller"
                        : "Callee"
                ),
                text: finalText
            });
            updateDoc(chatRef, {end: getTimestamp()});
        }
        finalText = null;
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

        //timestamp += (isCaller == true ? "Caller" : "Callee");

        return timestamp
    }
}

export {
    startSTT
}