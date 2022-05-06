import "./firebase_initialization.js";
import {updateDoc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;
// stopRecord(ref); } 얼굴 인식 감정 분석 함수
async function recognizeFaceEmotion() {
    // 3초마다 얼굴 감정 분석 faceExpressionsRecognition();
    const localVideo = document.getElementById('localVideo');
    //얼굴 인식 모델 load

    const detections = await faceapi
        .detectAllFaces(
            localVideo,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()

    if (detections.length == 0) {
        return "Normal";
    }
    var emotions = Object
        .keys(detections[0].expressions)
        .map(function (key) {
            return detections[0].expressions[key];
        });
    var max = Math
        .max
        .apply(null, emotions);
    // 객체 배열 속 key 값을 console로 찍기

    var emt = transformEmotion(getKeyByValue(detections[0].expressions, max));
    //console.log("Face : " + emt);
    return emt;
    // console.log(detections);

    function getKeyByValue(object, value) {
        return Object
            .keys(object)
            .find(key => object[key] === value);
    }
}

async function startRecord() {
    // console.log('Start Recording.');
    leftchannel = [];
    rightchannel = [];
    recorder = null;
    recordingLength = 0;
    mediaStream = null;
    sampleRate = 44100;
    context = null;
    blob = null;

    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({
        audio: true
    }, function (e) {

        // creates the audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();

        // creates an audio node from the microphone incoming stream
        mediaStream = context.createMediaStreamSource(e);

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
        // bufferSize: the onaudioprocess event is called when the buffer is full
        var bufferSize = 2048;
        var numberOfInputChannels = 2;
        var numberOfOutputChannels = 2;
        if (context.createScriptProcessor) {
            recorder = context.createScriptProcessor(
                bufferSize,
                numberOfInputChannels,
                numberOfOutputChannels
            );
        } else {
            recorder = context.createJavaScriptNode(
                bufferSize,
                numberOfInputChannels,
                numberOfOutputChannels
            );
        }

        recorder.onaudioprocess = function (e) {
            leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
            recordingLength += bufferSize;
        }

        // we connect the recorder
        mediaStream.connect(recorder);
        recorder.connect(context.destination);
    }, function (e) {
        console.error(e);
    });
}
async function stopRecord(ref = null) {
    // console.log('Stop Recording.');

    recorder.disconnect(context.destination);
    mediaStream.disconnect(recorder);

    if (ref == null) {
        return;
    }

    // we flat the left and right channels down Float32Array[] => Float32Array
    var leftBuffer = flattenArray(leftchannel, recordingLength);
    var rightBuffer = flattenArray(rightchannel, recordingLength);
    // we interleave both channels together [left[0],right[0],left[1],right[1],...]
    var interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i< interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    blob = new Blob([view], {type: 'audio/wav'});

    // var url = URL.createObjectURL(blob);

    // var a = document.createElement("a");
    // document
    //     .body
    //     .appendChild(a);
    // a.style = "display: none";
    // a.href = url;
    // a.download = "sample.wav";
    // a.click();
    // window
    //     .URL
    //     .revokeObjectURL(url);

    var reader = new FileReader();

    reader.onloadend = function () {
        var base64 = reader
            .result
            .split(",")[1];

        fetch('https://voice-emotion.jp.ngrok.io', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({wav_base64: base64})
        })
            .then(res => res.json())
            .then(res => {
                var v_emt = transformEmotion(res.emotion);
                // var v_emt = res.emotion;
                // var f_emt = recognizeFaceEmotion();

                console.log("Voice : " + v_emt + " Face : " + f_emt);

                var emt = uniteEmmtion(v_emt, f_emt);
                console.log("Emotion : " + emt);
                updateDoc((ref), {emotion: emt});
            });
    }
    reader.readAsDataURL(blob);
    var f_emt = await recognizeFaceEmotion();

}

function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function transformEmotion(emt) {
    if (emt == 'happiness' || emt == 'surprised') {
        return 'Good';
    } else if (emt == 'sadness' || emt == 'fear') {
        return 'Sad'
    } else if (emt == 'disgust' || emt == 'angry') {
        return 'Bad';
    } else {
        return 'Normal';
    }
}

function uniteEmmtion(v, f) {
    if (v == 'Good') {
        return 'Good';
    } else if (v == 'Sad') {
        return 'Sad';
    } else if (f == 'Bad') {
        return 'Bad';
    } else {
        return 'Normal';
    }
}

function getEmotion(){
onSnapshot(speechCol, (snapshot) => {
        snapshot
            .docChanges()
            .forEach(async (change) => {
                if (change.type === "added") {
                    let data = change
                        .doc
                        .data();
                    let parsed_data = JSON.parse(JSON.stringify(data))
                    let speecher = parsed_data.speecher;
                    let text = parsed_data.text;

                    if (speecher == name) {
                        let myBox = document.createElement("div");
                        myBox.setAttribute("class", "myBox");

                        let myText = document.createElement("div");

                        myText.setAttribute("id", "myText");
                        myText.textContent = text;

                        console.log("my text: ", myText.textContent);

                        myBox.append(myText);
                        document
                            .querySelector(".chatLog")
                            .append(myBox);

                    } else {
                        let oppBox = document.createElement('div');
                        oppBox.setAttribute("class", "oppBox");

                        let oppText = document.createElement('div');
                        oppText.setAttribute("id", "oppText");
                        oppText.textContent = text;
                        console.log("opponent text : ", oppText.textContent);
                        oppBox.append(oppText);
                        document
                            .querySelector('.chatLog')
                            .append(oppBox);

                        if (!isOpponent) {
                            updateDoc(doc(chatLogCol, startTime), {opponent: speecher});
                            isOpponent = true;
                        }
                    }
                    let minbox = document.querySelector('.min-content');
                    minbox.scrollTop = minbox.scrollHeight;

                }
            });
    });
}

export {
    startRecord,
    stopRecord,
    recognizeFaceEmotion
};