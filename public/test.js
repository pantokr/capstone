var bufferToBase64 = function (buffer) {
    var bytes = new Uint8Array(buffer);
    var len = buffer.byteLength;
    var binary = "";
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

var reader = new FileReader();
reader.onload() = function(){
    var base64String = bufferToBase64(arrayBuffer);
    console.log(base64String);
}