import { getFirestore, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

init();

function init() {
    const basicTipList = ['누군가 입장했어요! 서로 웃으며 인사하세요!', '누군가 입장했어요! 서로의 MBTI를 물어보세요!'];
    let basicTipCount = 0;
    shuffle(basicTipList);

    const randomSwitch = document.getElementById("random_switch");
    randomSwitch.addEventListener("click", makeRandomQuestion);

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
        if (currentProgress == 0) {
            return basicTipList[(basicTipCount++) % basicTipList.length];
        } else if (currentProgress == 1) { }

    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    async function analyzeUser() {
        var tipList = [];
        return tipList;
    }
}




