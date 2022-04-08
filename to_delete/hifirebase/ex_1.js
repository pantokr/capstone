const { request, response } = require('express');
const express = require('express')
const app = express();
var port = 3000
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


var firebase = require("firebase/app");

const firebaseConfig = {
    apiKey: "AIzaSyB1fr8U5LW5FnGgEQj8kmmt_yXQQX1ylD4",
    authDomain: "hifirebase-1fe0a.firebaseapp.com",
    projectId: "hifirebase-1fe0a",
    storageBucket: "hifirebase-1fe0a.appspot.com",
    messagingSenderId: "304893608155",
    appId: "1:304893608155:web:46aa5b5107b7c330ae0cfe",
    measurementId: "G-BWM0DLHCVB"
};

require("firebase/auth");
require("firebase/firestore");
firebase.initializeApp(firebaseConfig);


app.get('/', (request, response) => {
    var html = `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <form method="post" action="/process">
        <label for="pass" class="label">Email Address</label>
        <input name="new_email" type="text"><br>
        <label for="pass" class="label">Password</label>
        <input name="new_pw_1" type="password" class="input" data-type="password"><br>
        <label for="pass" class="label">Repeat Password</label>
        <input name="new_pw_2" type="password" class="input" data-type="password"><br>
        <input type="submit">
    </form>
</body>

</html>
    `
    response.send(html)
})

app.post('/process', (request, response) => {
    var post = request.body;
    var email = post['new_email']
    var new_pw_1 = post['new_pw_1']
    var new_pw_2 = post['new_pw_2']

    if (new_pw_1 != new_pw_2) {
        response.send('확인 비밀번호 다름')
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, new_pw_2)
            .then(() => {
                response.send('회원가입 완료')
            })
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                response.send(error.code)
            });
    }

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})