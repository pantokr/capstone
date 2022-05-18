import "../firebase_initialization.js"
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

init();

function init() {
    const basicTipList = ['누군가 입장했어요! 서로 웃으며 인사하세요!', '누군가 입장했어요! 서로의 MBTI를 물어보세요!'];
    shuffle(basicTipList);

    makeRandomQuestion();

    // 랜덤 질문
    async function makeRandomQuestion() {
        // const randNum = Math.floor(Math.random() * 10 + 1); const db =
        // getFirestore(); const questionRef = doc(collection(db, 'randomQuestions'),
        // `${randNum}`); const docSnap = await getDoc(questionRef); const parsed_data =
        // JSON.parse(JSON.stringify(docSnap.data()));

        let randomQuestion = document.getElementById("randomQuestion");
        // randomQuestion.textContent = parsed_data.question;
        randomQuestion.textContent = returnTip(0);
    }

    function returnTip(currentProgress = 0) {
        // cur
        if (currentProgress == 0) {
            return basicTipList[0];
        } else if (currentProgress == 1) {}

    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    async function analyzeUser() {
        var tipList = [];
        return tipList;
    }
}

const db = getFirestore();
const roomRef = collection(db, 'rooms');
const roomSnapshot = await getDocs(roomRef);