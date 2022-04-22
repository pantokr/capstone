let isRecording = false; // MediaRecorder 변수 생성
let mediaRecorder = null; // 녹음 데이터 저장 배열
const audioArray = [];


recordStart();

setInterval(() => {
    recordStop();

    recordStart();
    takeMyPicture();
}, 5000);

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

function takeMyPicture() {
    var context = canvas.getContext('2d');
    // var element = document.getElementById('content');
    canvas.width = yourVideo.videoWidth;
    canvas.height = yourVideo.videoHeight;
    // var video = element.clientHeight; var w = element.clientWidth;
    context.drawImage(yourVideo, 0, 0, yourVideo.videoWidth, yourVideo.videoHeight);

    var data = canvas.toDataURL('image/png');
    console.log(data);
}