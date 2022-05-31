import "../firebase_initialization.js";
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
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getKeywordHistory, getFrequentKeyword, getFrequentType, getGoodKeyword, getBadKeyword, getSadKeyword } from "./firestore_functions.js";
// import { emotionHistory } from "./meeting_emotions.js"
// init();

//초반 Tips
const beginningTips = [
  "누군가 입장했어요! 서로 웃으며 인사하세요!",
  "MBTI에 대해서 이야기 해보세요!",
];
//랜덤 Tips
const randomTips = [
  "겸손함은 좋지만 자신을 깎아내리는 말은 좋지 않아요",
  "마지막 인사는 정중하게!",
];
//장시간 감정별 Tips
const normalTips = [
  "상대방 감정이 장시간 보통이네요 재미있는 이야기를 생각해보세요!",
  "상대방 감정이 장시간 보통이네요 상대방이 기뻐했던 키워드로 질문해보세요!",
  "상대방 감정이 장시간 보통이네요 조금 더 적극적일 필요가 있어요!",
  "서로 공통된 취미에 대해서 생각해 보세요!",
  "서로 공통된 음악 취향에 대해서 말해 보세요!",
  "즐거웠던 여행 경험에 대해서 이야기해 보세요!",
  "스스로 기분 좋았던 일을 공유해 보세요!",
  "약간은 다운된 분위기를 어떻게 하면 띄울 수 있을까요?",
];
const goodTips = [
  "상대방 감정이 장시간 기쁨이네요 잘하고 있어요!",
  "상대방 감정이 장시간 행복이네요. 지금 말하고 있는 주제에 관해 더 자세히 말해보세요!",
];
const badTips = [
  "상대방 감정이 장시간 나쁨이네요 상대방이 기뻐했던 키워드로 이야기 해보세요!",
  "상대방 감정이 장시간 나쁨이네요 왜 기분이 안좋은 지 질문해보세요!",
];
const sadTips = [
  "상대방 감정이 장시간 슬픔이네요 위로의 말을 건네 보세요!",
  "상대방 감정이 장시간 슬픔이네요 상대방이 기뻐했던 키워드로 이야기 해보세요!",
  "상대방 감정이 장시간 슬픔이네요 상대방이 우울한 이유에 대해 물어봐요",
  "상대방 감정이 장시간 슬픔이네요 상대방에게 공감해주세요",
];

//감정 변화 시 Tips
const sadToNormalTips = [
  "상대방의 슬픈 감정이 안정되었어요!",
  "우울한 분위기가 진정되었어요!",
];
const goodToNormalTips = [
  "상대방의 기쁜 마음이 지루해지려고 해요!",
  "지금까지 재밌었던 분위기를 계속 이어나가요!",
  "조금 더 적극적일 필요가 있어요!",
];
const badToNormalTips = [
  "좋지 않았던 분위기가 나아지고 있어요!",
  "상대방이 기분 나빴었다가 나아지고 있어요!",
];

const sadToBadTips = [
  "상대방의 우울함이 더 나빠지고 있어요",
  "위로의 말이 잘 통하지 않았나봐요",
  "상대방을 더 공감해주는 말은 어떨까요?",
];
const goodToBadTips = [
  "상대방의 감정이 슬픔으로 바뀌었어요",
  "방금 발언에 상대방이 기분나빠했어요",
  "방금 했던 말보다 다른 좋은 말은 없을까요?",
  "상대방에겐 민감한 주제일 수도 있어요!",
];
const normalToBadTips = [
  "방금 발언에 상대방이 기분나빠했어요",
  "방금 했던 말보다 다른 좋은 말은 없을까요?",
  "상대방에겐 민감한 주제일 수도 있어요!",
];

const normalToSadTips = [
  "상대방의 감정이 슬픔으로 바뀌었어요",
  "지금 말한 주제는 상대방에겐 슬픈 주제인가봐요",
  "상대방과 공감하는 위로의 말을 건네보세요",
];
const goodToSadTips = [
  "상대방의 감정이 슬픔으로 바뀌었어요",
  "지금 말한 주제는 상대방에겐 슬픈 주제인가봐요",
  "상대방과 공감하는 위로의 말을 건네보세요",
];
const badToSadTips = ["분위기가 좋지 않네요, 즐거운 주제로 화제변환 해봐요!"];

