import "./firebase_initialization.js";
import { startSTT } from "./meeting_stt.js"
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

// faceapi.nets.tinyFaceDetector.loadFromUri('/models')
// faceapi.nets.faceLandmark68Net.loadFromUri('/models')
// faceapi.nets.faceRecognitionNet.loadFromUri('/models')
// faceapi.nets.faceExpressionNet.loadFromUri('/models')

function init() {
  // 자동으로 카메라, 마이크 켜지게 구현, 버튼 클릭 대신 window.onload 사용
  // document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  window.onload = openUserMedia();
  // document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);

  document.querySelector('#roomNum').style.display = "none";

  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));

}

async function createRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";

  document.querySelector('#roomNum').style.display = "block";

  console.log('createBtn has clicked!');
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
    '#currentRoom').innerText = `현재 참여하신 룸은 ${roomRef.id} 입니다`;
  // `Current room is ${roomRef.id} - You are the caller!`;
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


  //-------------------------STT-------------------------------------
  startSTT(roomRef.id, true);
}
function btndisappear() {
  document.querySelector('#createBtn').style.display = "none";
  document.querySelector('#joinBtn').style.display = "none";

  document.querySelector('#roomNum').style.display = "block";
}
function joinRoom() {
  // createRoom, joinRoom 발생 시 disabled 속성이 아닌 display none 속성으로 아예 버튼이 안보이게 구현
  // document.querySelector('#createBtn').disabled = true;
  // document.querySelector('#joinBtn').disabled = true;
  console.log('joinroom btn has cliked!');
  
  // document.querySelector('#createBtn').style.display = "none";
  // document.querySelector('#joinBtn').style.display = "none";

  // document.querySelector('#roomNum').style.display = "block";

  
  document.querySelector('#confirmJoinBtn').addEventListener('click', btndisappear);
  
  document.querySelector('#confirmJoinBtn').
    addEventListener('click', async () => {

      
      
      roomId = document.querySelector('#room-id').value;
      console.log('Join room: ', roomId);
      
      document.querySelector(
        '#currentRoom').innerText =
        // `Current room is ${roomId} - You are the callee!`;
        `현재 참여하신 룸은 ${roomId} 입니다`;
      await joinRoomById(roomId);
    }, { once: true });
  roomDialog.open();

  // setInterval(function () {
  //   console.log('recordedMediaURL : ', recordedMediaURL);
  //   takepicture();
  //   var link = document.createElement('a');
  //   link.download = 'filename.png';
  //   link.href = document.getElementById('canvas').toDataURL()
  //   link.click();
  // }, 3000);
}

async function joinRoomById(roomId) {
  const db = getFirestore();
  const roomRef = doc(collection(db, 'rooms'), `${roomId}`);
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


  // joinRoom STT------------------------------------------------------------------------
  startSTT(roomRef.id, false);
}

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
  // document.querySelector('#hangupBtn').disabled = false;
}

// const remoteVideo = document.getElementById('remoteVideo');

// remoteVideo.addEventListener('playing', () => {
//   function getKeyByValue(object, value) {
//     return Object.keys(object).find(key => object[key] === value);
//   }
//   const canvas = faceapi.createCanvasFromMedia(video)
//   document.body.append(canvas)
//   const displaySize = { width: video.width, height: video.height }
//   faceapi.matchDimensions(canvas, displaySize)
//   setInterval(async () => {
//     const detections = await faceapi.detectAllFaces(remoteVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
//     const resizedDetections = faceapi.resizeResults(detections, displaySize)
//     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//     faceapi.draw.drawDetections(canvas, resizedDetections)
//     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
//     faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

//     var emotions = Object.keys(detections[0].expressions).map(function (key) { return detections[0].expressions[key]; });
//     var max = Math.max.apply(null, emotions);
//     console.log(getKeyByValue(detections[0].expressions,max))
//   }, 3000);
// })

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
    const calleeCandidates = await getDoc(collection(roomRef, 'calleeCandidates'));
    calleeCandidates.forEach(async candidate => {
      await deleteDoc(candidate.ref);
    });
    const callerCandidates = await getDoc(collection(roomRef, 'calleeCandidates'));
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

const muteBtn = document.getElementById("muteBtn");
const cameraBtn = document.getElementById("cameraBtn");

let muted = false;
let cameraOff = false;

// 오디오처리
function handleMuteClick() {
  // 오디오 on/off
  localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  // 오디오 on/off 버튼 처리
  if (!muted) {
    // muteBtn.innerText = "Unmute";
    document.getElementById("muteBtn").src = "images/mute.png";
    muted = true;
  } else {
    // muteBtn.innerText = "Mute";
    document.getElementById("muteBtn").src = "images/unmute.png";
    muted = false;
  }
}
// 카메라 처리
function handleCameraClick() {
  // 카메라 on/off
  localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));

  // 카메라 on/off 버튼 처리
  if (cameraOff) {
    // cameraBtn.innerText = "Turn Camera Off";
    document.getElementById("cameraBtn").src = "images/cameraon.png";
    cameraOff = false;
  } else {
    // cameraBtn.innerText = "Turn Camera On";
    document.getElementById("cameraBtn").src = "images/cameraoff.png";
    cameraOff = true;
  }
}


// 카메라, 오디오 버튼 addEventListener
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);