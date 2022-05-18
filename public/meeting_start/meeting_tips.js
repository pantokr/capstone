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

// init();

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

// const db = getFirestore();
// const roomRef = collection(db, 'rooms');
// const roomSnapshot = await getDocs(roomRef);getDoc(doc(db, 'users', uid))
// .then((snapshot) => {
//     if (snapshot.exists()) {
//         var val = snapshot.data();

//         const profile = val.profile_picture;
//         const name = val.name;
//         const email = val.email;
//         const birth = val.birth;
//         const birth_y = val.birth.birth_year;
//         const birth_m = val.birth.birth_month;
//         const birth_d = val.birth.birth_date;
//         const gender = val.gender;

//         profile_img.setAttribute('src', profile);

//         uid_span.innerText = uid;
//         email_span.innerText = email;
//         name_span.innerText = name;
//         age_span.innerText = `${birth_y} . ${birth_m} . ${birth_d}`;
//         gender_span.innerText = gender === "male"
//             ? "남자"
//             : "여자";

//     }
// })
// .catch((error) => {
//     console.error(error);
// });