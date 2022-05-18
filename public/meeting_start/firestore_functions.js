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

const roomId = null;
const opName = null;
const 
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
                var val = snapshot.data();

            }
        })
        .catch((error) => {
            console.error(error);
        });

    const speechCol = collection(chatRef, 'speeches');
}

function getCurrentRoomId() {
    return roomId;
}

function getOpponentId(){

}

export {
    init_ff
}