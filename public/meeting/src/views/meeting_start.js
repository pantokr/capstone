//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
    apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
    authDomain: "meecord-223cc.firebaseapp.com",
    databaseURL: "https://meecord-223cc-default-rtdb.firebaseio.com",
    projectId: "meecord-223cc",
    storageBucket: "meecord-223cc.appspot.com",
    messagingSenderId: "291741382850",
    appId: "1:291741382850:web:d91f54be8c6b004733e35b"
  };
  firebase.initializeApp(config);


  var canvas = document.getElementById('canvas');
  // var photo = document.getElementById('photo');
  // canvas.setAttribute('width', 1200);
  // canvas.setAttribute('height', 900);
  
  
  
  var database = firebase.database().ref();
  var yourVideo = document.getElementById("yourVideo");
  var friendsVideo = document.getElementById("friendsVideo");
  var yourId = Math.floor(Math.random() * 1000000000);
  
  //Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
  var servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'tjdfkr0907', 'username': 'osr0907@gmail.com' }] };
  var pc = new RTCPeerConnection(servers);
  pc.onicecandidate = (event => event.candidate ? sendMessage(yourId, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
  pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

  document
  .querySelector(".callBtn")
  .addEventListener("click", showFriendsFace);

  function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
  }

  function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
      if (msg.ice != undefined)
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      else if (msg.sdp.type == "offer")
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          .then(() => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(() => sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription })));
      else if (msg.sdp.type == "answer")
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
  };

  database.on('child_added', readMessage);

  function showMyFace() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => yourVideo.srcObject = stream)
      .then(stream => pc.addStream(stream));
  }


  //상대화면 캡쳐
  function takepicture() {
  var context = canvas.getContext('2d');
  var element = document.getElementById('content');
  canvas.width = friendsVideo.videoWidth;
  canvas.height = friendsVideo.videoHeight;
  // var video = element.clientHeight;
  // var w = element.clientWidth;
  context.drawImage(friendsVideo,0,0,friendsVideo.videoWidth,friendsVideo.videoHeight);
  
  var data = canvas.toDataURL('image/png');
  // photo.setAttribute('src', data);
}

  function showFriendsFace() {
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription })));

      setInterval(function () {
      // console.log('recordedMediaURL : ', recordedMediaURL);
      takepicture();
      var link = document.createElement('a');
      link.download = 'filename.png';
      link.href = document.getElementById('canvas').toDataURL()
      link.click();
    }, 3000);
  }

  // meeting_start 설정

  // <!-- 모바일 환경일때 mycam 가림 + 대화록, 질문추천 창 사이즈 조절 -->

  var mycam = document.getElementById('mycam');
  var yourvideo = document.getElementById('yourVideo');
  var min = document.getElementById('min');
  var rq = document.getElementById('rq');

  {/* // 웹페이지 로드할때 */ }
  window.onload = function (event) {
    showMyFace();
    console.log("load completed")
    // canvas.style.visibility =hidden;
    var innerWidth = window.innerWidth;
    if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
    else { showMyCam(); adjustOriginSize(); }


  }

  {/* // 웹페이지 사이즈 조정할때 */ }
  window.onresize = function (event) {
    showMyFace();
    var innerWidth = window.innerWidth;
    if (innerWidth <= "768") { hideMyCam(); adjustHalfSize(); }
    else { showMyCam(); adjustOriginSize() }
  }

  hideMyCam = function () {
    mycam.style.display = "none";
    yourvideo.style.display = "none";
  }
  showMyCam = function () {
    mycam.style.display = "block";
    yourvideo.style.display = "block";
  }
  adjustOriginSize = function () {
    min.style.height = "90vh";
    rq.style.height = "90vh";
  }
  adjustHalfSize = function () {
    min.style.height = "45vh";
    rq.style.height = "45vh";
  }

