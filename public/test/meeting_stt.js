import { startRecord, stopRecord } from "./meeting_emotions.js";

async function startSTT(roomId, isCaller) {
  faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  faceapi.nets.faceExpressionNet.loadFromUri("./models");

  const muteBtn = document.getElementById("muteBtn");

  window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognizeChat();

  function recognizeChat() {
    let recognition = new SpeechRecognition();
    let finalText = null;
    let isMuted = false;
    let count = 0;
    recognition.lang = "ko-KR";
    recognition.maxAlternatives = 10000;

    recognition.start();
    startRecord();

    muteBtn.onclick = function () {
      isMuted = isMuted ? false : true;
    };

    recognition.onresult = function (e) {
      //console.log("isMuted: ", isMuted);
      if (!isMuted) {
        let texts = Array.from(e.results)
          .map((results) => results[0].transcript)
          .join("");
        finalText = texts;
      }
    };

    recognition.onend = async function () {
      await addChatting();

      recognition.start();
      startRecord();
    };

    async function addChatting() {
      if (finalText != null) {
        stopRecord(true);

        count++;
        console.log(count.toString() + "번째 음성 : " + finalText);

        let text = count.toString() + "번째 음성 : " + finalText;
        let myBox = document.createElement("div");
        myBox.setAttribute("class", "myBox");

        let myText = document.createElement("div");

        myText.setAttribute("class", "myText");
        myText.textContent = text;

        myBox.append(myText);
        document.querySelector(".chatLog").append(myBox);

        finalText = null;
      } else {
        stopRecord(false);
      }
    }
  }
}

export { startSTT };