const normalToGoodTips = [
  "상대방이 좋아하는 주제인가봐요",
  "방금 말한 주제로 대화를 계속 이어나가봐요!",
  "조금은 다운된 분위기가 살아나고 있어요!",
];
const sadToGoodTips = [
  "우울한 분위기가 즐거움으로 바뀌었어요!",
  "방금 말한 주제를 상대방이 좋아합니다!",
  "이 주제로 대화를 계속 이어나가봐요!",
];
const badToGoodTips = [
  "안좋았던 분위기가 즐거움으로 바뀌었어요!",
  "전보다 이런 주제를 상대방이 좋아합니다!",
  "이 주제로 대화를 계속 이어나가봐요!",
];

//랜덤 질문
const randomQuestions = [
  // "고향이 어디세요",
  // "스포츠 좋아하세요?",
  "운동을 자주 하시나요?",
  "주말에 주로 뭐하면서 보내세요?",
  // "형제 관계가 어떻게 되세요?",
  // "가리는 음식 있으세요?",
  // "운전을 할 줄 아시나요?",
  // "키가 어떻게 되시나요?",
  // "바다와 산 중 뭘 더 선호하세요?",
  // "어떤 가수의 팬인가요?",
  "어떤 장르의 음악을 좋아하시나요?",
  "버킷리스트 있으세요?",
  "해외여행 가 본 곳 중 가장 좋았던 곳은 어디에요? ",
  // "요즘 보시는 드라마나 예능 있으세요?",
  "쇼핑 좋아하세요?",
  "어느 계절을 가장 좋아하세요?",
  // "어떤 직업을 가지고 계신가요?",
  "사람 관계에 있어서 무엇을 제일 중요시 여기시나요?",
  "여행 가보고 싶은 곳 있으시나요?",
  // "부모님들은 어떤 분이세요?",
  "고양이, 강아지 중에 어떤 동물을 더 좋아하세요?",
  "어떤 영화 장르를 좋아하세요?",
  "휴가는 어디로 주로 가세요?",
  "동물 키우세요?",
  // "가장 친한 친구는 어떤 사람이에요?",
  // "잠은 보통 몇 시에 주무시나요?",
  // "아침에 잘 일어나시나요?",
  "계획적인 편인가요? 즉흥적인 편인가요?",
  "가장 좋아하는 음식이 어떤 음식인가요?",
  "맛집 가는 거 좋아하세요?",
  "어떤 종교를 가지고 계신가요?",
  // "로또 당첨되면 뭐부터 먼저 하실거에요?",
  "요리하는 걸 좋아하시나요?",
  "산책하는 것을 좋아하시나요?",
  "넷플릭스를 즐겨 보시나요?",
  "생일이 언제인가요?",
  "혈액형이 어떻게 되나요?",
  "어떤 연애를 선호하시나요?",
  // "인생에 터닝 포인트 있으세요?",
  // "이상형은 어떤 사람인가요?",
  // "책 읽는 거 좋아하세요?",
  // "어떤 날씨 좋아하세요?",
  // "캠핑 좋아하세요?",
  "양식 일식 한식 중 뭘 제일 좋아하세요?",
  "어제는 어떤 하루 보내셨어요?",
  // "꼭 하는 루틴 있으세요?",
  "스스로 생각하는 장점이나 단점 있으세요?",
  "좋아하는 유튜버가 누군가요?",
  // "잘 하는 요리는 뭐에요?",
  "요새 관심 있는 주제가 뭐에요?",
  "올해가 가기 전에 꼭 하고 싶은 게 있나요?",
  // "향수 좋아하세요?",
  // "전공이 무엇인가요?",
  "제주도 가보신 적 있으세요?",
  // "싸이 콘서트 가 보신 적 있으세요?",
  // "삶의 최종 목표가 무엇인가요?",
  // "어릴 때는 어떤 아이였나요?",
  // "올림픽 잘 챙겨보세요?",
  // "몇 년생 인가요?",
  // "낯을 많이 가리는 편이세요?",
  // "가입한 동호회 있으세요?",
  // "조용한 걸 좋아하세요? 아님 시끌벅적한 걸 좋아하세요?",
  // "꽃 좋아하세요?",
  // "버스나 지하철 뭘 더 선호하세요?",
  // "어떤 커피를 좋아하세요?",
  "사람을 볼 때 매력으로 느끼는 포인트는 뭔가요?",
  // "밥을 좋아하세요? 빵을 좋아하세요?",
  // "끈기가 있는 편이세요?",
  // "지금 하는 일에 대해 행복함을 느끼세요?",
  "제일 중시하는 가치관이 있나요?",
  // "어릴 적 꿈이 뭐였나요?",
  // "주식 하시나요?",
  // "긴 머리 좋아하세요? 짧은 머리 좋아하세요?",
  // "방이나 집이 잘 꾸며 놓고 사는 편이세요?",
  // "좋아하는 패션 브랜드가 있나요?",
  // "추구하는 패션이 뭔가요?",
  // "상대방이 어떨 때 호감을 느끼나요?",
  // "게임 좋아하세요?",
  // "가장 재밌게 본 영화나 드라마 있으세요?",
];

