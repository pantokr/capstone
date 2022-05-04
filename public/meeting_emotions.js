var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;





//얼굴 인식 감정 분석 함수
function faceExpressionsRecognition(){
    //상대방 video
    const remoteVideo = document.getElementById('remoteVideo');
    //얼굴 인식 모델 load
    faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    faceapi.nets.faceExpressionNet.loadFromUri('/models');
    //인식된 감정 중에 max 값 return 해주는 함수
    function getKeyByValue(object, value) {   
        return Object.keys(object).find(key => object[key] === value); 
    } 

    // 3초마다 얼굴 감정 분석
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(remoteVideo, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        var emotions = Object.keys(detections[0].expressions).map(function (key) {
            return detections[0].expressions[key]; 
        }); 
        var max = Math.max.apply(null,emotions); 
        // 객체 배열 속 key 값을 console로 찍기
        console.log(getKeyByValue(detections[0].expressions,max));
        // console.log(detections);

    }, 3000);
}

async function startRecord() {
  console.log('Start Recording.');

  // Initialize recorder
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  navigator.getUserMedia({
    audio: true
  }, function (e) {
    console.log("Got Media.");

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
async function stopRecord(status = false) {
  console.log('Stop Recording.');

  recorder.disconnect(context.destination);
  mediaStream.disconnect(recorder);

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

  if (status == false) {
    return null;
  }

  // our final blob
  blob = new Blob([view], { type: 'audio/wav' });

  var reader = new FileReader();
  reader.readAsDataURL(blob);

  reader.onloadend = function () {
    var base64 = reader.result.split(",")[1];

    fetch('https://voice-emotion.jp.ngrok.io', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ wav_base64: base64 })
    })
      .then(res => res.json())
      .then(res => {
        console.log(res.emotion + " to " + transformEmotion(res.emotion));

        return transformEmotion(res.emotion);
      });
  }
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
  }
  else if (emt == 'sadness' || emt == 'fear') {
    return 'Sad'
  }
  else if (emt == 'disgust' || emt == 'angry') {
    return 'Bad';
  }
  else {
    return 'Normal';
  }
}

function takeMyPicture() {
  var context = canvas.getContext('2d');
  // var element = document.getElementById('content');
  canvas.width = localVideo.videoWidth;
  canvas.height = localVideo.videoHeight;
  // var video = element.clientHeight; var w = element.clientWidth;
  context.drawImage(
    localVideo,
    0,
    0,
    localVideo.videoWidth,
    localVideo.videoHeight
  );

  var data = canvas.toDataURL('image/png');
  console.log(data);
}

export {
  startRecord, stopRecord, faceExpressionsRecognition
};