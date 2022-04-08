// Module Import
var express = require('express');
var app = express();

// Definition of Constant Variable
// var client_id = 'YOUR_CLIENT_ID';
// var client_secret = 'YOUR_CLIENT_SECRET';
var client_id = 'HxYVV1Ws_Oyx6YF4wQVp';
var client_secret = '8e7tr_UOiI';

// Express URL Call & Work Response Data
var fs = require('fs');
app.get('/face', function (req, res) {
   var request = require('request');
  //  var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; // 유명인 인식
   var api_url = 'https://openapi.naver.com/v1/vision/face'; // 얼굴 감지

   var _formData = {
     image:'image',
     image: fs.createReadStream(__dirname + '\\images\fear.jpg') // FILE 이름
   };
   var _req = request.post({url:api_url, formData:_formData,
    headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}}).on('response', function(response) {
     console.log(response.statusCode) // 200
     console.log(response.headers['content-type'])
  });
    console.log( request.head  );
    _req.pipe(res); // 브라우저로 출력
 });

 app.listen(3000, function () {
   console.log('http://127.0.0.1:3000/face app listening on port 3000!');
 });