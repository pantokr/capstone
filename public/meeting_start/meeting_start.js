import "../firebase_initialization.js";
import { startSTT } from "./meeting_stt.js"
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import "./meeting_tips.js";
import { init_ff } from "./firestore_functions.js"

mdc
    .ripple
    .MDCRipple
    .attachTo(document.querySelector('.mdc-button'));

const configuration = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ],
    iceCandidatePoolSize: 10
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;

function init() {
    // 자동으로 카메라, 마이크 켜지게 구현, 버튼 클릭 대신 window.onload 사용
    // document.querySelector('#cameraBtn').addEventListener('click',
    // openUserMedia);

    init_ff();
    
    window.onload = openUserMedia();
    // document.querySelector('#hangupBtn').addEventListener('click', hangUp);
    document
        .querySelector('#createBtn')
        .addEventListener('click', createRoom);
    document
        .querySelector('#joinBtn')
        .addEventListener('click', joinRoom);

    document
        .querySelector('#copyBtn')
        .style
        .display = "none";
    document
        .querySelector('#hangupBtn')
        .style
        .display = "none";

    roomDialog = new mdc
        .dialog
        .MDCDialog(document.querySelector('#room-dialog'));

    // makeRandomQuestion();

}

async function createRoom() {

    document
        .querySelector('#createBtn')
        .style
        .display = "none";
    document
        .querySelector('#joinBtn')
        .style
        .display = "none";

    document
        .querySelector('#hangupBtn')
        .style
        .display = "block";
    document
        .querySelector('#copyBtn')
        .style
        .display = "block";

    document
        .querySelector('#hangupBtn')
        .addEventListener('click', hangUp);

    console.log('createBtn has clicked!');
    const db = getFirestore();
    const roomRef = await doc(collection(db, 'rooms'));


    // console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);

    registerPeerConnectionListeners();

    localStream
        .getTracks()
        .forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

    peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
            console.log('Got final candidate!');
            return;
        }
        // console.log('Got candidate: ', event.candidate);
        addDoc(callerCandidatesCollection, event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above Code for creating a room below
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    // console.log('Created offer:', offer);

    const roomWithOffer = {
        'offer': {
            type: offer.type,
            sdp: offer.sdp
        }
    };
    await setDoc(roomRef, roomWithOffer);
    //룸 번호 생성
    roomId = roomRef.id;
    // console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
    // document
    //     .querySelector('#currentRoom')
    //     .innerText = `방 코드 : ${roomRef.id}`;
    // document.querySelector(".copyBtn").setAttribute("id", roomRef.id);
    // `Current room is ${roomRef.id} - You are the caller!`; Code for creating a
    // room above

    peerConnection.addEventListener('track', event => {
        // console.log('Got remote track:', event.streams[0]);
        event
            .streams[0]
            .getTracks()
            .forEach(track => {
                // console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
    });

    // Listening for remote session description below
    onSnapshot(roomRef, async snapshot => {
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data && data.answer) {
            // console.log('Got remote description: ', data.answer);
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        }
    });
    // Listening for remote session description above Listen for remote ICE
    // candidates below

    let isStarted = false;

    onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
        snapshot
            .docChanges()
            .forEach(async change => {
                if (change.type === 'added') {
                    let data = change
                        .doc
                        .data();
                    // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));

                    if (!isStarted) {
                        startSTT(roomRef.id, true);
                        isStarted = true;
                    }
                }
            });
    });
    //startSTT(roomRef.id, true);
    // Listen for remote ICE candidates above
    // -------------------------STT-------------------------------------
}
function btndisappear() {
    console.log('btndisppear !!')
    document
        .querySelector('#createBtn')
        .style
        .display = "none";
    document
        .querySelector('#joinBtn')
        .style
        .display = "none";

    document
        .querySelector('#hangupBtn')
        .style
        .display = "block";
    document
        .querySelector('#copyBtn')
        .style
        .display = "block";
}
function joinRoom() {

    console.log('joinroom btn has cliked!');

    document
        .querySelector('#confirmJoinBtn')
        .addEventListener('click', btndisappear);

    document
        .querySelector('#confirmJoinBtn')
        .addEventListener('click', async () => {

            document
                .querySelector('#hangupBtn')
                .addEventListener('click', hangUp);

            roomId = document
                .querySelector('#room-id')
                .value;
            console.log('Join room: ', roomId);

            // document
            //     .querySelector('#currentRoom')
            //     .innerText =
            //     `방 코드 : ${roomId} `;
            // document.querySelector(".copyBtn").setAttribute("id", roomId);

            await joinRoomById(roomId);
        }, { once: true });
    roomDialog.open();

}

async function joinRoomById(roomId) {
    const db = getFirestore();
    const roomRef = doc(collection(db, 'rooms'), `${roomId}`);
    const roomSnapshot = await getDoc(roomRef);
    // console.log('Got room:', roomSnapshot.exists());

    if (roomSnapshot.exists()) {
        // console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        localStream
            .getTracks()
            .forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                // console.log('Got final candidate!');
                return;
            }
            // console.log('Got candidate: ', event.candidate);
            addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        peerConnection.addEventListener('track', event => {
            // console.log('Got remote track:', event.streams[0]);
            event
                .streams[0]
                .getTracks()
                .forEach(track => {
                    // console.log('Add a track to the remoteStream:', track);
                    remoteStream.addTrack(track);
                });
        });

        // Code for creating SDP answer below
        const offer = roomSnapshot
            .data()
            .offer;
        // console.log('Got offer:', offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        // console.log('Created answer:', answer);
        await peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        };
        await updateDoc(roomRef, roomWithAnswer);
        // Code for creating SDP answer above Listening for remote ICE candidates below
        onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
            snapshot
                .docChanges()
                .forEach(async change => {
                    if (change.type === 'added') {
                        let data = change
                            .doc
                            .data();
                        // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });

        });
        // Listening for remote ICE candidates above
    }

    // joinRoom
    // STT------------------------------------------------------------------------
    startSTT(roomRef.id, false);
}

