import "../firebase_initialization.js"
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
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
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

const auth = getAuth();
const db = getFirestore();

let roomId = null;
let opId = null;
let opName = null;

// let opChatLogsRefs = null;
// let opChatSpeechesRefs = null;

let chatList = [];
let speechList = {};

onAuthStateChanged(auth, (user) => {
    init_ff();
    // getChatLogs();
    // setTimeout(() => {
    //     console.log(getChatLogs());
    // }, 10000);
});

async function init_ff(rid = 'Wcvm5NFGsZ7g6fe56J0n') {
    roomId = rid;

    const user = auth.currentUser;
    const uid = user.uid;

    const db = getFirestore();
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

            const opRef = doc(collection(db, "users"), opId);
            const opChatLogsRefs = await getDocs(collection(opRef, "chat_logs"));

            opChatLogsRefs.forEach((doc) => {
                chatList.push(doc.id);
            });
            console.log(chatList);
            chatList.forEach(async r => {
                const opChatRef = doc(chatCol, r);
                const opSpeechesRefs = await getDocs(collection(opChatRef, "speeches"));

                let t_list = [];
                opSpeechesRefs.forEach((doc) => {
                    t_list.push(doc.id);
                });
                speechList[r] = t_list;
                console.log(speechList[0]);
            });
            getDoc(opRef).then((snapshot_u) => {
                if (snapshot_u.exists()) {
                    const val_u = snapshot_u.data();

                    opName = val_u.name;
                }
            });
        }
    });

}

function getCurrentRoomId() {
    return roomId;
}

function getOpponentId() {
    return opId;
}

function getOpponentName() {
    return opName;
}

function getChatLogs() {
    let logs = []
    opChatLogsRefs.forEach((doc) => {
        logs.push(doc.id);
    });
    return logs;
}
export {
    init_ff
}