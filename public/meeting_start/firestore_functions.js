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
    // rid = '40BpClNoboXdj8WnhJso'; //
    console.log("roomId : " + rid);
    if (rid == null) {
        rid = '40BpClNoboXdj8WnhJso';
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

                    opId = 'HFzzpL21GSReUX7Zuy08EkpHR4Z2';
                    // get name of opponent
                    console.log(opId);
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

                    var t = getKeywordHistory();
                    console.log(t);
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
        if (t_list[key] >= 2) {
            max_list[key] = t_list[key];
        }
    }
    var t = Object.keys(max_list)[Math.floor(Math.random() * Object.keys(max_list).length)];
    return t;
}

function getFrequentType() {
    var keyType = keywordList;
    // sports, food, location, animal
    var t_list = [0, 0, 0, 0];
    for (var key in keyType) {
        if (keywordList[key] != null) {
            for (var key_e in keywordList[key]) {
                if (keywordList[key][key_e] != null) {
                    var type = keywordList[key][key_e].type;
                    var count = keywordList[key][key_e].count;

                    if (type == 'CV_SPORTS') {
                        t_list[0] += count;
                    }
                    else if (type == 'CV_FOOD') {
                        t_list[1] += count;
                    }
                    else if (type.substr(0, 2) == 'LC') {
                        t_list[2] += count;
                    }
                    else {
                        t_list[3] += count;
                    }
                }
            }
        }
    }

    var m = t_list.indexOf(Math.max(t_list));
    if (m == 0) {
        return "스포츠";
    }
    else if (m == 1) {
        return "음식";
    }
    else if (m == 2) {
        return "여행";
    }
    else {
        return "동물";
    }
}

function getGoodKeyword() {

    var t_list = []

    for (var key in keywordList) {
        if (keywordList[key] != null) {
            if (keywordList[key]['Good'] != null) {
                t_list.push(keywordList[key]['Good'].text);
            }
        }
    }
    var ret = t_list[Math.floor(Math.random() * t_list.length)];
    return ret;
}

function getBadKeyword() {
    var t_list = []

    for (var key in keywordList) {
        if (keywordList[key] != null) {
            if (keywordList[key]['Bad'] != null) {
                t_list.push(keywordList[key]['Bad'].text);
            }
        }
    }
    var ret = t_list[Math.floor(Math.random() * t_list.length)];
    return ret;
}

function getSadKeyword() {
    var t_list = []

    for (var key in keywordList) {
        if (keywordList[key] != null) {
            if (keywordList[key]['Sad'] != null) {
                t_list.push(keywordList[key]['Sad'].text);
            }
        }
    }

    var ret = t_list[Math.floor(Math.random() * t_list.length)];
    return ret;
}

export {
    init_ff, getKeywordHistory, getFrequentKeyword, getFrequentType, getGoodKeyword, getBadKeyword, getSadKeyword
}