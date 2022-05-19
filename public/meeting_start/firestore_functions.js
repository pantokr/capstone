import "../firebase_initialization.js"
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

const auth = getAuth();
const db = getFirestore();

let roomId = null;
let opId = null;
let opName = null;

let chatList = {};
let speechList = {};
let emotionRateList = {};

async function init_ff(rid = 'Wcvm5NFGsZ7g6fe56J0n') {
    onAuthStateChanged(auth, (user) => {
        roomId = rid;

        //const user = auth.currentUser;
        const uid = user.uid;

        const chatCol = collection(db, "chats");
        const chatRef = doc(chatCol, roomId);

        getDoc(chatRef).then(async (snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.data();

                const caller = val.caller;
                const callee = val.callee;

                if (uid == caller) {
                    opId = callee;
                } else {
                    opId = caller;
                }

                // get name of opponent
                const opRef = doc(collection(db, "users"), opId);
                getDoc(opRef).then((snapshot_userInfo) => {
                    if (snapshot_userInfo.exists()) {
                        const val_userInfo = snapshot_userInfo.data();
                        opName = val_userInfo.name;
                    }
                });

                // get chat_logs list of opponent
                const opChatLogsRefs = await getDocs(collection(opRef, "chat_logs"));
                opChatLogsRefs.forEach((doc) => {
                    const val_chatLogs = doc.data();
                    chatList[doc.id] = val_chatLogs.roomID;

                    // emotion rate of the room
                    emotions = {};
                    emotions['bad'] = val_chatLogs.bad;
                    emotions['good'] = val_chatLogs.good;
                    emotions['normal'] = val_chatLogs.normal;
                    emotions['sad'] = val_chatLogs.sad;
                    emotionRateList[val_chatLogs.roomID] = emotions;
                });
                // console.log(chatList);

                // get speeches list of each chat_logs
                for (var key in chatList) {
                    const opChatRef = doc(chatCol, chatList[key]);
                    const opSpeechesRefs = await getDocs(collection(opChatRef, "speeches"));

                    let t_list = {};
                    opSpeechesRefs.forEach((doc) => {
                        t_list[doc.id] = doc.data();
                    });
                    speechList[chatList[key]] = t_list;
                }

            }
        });
    });

}

// 현재 룸 ID
function getCurrentRoomId() {
    return roomId;
}

// 상대방 UID
function getOpponentId() {
    return opId;
}

// 상대방 이름
function getOpponentName() {
    return opName;
}

// 상대방 채팅 기록 가져오기
function getChatLogs() {
    let logs = []
    opChatLogsRefs.forEach((doc) => {
        logs.push(doc.id);
    });
    return logs;
}

// 넘겨 받은 RoomID의 모든 대화목록
function getSpeechesByRoomId(rid) {
    return speechList[rid];
}

function getEmotionRateByRoomId(rid){
    return emotionRateList[rid];
}

export {
    init_ff
}