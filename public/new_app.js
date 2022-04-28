import { app } from "./firebase_initialization.js";
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));


const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;


const secScreen = document.getElementById("myStream");
secScreen .hidden = true;

function init() {
  // 자동으로 카메라, 마이크 켜지게 구현, 버튼 클릭 대신 window.onload 사용
  // document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  window.onload = openUserMedia();
  document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);
  
  document.getElementById("firScreen").hidden = false;
//   document.querySelector(".modal").classList.add("hidden");

  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

// createBtn 클릭시 
async function createRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";

  
  secScreen.hidden = false;

  const db = getFirestore();
  const roomRef = await doc(collection(db, 'rooms'));

  console.log('Create PeerConnection with configuration: ', configuration);
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners();

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

   // Code for collecting ICE candidates below
   const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

   peerConnection.addEventListener('icecandidate', event => {
     if (!event.candidate) {
       console.log('Got final candidate!');
       return;
     }
     console.log('Got candidate: ', event.candidate);
     addDoc(callerCandidatesCollection, event.candidate.toJSON());
   });
   // Code for collecting ICE candidates above

  // Code for creating a room below
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('Created offer:', offer);

  const roomWithOffer = {
    'offer': {
      type: offer.type,
      sdp: offer.sdp,
    },
  };
  await setDoc(roomRef, roomWithOffer);
  //룸 번호 생성
  roomId = roomRef.id;
  console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
  document.querySelector(
    '#currentRoom').innerText = `Current room is ${roomRef.id} - You are the caller!`;
  // Code for creating a room above



  peerConnection.addEventListener('track', event => {
    console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      console.log('Add a track to the remoteStream:', track);
      remoteStream.addTrack(track);
    });
  });

  // Listening for remote session description below
  onSnapshot(roomRef, async snapshot => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      console.log('Got remote description: ', data.answer);
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });
  // Listening for remote session description above

  // Listen for remote ICE candidates below
  onSnapshot(collection(roomRef, 'calleeCandidates'), snapshot => {
    snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        let data = change.doc.data();
        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });

  // function sleep(ms) {
  //   const wakeUpTime = Date.now() + ms;
  //   while (Date.now() < wakeUpTime) {}
  // }
  // sleep(1000);

  // document.getElementById("firScreen").hidden = true;
  // Listen for remote ICE candidates above
}



// joinBtn 클릭시 
function joinRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;

  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";
  
  
  // document.querySelector(".modal").classList.remove("hidden");


  document.querySelector('#confirmJoinBtn').
    addEventListener('click', async () => {
      roomId = document.querySelector('#room-id').value;
      console.log('Join room: ', roomId);
      document.querySelector(
        '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
      await joinRoomById(roomId);
    }, { once: true });
  roomDialog.open();

  document.getElementById("firScreen").hidden = true;

  // setInterval(function () {
  //   // console.log('recordedMediaURL : ', recordedMediaURL);
  //   takepicture();
  //   var link = document.createElement('a');
  //   link.download = 'filename.png';
  //   link.href = document.getElementById('canvas').toDataURL()
  //   link.click();
  // }, 3000);
}

async function joinRoomById(roomId) {
  const db = getFirestore();
  const roomRef = doc(collection(db, 'rooms'),`${roomId}`);
  const roomSnapshot = await getDoc(roomRef);
  console.log('Got room:', roomSnapshot.exists());

  if (roomSnapshot.exists()) {
    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      addDoc(calleeCandidatesCollection, event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = roomSnapshot.data().offer;
    console.log('Got offer:', offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await updateDoc(roomRef, roomWithAnswer);
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    onSnapshot(collection(roomRef, 'callerCandidates'), snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });


    });
    // Listening for remote ICE candidates above
  }
}

// 내 카메라 띄우기
async function openUserMedia(e) {
  const stream = await navigator.mediaDevices.getUserMedia(
    { video: true, audio: true });
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;

  console.log('Stream:', document.querySelector('#localVideo').srcObject);
  // document.querySelector('#cameraBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = false;
  document.querySelector('#createBtn').disabled = false;
  document.querySelector('#hangupBtn').disabled = false;
}

async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';

  // Delete room on hangup
  if (roomId) {
    const db = getFirestore();
    const roomRef = getDoc(roomId, collection(db, 'rooms'));
    const calleeCandidates = await getDoc(collection(roomRef,'calleeCandidates'));
    calleeCandidates.forEach(async candidate => {
      await deleteDoc(candidate.ref);
    });
    const callerCandidates = await getDoc(collection(roomRef,'calleeCandidates'));
    callerCandidates.forEach(async candidate => {
      await deleteDoc(candidate.ref);
    });
    await deleteDoc(roomRef);
  }

  document.location.reload(true);
}

function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
      `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
      `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

init();



// <!-- 모바일 환경일때 mycam 가림 + 대화록, 질문추천 창 사이즈 조절 -->

var mycam = document.getElementById('mycam'); //mycam -> myFace
var opponentcam = document.getElementById('opponent-cam'); // yourVideo -> yourcam ->peerFace  
var min = document.getElementById('min');
var rq = document.getElementById('rq');
var buttons = document.getElementById('buttons');

/* // 웹페이지 로드할때 */




//------------------------------STT----------------------------------------//
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'ko-KR';

let makeNewTextContent = function () {
    p = document.createElement('p');
    p.focus();
    document.querySelector('.chatLog').appendChild(p);
};

let p = null;

recognition.start();
recognition.onstart = function () {
    makeNewTextContent(); // 음성 인식 시작시마다 새로운 문단을 추가한다.
};
recognition.onend = function () {
    recognition.start();
};

recognition.onresult = function (e) {
    let texts = Array.from(e.results)
        .map(results => results[0].transcript).join("");

    texts.replace(/느낌표|강조|뿅/gi, '❗️');

    p.textContent = texts;
};

//-----------------------------------------------------------------------------------------------------------------