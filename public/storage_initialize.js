import './index.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const storage = getStorage();

const storageRef = ref(storage);

const metadata = {
    contentType: 'audio/wav',
};


//wavRef가 firebase storage에 저장될 파일 이름
const wavRef = ref(storage, 'audio/newly_uploaded.wav');

const wavRefPath = wavRef.fullPath;
const wavRefName = wavRef.name;


//wavFile이 오프라인 스토리지에 저장되어 있는 파일 이름
const wavFile = './heykakao.wav';

uploadBytes(wavRef, wavFile).then((snapshot) => {
    console.log('Uploaded a blob or file!');
});
const uploadTask = uploadBytes(wavRef, wavFile, metadata);

getDownloadURL(wavRef)
    .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
            const blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        const img = document.getElementById('myimg');
        img.setAttribute('src', url);
    })
    .catch((error) => {
        // Handle any errors
    });
