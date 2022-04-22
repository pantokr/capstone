// Create an account on Firebase, and use the credentials they give you in place
// of the following
import "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

// var config = {     apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
// authDomain: "meecord-223cc.firebaseapp.com",     databaseURL:
// "https://meecord-223cc-default-rtdb.firebaseio.com",     projectId:
// "meecord-223cc",     storageBucket: "meecord-223cc.appspot.com",
// messagingSenderId: "291741382850",     appId:
// "1:291741382850:web:d91f54be8c6b004733e35b"   };  initializeApp(config);

var canvas = document.getElementById('canvas');
// var photo = document.getElementById('photo'); canvas.setAttribute('width',
// 1200); canvas.setAttribute('height', 900); var database =
// firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random() * 1000000000);

// Create an account on Viagenie (http://numb.viagenie.ca/), and replace
// {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username':
// 'websitebeaver@email.com'} with the information from your account
var servers = {
    'iceServers': [
        {
            'urls': 'stun:stun.services.mozilla.com'
        }, {
            'urls': 'stun:stun.l.google.com:19302'
        }, {
            'urls': 'turn:numb.viagenie.ca',
            'credential': 'tjdfkr0907',
            'username': 'osr0907@gmail.com'
        }
    ]
};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (
    event => event.candidate
        ? sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
        : console.log("Sent All Ice")
);
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

document
    .querySelector(".callBtn")
    .addEventListener("click", showFriendsFace);

function sendMessage(senderId, data) {
    var msg = database.push({sender: senderId, message: data});
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data
        .val()
        .sender;
    if (sender != yourId) {
        if (msg.ice != undefined) 
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer") 
            pc
                .setRemoteDescription(new RTCSessionDescription(msg.sdp))
                .then(() => pc.createAnswer())
                .then(answer => pc.setLocalDescription(answer))
                .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        else if (msg.sdp.type == "answer") 
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    };

// database.on('child_added', readMessage);

function showMyFace() {
    navigator
        .mediaDevices
        .getUserMedia({audio: true, video: true})
        .then(stream => yourVideo.srcObject = stream)
        .then(stream => pc.addStream(stream));

    // console.log('recordedMediaURL : ', recordedMediaURL);
    setInterval(function () {

        takeMyPicture();
        // var link = document.createElement('a'); link.download = 'filename.png';
        // link.href = document.getElementById('canvas').toDataURL(); link.click();
    }, 10000);
};

//상대화면 캡쳐
// function takepicture() {
//     var context = canvas.getContext('2d');
//     // var element = document.getElementById('content');
//     canvas.width = friendsVideo.videoWidth;
//     canvas.height = friendsVideo.videoHeight;
//     // var video = element.clientHeight; var w = element.clientWidth;
//     context.drawImage(
//         friendsVideo,
//         0,
//         0,
//         friendsVideo.videoWidth,
//         friendsVideo.videoHeight
//     );

//     var data = canvas.toDataURL('image/png');
//     // photo.setAttribute('src', data);
// }
function takeMyPicture() {
    var context = canvas.getContext('2d');
    // var element = document.getElementById('content');
    canvas.width = yourVideo.videoWidth;
    canvas.height = yourVideo.videoHeight;
    // var video = element.clientHeight; var w = element.clientWidth;
    context.drawImage(yourVideo, 0, 0, yourVideo.videoWidth, yourVideo.videoHeight);

    var data = canvas.toDataURL('image/png');
    console.log(data);
    // var reader = new FileReader(); reader.readAsDataURL(data); reader.onload =
    // function  () {   console.log(reader.result); };    photo.setAttribute('src',
    // data);
}

let isRecording = false; // MediaRecorder 변수 생성
let mediaRecorder = null; // 녹음 데이터 저장 배열
const audioArray = [];
recordStart();

setInterval(() => {
    recordStop();

    recordStart();
}, 10000);

async function recordStart(event) {
    if (!isRecording) { // 마이크 mediaStream 생성: Promise를 반환하므로 async/await 사용
        const mediaStream = await navigator
            .mediaDevices
            .getUserMedia({audio: true}); // MediaRecorder 생성
        mediaRecorder = new MediaRecorder(mediaStream); // 이벤트핸들러: 녹음 데이터 취득 처리
        mediaRecorder.ondataavailable = (event) => {
            audioArray.push(event.data); // 오디오 데이터가 취득될 때마다 배열에 담아둔다.
        } // 이벤트핸들러: 녹음 종료 처리 & 재생하기
        mediaRecorder.onstop = (event) => { // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합친다: 코덱도 설정해준다.
            const blob = new Blob(audioArray, {"type": "audio/wav codecs=opus"});
            audioArray.splice(0); // 기존 오디오 데이터들은 모두 비워 초기화한다.  Blob 데이터에 접근할 수 있는 주소를 생성한다.
            const blobURL = window
                .URL
                .createObjectURL(blob); // audio엘리먼트로 재생한다.
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                var base64data = reader.result;
                console.log(base64data);
            }
        } // 녹음 시작
        mediaRecorder.start();
        isRecording = true;
    }
}
async function recordStop(event) {
    if (isRecording) { // 녹음 종료
        mediaRecorder.stop();
        isRecording = false;
    }
}

function showFriendsFace() {
    pc
        .createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));

    // setInterval(function () {    console.log('recordedMediaURL : ',
    // recordedMediaURL);   takepicture();   var link = document.createElement('a');
    // link.download = 'filename.png';   link.href =
    // document.getElementById('canvas').toDataURL()   link.click(); }, 3000);
}

// meeting_start 설정 <!-- 모바일 환경일때 mycam 가림 + 대화록, 질문추천 창 사이즈 조절 -->

var mycam = document.getElementById('mycam');
var yourvideo = document.getElementById('yourVideo');
var min = document.getElementById('min');
var rq = document.getElementById('rq');


  /* // 웹페이지 로드할때 */
window.onload = function (event) {
    showMyFace();
    console.log("load completed")
    // canvas.style.visibility =hidden;
    var innerWidth = window.innerWidth;
    if (innerWidth<= "768") {
        hideMyCam();
        adjustHalfSize();
    } else {
        showMyCam();
        adjustOriginSize();
    }

}; 
  /* // 웹페이지 사이즈 조정할때 */

window.onresize = function (event) {
    showMyFace();
    var innerWidth = window.innerWidth;
    if (innerWidth <= "768") {
        hideMyCam();
        adjustHalfSize();
    } else {
        showMyCam();
        adjustOriginSize()
    }
};

var hideMyCam = function () {
    mycam.style.display = "none";
    yourvideo.style.display = "none";
};
var showMyCam = function () {
    mycam.style.display = "block";
    yourvideo.style.display = "block";
};
var adjustOriginSize = function () {
    min.style.height = "90vh";
    rq.style.height = "90vh";
};
var adjustHalfSize = function () {
    min.style.height = "45vh";
    rq.style.height = "45vh";
};
