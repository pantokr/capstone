import "../firebase_initialization.js";
import { updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;
var faceMaxValue;
var voiceMaxValue;

//good, sad, bad, normal count
var emotionCount = [0,0,0,0];

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
    // console.log(detections[0]);
    // console.log(detections[0].expressions);
    

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
    faceMaxValue = max;
    // 객체 배열 속 key 값을 console로 찍기

    var emt = transformEmotion(getKeyByValue(detections[0].expressions, max));
    // console.log("Face :"+ getKeyByValue(detections[0].expressions, max));
    // console.log("Face max Value : " + max);
    console.log("--------------------------------------------------");
    console.log("trans 하기 전 Face emotion : " + detections[0].expressions);

    return emt;
    

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
    try {
        recorder.disconnect(context.destination);
        mediaStream.disconnect(recorder);
    } catch (error) {
        return;
    }


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
    for (var i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    blob = new Blob([view], { type: 'audio/wav' });

    // var url = URL.createObjectURL(blob); var a = document.createElement("a");
    // document     .body     .appendChild(a); a.style = "display: none"; a.href =
    // url; a.download = "sample.wav"; a.click(); window     .URL
    // .revokeObjectURL(url);

    var reader = new FileReader();
    // var f_emt = await recognizeFaceEmotion();

    reader.onloadend = function () {
        var base64 = reader
            .result
            .split(",")[1];

        fetch('https://open-py.jp.ngrok.io/voice-emotion', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wav_base64: base64 })
        })
            .then(res => res.json())
            .then(res => {

                var v_emt = transformEmotion(res.emotion);
                // var v_emt = res.emotion; var f_emt = recognizeFaceEmotion();
                // var f_emt = recognizeFaceEmotion();
                voiceMaxValue = res.accuracy;

                console.log("Voice emotion : " + v_emt + " Face emotion : " + f_emt);
                console.log("Voice emotion value :" + voiceMaxValue + "Face emotion value :" + faceMaxValue);

                var emt = uniteEmotion(v_emt, f_emt);
                
                //emotion count
                if (emt == 'Good'){emotionCount[0]++;}
                else if (emt == 'Sad'){emotionCount[1]++;}
                else if (emt == 'Bad'){emotionCount[2]++;}
                else if (emt == 'Normal'){emotionCount[3]++;}
                console.log("emotion Count : " + emotionCount);
                //console.log("Emotion : " + emt);

                // if(emt == 'Bad'){     setEmotion(1); } else if(emt == 'Good'){ setEmotion(2);
                // } else if(emt == 'Sad'){     setEmotion(3); } else{ setEmotion(4); }

                updateDoc((ref), { emotion: emt });
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
    let r_emt = null;

    if (emt == 'happiness') {
        r_emt = 'happy';
    } else if (emt == 'fear') {
        r_emt = 'fearful';
    } else if (emt == 'disgust') {
        r_emt = 'disgusted';
    } else if (emt == 'sadness') {
        r_emt = 'sad';
    } else if (emt == 'surprise') {
        r_emt = 'surprised';
    }
    else {
        r_emt = emt;
    }

    if (r_emt == 'happy' || r_emt == 'surprised') {
        return 'Good';
    } else if (r_emt == 'sad' || r_emt == 'fearful') {
        return 'Sad'
    } else if (r_emt == 'disgusted' || r_emt == 'angry') {
        return 'Bad';
    } else {
        return 'Normal';
    }
}

function uniteEmotion(v, f) {
    // if (v == 'Good' || f == 'Good') {
    //     return 'Good';
    // } else if (v == 'Sad' || f == 'Sad') {
    //     return 'Sad';
    // } else if (v == 'Bad' || f == 'Bad') {
    //     return 'Bad';
    // } else {
    //     return 'Normal';
    // }
    
    // face, voice 감정 조합
    // face 인식 불가 typeerror 처리
    if(f != 'Good' && f != 'Sad' && f != 'Bad' && f != 'Normal'){
        console.log("emotion result : " + v);
        return v;
    }
    if((v == 'Good' && f == 'Bad') || (v == 'Good' && f == 'Sad') || (v == 'Sad' && f == 'Good') || (v == 'Sad' && f == 'Bad') || (v == 'Bad' && f == 'Good') || (v == 'Bad' && f == 'Sad')){
        if(faceMaxValue == voiceMaxValue) {
            console.log("emotion result : " + v);
            return v;
        }
        console.log("emotion result : " + (faceMaxValue > voiceMaxValue) ? f : v);
        return (faceMaxValue > voiceMaxValue) ? f : v;
    }
    else if(v == 'Normal' && f != 'Normal'){
        console.log("emotion result : " + f);
        return f;
    }
    else if(v != 'Normal' && f == 'Normal'){
        console.log("emotion result : " + v);
        return v;
    }
    else if(v == 'Normal' && f == 'Normal'){
        console.log("emotion result : " + "Normal");
        return 'Normal';
    }
}

function setEmotion(result) {
    const emotion = document.querySelector('#emotion');


    if (result == 1) {
        emotion.innerHTML = "😡";
    } else if (result == 2) {
        emotion.innerHTML = "😊";
    } else if (result == 3) {
        emotion.innerHTML = "😭";
    } else if (result == 4) {
        emotion.innerHTML = "😐";
    }


}

export {
    startRecord,
    stopRecord,
    setEmotion
};