async function openUserMedia(e) {
    const stream = await navigator
        .mediaDevices
        .getUserMedia({ video: true, audio: true });

    document
        .querySelector('#localVideo')
        .srcObject = stream;
    localStream = stream;

    remoteStream = new MediaStream();
    document
        .querySelector('#remoteVideo')
        .srcObject = remoteStream;

    console.log('Stream:', document.querySelector('#localVideo').srcObject);
    // document.querySelector('#cameraBtn').disabled = true;
    document
        .querySelector('#joinBtn')
        .disabled = false;
    document
        .querySelector('#createBtn')
        .disabled = false;
    // document.querySelector('#hangupBtn').disabled = false;
}

async function hangUp(e) {
    // const tracks = document
    //     .querySelector('#localVideo')
    //     .srcObject
    //     .getTracks();
    // tracks.forEach(track => {
    //     track.stop();
    // });

    // if (remoteStream) {
    //     remoteStream
    //         .getTracks()
    //         .forEach(track => track.stop());
    // }

    // if (peerConnection) {
    //     peerConnection.close();
    // }

    // document
    //     .querySelector('#localVideo')
    //     .srcObject = null;
    // document
    //     .querySelector('#remoteVideo')
    //     .srcObject = null;
    // document
    //     .querySelector('#cameraBtn')
    //     .disabled = false;
    // document
    //     .querySelector('#joinBtn')
    //     .disabled = true;
    // document
    //     .querySelector('#createBtn')
    //     .disabled = true;
    // document
    //     .querySelector('#hangupBtn')
    //     .disabled = true;
    // document
    //     .querySelector('#currentRoom')
    //     .innerText = '';

    // // Delete room on hangup
    // if (roomId) {
    //     const db = getFirestore();
    //     const roomRef = getDoc(roomId, collection(db, 'rooms'));
    //     // const roomRef = doc(collection(db, 'rooms'), `${roomId}`);

    //     const calleeCandidates = await getDoc(collection(roomRef, 'calleeCandidates'));
    //     // const calleeCandidates = collection(roomRef, 'calleeCandidates');
    //     calleeCandidates.forEach(async candidate => {
    //         await deleteDoc(candidate.ref);
    //     });
    //     const callerCandidates = await getDoc(collection(roomRef, 'calleeCandidates'));
    //     // const callerCandidates = collection(roomRef, 'callerCandidates');
    //     callerCandidates.forEach(async candidate => {
    //         await deleteDoc(candidate.ref);
    //     });

    //     await deleteDoc(roomRef);
    // }

    // 초기화
    window.location.reload();
    console.log("초기화 됨");

}

function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`
        );
    });
}

init();

const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");

// 카메라, 오디오 버튼 addEventListener
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

let muted = false;
let cameraOff = false;

// 오디오처리
function handleMuteClick() {
    // 오디오 on/off
    localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    // 오디오 on/off 버튼 처리
    if (!muted) {
        // muteBtn.innerText = "Unmute";
        document
            .getElementById("muteBtn")
            .src = "../images/mute.png";
        muted = true;
    } else {
        // muteBtn.innerText = "Mute";
        document
            .getElementById("muteBtn")
            .src = "../images/unmute.png";
        muted = false;
    }
}
// 카메라 처리
function handleCameraClick() {
    // 카메라 on/off
    localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));

    // 카메라 on/off 버튼 처리
    if (cameraOff) {
        // cameraBtn.innerText = "Turn Camera Off";
        document
            .getElementById("cameraBtn")
            .src = "../images/cameraon.png";
        cameraOff = false;
    } else {
        // cameraBtn.innerText = "Turn Camera On";
        document
            .getElementById("cameraBtn")
            .src = "../images/cameraoff.png";
        cameraOff = true;
    }
}

// 랜덤 질문
// const randomSwitch = document.getElementById("random_switch");

// randomSwitch.addEventListener("click", makeRandomQuestion);

// async function makeRandomQuestion() {
//     const randNum = Math.floor(Math.random() * 10 + 1);
//     const db = getFirestore();
//     const questionRef = doc(collection(db, 'randomQuestions'), `${randNum}`);
//     const docSnap = await getDoc(questionRef);
//     const parsed_data = JSON.parse(JSON.stringify(docSnap.data()));

//     let randomQuestion = document.getElementById("randomQuestion");
//     randomQuestion.textContent = parsed_data.question;
// }

const copyBtn = document.getElementById("copyBtn");
copyBtn.addEventListener("click", CopyByClipBoardAPI);

async function CopyByClipBoardAPI() {
    console.log("copyBtn has clicked!");
    console.log(roomId);

    const copiedText = roomId;
    // document.querySelector('#currentRoom')
    //     .innerText.substr(6);

    navigator.clipboard.writeText(`${roomId}`)
        .then(() => {
            alert(`방 코드 ${roomId}를 복사했습니다.`)
        })
        .catch(() => {
            alert(`복사 실패!`)
        })

}



