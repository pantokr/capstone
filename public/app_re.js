const socket = io();

const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const mycam = document.getElementById("mycam"); //myFace video 담는 div
const opponentcam = document.getElementById("opponent-cam"); //peerFace video 담는 div
const canvas = document.getElementById('canvas');

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
var yourId = Math.floor(Math.random() * 1000000000);
//Create an account on Firebase, and use the credentials they give you in place of the following
// var config = {
//     apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
//     authDomain: "meecord-223cc.firebaseapp.com",
//     databaseURL: "https://meecord-223cc-default-rtdb.firebaseio.com",
//     projectId: "meecord-223cc",
//     storageBucket: "meecord-223cc.appspot.com",
//     messagingSenderId: "291741382850",
//     appId: "1:291741382850:web:d91f54be8c6b004733e35b"
//   };
//   firebase.initializeApp(config);


// 유저 카메라 정보
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

// 유저 스트림 정보
async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
      audio: true,
    });
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    await getCameras();
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}


// 오디오 처리
function handleMuteClick() {
  // 오디오 on/off
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  // 오디오 on/off 버튼 처리
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

// 카메라 처리
function handleCameraClick() {
  // 카메라 on/off
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  // 카메라 on/off 버튼 처리
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

//유저 카메라 선택
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

// 카메라, 오디오 버튼 addEventListener
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC Code

function makeConnection() {
  var ices = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
  myPeerConnection = new RTCPeerConnection(ices);

  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  peerFace.srcObject = data.stream;
  //3초 간격으로 상대 화면 캡쳐
  setInterval(function () {
    // console.log('recordedMediaURL : ', recordedMediaURL);
    takepicture();
    var link = document.createElement('a');
    link.download = 'filename.png';
    link.href = document.getElementById('canvas').toDataURL()
    //다운로드 하려면 주석해제
    // link.click();
  }, 3000);
}




//상대화면 캡쳐
function takepicture() {
  var context = canvas.getContext('2d');
  // var element = document.getElementById('content');
  canvas.width = peerFace.videoWidth;
  canvas.height = peerFace.videoHeight;
  // var video = element.clientHeight;
  // var w = element.clientWidth;
  context.drawImage(peerFace, 0, 0, peerFace.videoWidth, peerFace.videoHeight);

  // var data = canvas.toDataURL('image/png');
  // photo.setAttribute('src', data);
}







// <!-- 모바일 환경일때 mycam 가림 + 대화록, 질문추천 창 사이즈 조절 -->
/* // 웹페이지 로드할때 */


window.onload = function (event) {
  // showMyFace();
  console.log("load completed")
  // canvas.style.visibility =hidden;
  var innerWidth = window.innerWidth;
  if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
  else { reshowMyCam(); adjustOriginSize(); }


}


//------------------------------STT----------------------------------------//
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = 'ko-KR';

let makeNewTextContent = function () {
  p = document.createElement('p');
  document.querySelector('.min-content').appendChild(p);
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



{/* // 웹페이지 사이즈 조정할때 */ }
window.onresize = function (event) {
  // showMyFace();
  var innerWidth = window.innerWidth;
  if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
  else { reshowMyCam(); adjustOriginSize() }
}

hideMyCam = function () {
  mycam.style.display = "none";
  opponentcam.style.display = "none";
}
reshowMyCam = function () {
  mycam.style.display = "block";
  opponentcam.style.display = "block";
}
adjustOriginSize = function () {
  min.style.height = "90vh";
  rq.style.height = "90vh";
}
adjustHalfSize = function () {
  min.style.height = "45vh";
  rq.style.height = "45vh";
}
