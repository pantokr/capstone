// 구글 인증 기능 추가
function popup(){
    alert('sdfsdf')
    const firebaseConfig = {
        apiKey: "AIzaSyAGjIonDdr_Y_697rDdZy2xj78ePRT_Lco",
        authDomain: "meecord-223cc.firebaseapp.com",
        databaseURL: "https://meecord-223cc-default-rtdb.firebaseio.com",
        projectId: "meecord-223cc",
        storageBucket: "meecord-223cc.appspot.com",
        messagingSenderId: "291741382850",
        appId: "1:291741382850:web:b7893d764decad8933e35b"
      };
    
    firebase.initializeApp(firebaseConfig);
    
    var provider = new firebase.auth.GoogleAuthProvider();
    
    // 인증하기
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        
        console.log(user)		// 인증 후 어떤 데이터를 받아오는지 확인해보기 위함.
    // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
}
