import { app } from "./firebase_initialization.js";
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {recordStart, recordStop, takeMyPicture} from "./media_capture.js";

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

function init() {
  // 자동으로 카메라, 마이크 켜지게 구현, 버튼 클릭 대신 window.onload 사용
  // document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  window.onload = openUserMedia();
  document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);
  // roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

async function createRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";

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
  // Listen for remote ICE candidates above
}

function joinRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";
  
  $('#modal-dialog').modal();


  document.querySelector('#confirmJoinBtn').
    addEventListener('click', async () => {
      roomId = document.querySelector('#room-id').value;
      console.log('Join room: ', roomId);
      document.querySelector(
        '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
      await joinRoomById(roomId);
    }, { once: true });
  // roomDialog.open();

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


//상대화면 캡쳐
// function takepicture() {
//   var context = canvas.getContext('2d');
//   var remoteVideo = getElementById('remoteVideo');
//   // var element = document.getElementById('content');
//   canvas.width = remoteVideo.videoWidth;
//   canvas.height = remoteVideo.videoHeight;
//   // var video = element.clientHeight;
//   // var w = element.clientWidth;
//   context.drawImage(remoteVideo, 0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);

//   var data = canvas.toDataURL('image/png');
//   photo.setAttribute('src', data);
// }



// <!-- 모바일 환경일때 mycam 가림 + 대화록, 질문추천 창 사이즈 조절 -->

var mycam = document.getElementById('mycam'); //mycam -> myFace
var opponentcam = document.getElementById('opponent-cam'); // yourVideo -> yourcam ->peerFace  
var min = document.getElementById('min');
var rq = document.getElementById('rq');
var buttons = document.getElementById('buttons');

/* // 웹페이지 로드할때 */
window.onload = function (event) {
  // showMyFace();
  console.log("load completed")
  // canvas.style.visibility =hidden;
  var innerWidth = window.innerWidth;
  if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
  else { showMyCam(); adjustOriginSize(); }


}

/* // 웹페이지 사이즈 조정할때 */
window.onresize = function (event) {
  // showMyFace();
  var innerWidth = window.innerWidth;
  if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
  else { showMyCam(); adjustOriginSize() }
}

var hideMyCam = function () {
  mycam.style.display = "none";
  yourvideo.style.display = "none";
}
var showMyCam = function () {
  mycam.style.display = "block";
  // yourvideo.style.display = "block";
}
var adjustOriginSize = function () {
  min.style.height = "90vh";
  rq.style.height = "90vh";
}
var adjustHalfSize = function () {
  min.style.height = "45vh";
  rq.style.height = "45vh";
}





//------------------------------STT----------------------------------------//
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'ko-KR';

let makeNewTextContent = function () {
    p = document.createElement('p');
    document.querySelector('.chatLog').appendChild(p);
};

let p = null;

recognition.start();
recognition.onstart = function () {
    makeNewTextContent(); // 음성 인식 시작시마다 새로운 문단을 추가한다.
    recordStart();
};
recognition.onend = function () {
    recognition.start();
};

recognition.onresult = function (e) {
    let texts = Array.from(e.results)
        .map(results => results[0].transcript).join("");

    // texts.replace(/느낌표|강조|뿅/gi, '❗️');

    p.textContent = texts;
    recordStop();
};

//-----------------------------------------------------------------------------------------------------------------


// let isRecording = false; // MediaRecorder 변수 생성
// let mediaRecorder = null; // 녹음 데이터 저장 배열
// const audioArray = [];


// // recordStart();

// setInterval(() => {
//     // recordStop();

//     // recordStart();
//     // takeMyPicture();
// }, 5000);

// async function recordStart(event) {
//     if (!isRecording) { // 마이크 mediaStream 생성: Promise를 반환하므로 async/await 사용
//         const mediaStream = await navigator
//             .mediaDevices
//             .getUserMedia({audio: true}); // MediaRecorder 생성
//         mediaRecorder = new MediaRecorder(mediaStream); // 이벤트핸들러: 녹음 데이터 취득 처리
//         mediaRecorder.ondataavailable = (event) => {
//             audioArray.push(event.data); // 오디오 데이터가 취득될 때마다 배열에 담아둔다.
//         } // 이벤트핸들러: 녹음 종료 처리 & 재생하기
//         mediaRecorder.onstop = (event) => { // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합친다: 코덱도 설정해준다.
//             const blob = new Blob(audioArray, {"type": "audio/wav codecs=opus"});
//             audioArray.splice(0); // 기존 오디오 데이터들은 모두 비워 초기화한다.  Blob 데이터에 접근할 수 있는 주소를 생성한다.
            
//             var reader = new FileReader();
//             reader.readAsDataURL(blob);
//             reader.onloadend = function () {
//                 var base64data = reader.result;
//                 console.log(base64data);
//             }
//         } // 녹음 시작
//         mediaRecorder.start();
//         isRecording = true;
//         console.log("start recording");
//     }
// }

// async function recordStop(event) {
//     if (isRecording) { // 녹음 종료
//         mediaRecorder.stop();
//         isRecording = false;
//         console.log("stop recording");
//     }
// }

// function takeMyPicture() {
//     var context = canvas.getContext('2d');
//     // var element = document.getElementById('content');
//     canvas.width = localVideo.videoWidth;
//     canvas.height = localVideo.videoHeight;
//     // var video = element.clientHeight; var w = element.clientWidth;
//     context.drawImage(localVideo, 0, 0, localVideo.videoWidth, localVideo.videoHeight);

//     var data = canvas.toDataURL('image/png');
//     console.log(data);
// }