import "../firebase_initialization.js"
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

const auth = getAuth();
const db = getFirestore();

let roomId = null;
let opId = null;
let opName = null;

let chatList = {};
let keywordList = {};
let speechList = {};
let emotionRateList = {};

async function init_ff(rid = null) {
    // rid = 'YSGZ755uzuoVICc74tEd'; //
    console.log("roomId : " + rid);
    if (rid == null) {
        return;
    }
    onAuthStateChanged(auth, (user) => {
        console.log("auth");
        setTimeout(() => {
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

                    // opId = '3jSfETcMRWRfiB4TPa732qn01BT2'; //
                    // get name of opponent
                    const userCol = collection(db, "users");
                    const opRef = doc(userCol, opId);
                    console.log("opId : " + opId);
                    getDoc(opRef).then((snapshot_userInfo) => {
                        if (snapshot_userInfo.exists()) {
                            const val_userInfo = snapshot_userInfo.data();
                            opName = val_userInfo.name;
                        }
                    });

                    // get chat_logs list of opponent
                    const opChatLogsCol = collection(opRef, "chat_logs")
                    const opChatLogsRefs = await getDocs(opChatLogsCol);
                    var size = opChatLogsRefs.size;

                    for (var r = size - 4; r < size - 1; r++) {
                        var d = opChatLogsRefs.docs[r];
                        const val_chatLogs = d.data();
                        chatList[d.id] = val_chatLogs.roomID;

                        let t_list = {};
                        // var k = await getKeyword(doc(opChatLogsCol, d.id), "Normal");
                        // console.log(k);
                        t_list["Bad"] = await getKeyword(doc(opChatLogsCol, d.id), "Bad");
                        t_list["Sad"] = await getKeyword(doc(opChatLogsCol, d.id), "Sad");
                        t_list["Good"] = await getKeyword(doc(opChatLogsCol, d.id), "Good");
                        t_list["Normal"] = await getKeyword(doc(opChatLogsCol, d.id), "Normal");

                        keywordList[d.id] = t_list;
                    }
                    //console.log(keywordList);

                    async function getKeyword(d, emt) {
                        let col = null;
                        if (emt == "Bad") {
                            col = collection(d, "Bad");
                        }
                        else if (emt == "Sad") {
                            col = collection(d, "Sad");
                        }
                        else if (emt == "Good") {
                            col = collection(d, "Good");
                        }
                        else {
                            col = collection(d, "Normal");
                        }
                        const q = query(col, orderBy("count", "desc"), limit(1));
                        const querySnapshot = await getDocs(q);
                        if (querySnapshot.size == 0) {
                            return null;
                        }

                        var dt = querySnapshot.docs[0].data();
                        return dt;
                    }

                }
            });
        }, 4000);
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

function getKeywordHistory() {
    return keywordList;
}

function getFrequentKeyword() {
    var t_list = {};
    var max = 0;
    for (var key in keywordList) {
        if (keywordList[key] != null) {
            for (var key_e in keywordList[key]) {
                if (keywordList[key][key_e] != null) {
                    var txt = keywordList[key][key_e].text;
                    if (t_list[txt] == null) {
                        t_list[txt] = Number(keywordList[key][key_e].count);
                        if (t_list[txt] > max) {
                            max = t_list[txt];
                        }
                    }
                    else {
                        t_list[txt] += Number(keywordList[key][key_e].count);
                        if (t_list[txt] > max) {
                            max = t_list[txt];
                        }
                    }
                }
            }
        }
    }

    var max_list = {};
    for (var key in t_list) {
        if (t_list[key] >= 2 && t_list[key] == max) {
            max_list[key] = max;
        }
    }
    return Object.keys(max_list)[Math.floor(Math.random() * Object.keys(max_list).length)];
}
// 넘겨 받은 RoomID의 모든 대화목록
// function getSpeechesByRoomId(rid) {
//     return speechList[rid];
// }

// // RoomID의 감정 스택
// function getEmotionStackByRoomId(rid) {

//     for (var key in speechList) { }
// }

// 감정 비율 (그 대화에서 있었던 감정의 개수)
// function getEmotionRateByRoomId(rid) {
//     return emotionRateList[rid];
// }

export {
    init_ff, getKeywordHistory, getFrequentKeyword
}