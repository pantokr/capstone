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

let opChatLogsRefs = null;
// 
init_ff();

onAuthStateChanged(auth, (user) => {
    getCurrentRoomId();
});

function init_ff(roomId = 'fbkOvjH1uxIwvyzC2rwR') {
    this.roomId = roomId;

    const db = getFirestore();
    const chatCol = collection(db, "chats");
    const chatRef = doc(chatCol, roomId);

    getDoc(chatRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.data();

                const caller = val.caller;
                const callee = val.callee;

                if (uid == caller){
                    opId = callee;
                }
                else{
                    opId = caller;
                }



                const opRef = doc(collection(db, "users"), opId);
                opListRefs = getDocs(collection(opRef, "chat_logs"));

                getDoc(opRef).
                    then((snapshot_u)=>{
                        if(snapshot_u.exists()){
                            const val_u = snapshot_u.data();

                            opName = val_u.name;
                        }
                    }).catch((error) => {
                        console.error("User Error.");;
                    });
            }
        })
        .catch((error) => {
            console.error("Chat Error.");
        });

}

function getCurrentRoomId() {
    return roomId;
}

function getOpponentId(){
    return opId;
}

function getOpponentName(){
    return opName;
}

export {
    init_ff
}