function trigger(emotionHistory) {
  function getRandomIndex(num) {
    var res = Math.floor(Math.random() * num);
    return res;
  }

  //test용
  // if(emotionHistory[emotionHistory.length - 1] == "Good"){
  //   return goodTips[getRandomIndex(goodTips.length)];
  // }
  // else{
  //   return "다른 감정이에용";
  // }


  //최근 감정 3개가 같을 때 (장시간)
  if (
    emotionHistory.length >= 3 &&
    emotionHistory[emotionHistory.length - 3] ==
    emotionHistory[emotionHistory.length - 2] &&
    emotionHistory[emotionHistory.length - 2] ==
    emotionHistory[emotionHistory.length - 1]
  ) {
    if (emotionHistory[emotionHistory.length - 1] == "Good") {
      console.log(goodTips[getRandomIndex(goodTips.length)]);
      return goodTips[getRandomIndex(goodTips.length)];
    } else if (emotionHistory[emotionHistory.length - 1] == "Sad") {
      console.log(sadTips[getRandomIndex(sadTips.length)]);
      return sadTips[getRandomIndex(sadTips.length)];
    } else if (emotionHistory[emotionHistory.length - 1] == "Bad") {
      console.log(badTips[getRandomIndex(badTips.length)]);
      return badTips[getRandomIndex(badTips.length)];
    } else if (emotionHistory[emotionHistory.length - 1] == "Normal") {
      console.log(normalTips[getRandomIndex(normalTips.length)]);
      return normalTips[getRandomIndex(normalTips.length)];
    }
  }

  //감정 변화가 일어날 때 (특정 감정 2개 -> 다른 특정 감정 2개)
  else if (
    emotionHistory.length >= 4 &&
    emotionHistory[emotionHistory.length - 4] ==
    emotionHistory[emotionHistory.length - 3] &&
    emotionHistory[emotionHistory.length - 2] ==
    emotionHistory[emotionHistory.length - 1] &&
    emotionHistory[emotionHistory.length - 2] !=
    emotionHistory[emotionHistory.length - 3]
  ) {
    if (
      emotionHistory[emotionHistory.length - 3] == "Good" &&
      emotionHistory[emotionHistory.length - 2] == "Bad"
    ) {
      console.log(goodToBadTips[getRandomIndex(goodToBadTips.length)]);
      return goodToBadTips[getRandomIndex(goodToBadTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Good" &&
      emotionHistory[emotionHistory.length - 2] == "Sad"
    ) {
      console.log(goodToSadTips[getRandomIndex(goodToSadTips.length)]);
      return goodToSadTips[getRandomIndex(goodToSadTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Good" &&
      emotionHistory[emotionHistory.length - 2] == "Normal"
    ) {
      console.log(goodToNormalTips[getRandomIndex(goodToNormalTips.length)]);
      return goodToNormalTips[getRandomIndex(goodToNormalTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Bad" &&
      emotionHistory[emotionHistory.length - 2] == "Good"
    ) {
      console.log(badToGoodTips[getRandomIndex(badToGoodTips.length)]);
      return badToGoodTips[getRandomIndex(badToGoodTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Bad" &&
      emotionHistory[emotionHistory.length - 2] == "Sad"
    ) {
      console.log(badToSadTips[getRandomIndex(badToSadTips.length)]);
      return badToSadTips[getRandomIndex(badToSadTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Bad" &&
      emotionHistory[emotionHistory.length - 2] == "Normal"
    ) {
      console.log(badToNormalTips[getRandomIndex(badToNormalTips.length)]);
      return badToNormalTips[getRandomIndex(badToNormalTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Sad" &&
      emotionHistory[emotionHistory.length - 2] == "Good"
    ) {
      console.log(sadToGoodTips[getRandomIndex(sadToGoodTips.length)]);
      return sadToGoodTips[getRandomIndex(sadToGoodTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Sad" &&
      emotionHistory[emotionHistory.length - 2] == "Bad"
    ) {
      console.log(sadToBadTips[getRandomIndex(sadToBadTips.length)]);
      return sadToBadTips[getRandomIndex(sadToBadTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Sad" &&
      emotionHistory[emotionHistory.length - 2] == "Normal"
    ) {
      console.log(sadToNormalTips[getRandomIndex(sadToNormalTips.length)]);
      return sadToNormalTips[getRandomIndex(sadToNormalTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Normal" &&
      emotionHistory[emotionHistory.length - 2] == "Good"
    ) {
      console.log(normalToGoodTips[getRandomIndex(normalToGoodTips.length)]);
      return normalToGoodTips[getRandomIndex(normalToGoodTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Normal" &&
      emotionHistory[emotionHistory.length - 2] == "Bad"
    ) {
      console.log(normalToBadTips[getRandomIndex(normalToBadTips.length)]);
      return normalToBadTips[getRandomIndex(normalToBadTips.length)];
    } else if (
      emotionHistory[emotionHistory.length - 3] == "Normal" &&
      emotionHistory[emotionHistory.length - 2] == "Sad"
    ) {
      console.log(normalToSadTips[getRandomIndex(normalToSadTips.length)]);
      return normalToSadTips[getRandomIndex(normalToSadTips.length)];
    }
  }

  else {
    return false;
  }
}

function showTips(emotionHistory, isTriggered = 0) {
  const randomQuestion = document.querySelector("#randomQuestion");
  const innerList = document.querySelector(".inner-list");

  // var i = 0;

  // setInterval(function(){

  const inner = document.createElement("div");
  inner.setAttribute("class", "inner");

  const inners = document.querySelectorAll(".inner");
  inners.forEach((inner) => {
    inner.style.heigth = `${randomQuestion.clientHeight}px`;
  });
  const tips = document.createElement("div");
  tips.setAttribute("style", "height: 50px");

  if (isTriggered == 0) {
    tips.textContent = trigger(emotionHistory);
  }
  else if (isTriggered == 1) {
    tips.textContent = analyzeUser();
  }
  else {
    tips.textContent = beginningTips[Math.floor(Math.random() * beginningTips.length)];
  }

  inner.appendChild(tips);
  innerList.appendChild(inner);

  innerList.style.heigth = `${randomQuestion.clientHeight * inners.length}px`;

  // console.log("height ",  innerList.style.heigth);

  innerList.style.marginTop = `-${randomQuestion.clientHeight * inners.length
    }px`;
  // console.log("inner ", innerList.style.marginTop );

  // }, 2000);
}

function analyzeUser() {

  const rand = Math.floor(Math.random() * 6);
  if (rand == 1) {
    var str = getFrequentKeyword();
    if (str != null) {
      str = "상대방이 최근 가장 많이 언급한 키워드 중 하나는 \"" + str + "\"입니다.";
      return str;
    }
    else {
      return analyzeUser();
    }
  }
  else if (rand == 2) {
    var str = getFrequentType();
    if (str != null) {
      str = "상대방이 최근 가장 관심 있는 주제는 " + str + "입니다.";
      return str;
    }
    else {
      return analyzeUser();
    }
  }
  else if (rand == 3) {
    var str = getGoodKeyword();
    if (str != null) {
      str = "상대방이 최근 제일 많이 웃었던 키워드는 \"" + str + "\"입니다";
      return str;
    }
    else {
      return analyzeUser();
    }
  }
  else if (rand == 4) {
    var str = getBadKeyword();
    if (str != null) {
      str = "상대방이 최근 제일 화냈던 키워드는 \"" + str + "\"입니다";
      return str;
    }
    else {
      return analyzeUser();
    }
  }
  else if (rand == 5){
    var str = getSadKeyword();
    if (str != null) {
      str = "상대방의 최근 우울했던 키워드는 \"" + str + "\"입니다";
      return str;
    }
    else {
      return analyzeUser();
    }
  }
  else {
    str = "\"" + randomQuestions[Math.floor(Math.random() * randomQuestions.length)] + "\"";
    return str;
  }
}

export { showTips, trigger };
