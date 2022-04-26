import {app} from './index.js';
import { getStorage, ref, uploadBytes, getDownloadURL, getBlob, getBytes } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const storage = getStorage(app, 'meecord-223cc.appspot.com');

const storageRef = ref(storage);

const metadata = {
    contentType: 'audio/wav',
};


//wavRef가 firebase storage에 저장될 파일 이름
const wavRef = ref(storage, 'audio/newly_uploaded.wav');

const wavRefPath = wavRef.fullPath;
const wavRefName = wavRef.name;


//wavFile이 오프라인 스토리지에 저장되어 있는 파일 이름
const wavFilePath = './heykakao.wav';

// uploadBytes(wavRef, wavFilePath).then((snapshot) => {
//     console.log('Uploaded a blob or file!');
// });
const uploadTask = uploadBytes(wavRef, wavFile, metadata);

getDownloadURL(wavRef)
    .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        //This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
            const blob = xhr.response;
            console.log(blob);

            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function (e) {
                console.log('DataURL:', e.target.result);
                var url = e.target.result;
                var link = document.createElement("a");
                link.download = 'res.wav';
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        };
        xhr.open('GET', url);
        xhr.send();

    })
    .catch((error) => {
        // Handle any errors
    });
