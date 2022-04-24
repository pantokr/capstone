const root = document.getElementById('root');
const meeting_status = document.getElementById('meeting-status');
const meeting_title = document.getElementById('meeting-title');
const start_meeting = document.getElementById('start_meeting');
const end_meeting = document.getElementById('end_meeting');
let connected = false;
let room;
let socket;

function addLocalVideo() {
    Twilio.Video.createLocalVideoTrack().then(track => {
        let video = document.getElementById('local').firstChild;
        let trackElement = track.attach();
        video.appendChild(trackElement);
    });
};

function connectMeetingStatusHandler() {
    if (!connected) {
        let username = usernameInput;
        let roomname = roomnameInput;
        if (!username) {
            alert('Enter your name before connecting');
            return;
        }
        connect(username, roomname).then(() => {
            start_meeting.disabled = false;
            end_meeting.disabled = false;
        }).catch(() => {
            alert('Connection failed. Is the backend running?');
        });
    }
    else {
        disconnect();
        connected = false;
    }
};

function connect(username, roomname) {
    let promise = new Promise((resolve, reject) => {
        // get a token from the back end
        let data;
        fetch('/enter', {
            method: 'POST',
            body: JSON.stringify({'username': username,'roomname': roomname})
        }).then(res => res.json()).then(_data => {
            // join video call
            data = _data;
            return Twilio.Video.connect(data.token);
        }).then(_room => {
            room = _room;
            room.participants.forEach(participantConnected);
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            updateParticipantCount();
            resolve();
        }).catch(e => {
            console.log(e);
            reject();
        });
    });
    return promise;
};

function updateParticipantCount() {
    if (!connected)
        meeting_status.innerHTML = '대기 중';
    else
        meeting_status.innerHTML = (room.participants.size + 1) + '명 대기 중';
};

function participantConnected(participant) {
    let participantCount = room.participants.size;
    let className = 'participant-' + participantCount;
    let participantClass = document.getElementsByClassName(className);
    let participantDiv = participantClass[0];

    participantDiv.setAttribute('id', participant.sid);

    let tracksDiv = document.createElement('div');
    participantDiv.appendChild(tracksDiv);

    let labelDiv = document.createElement('div');
    labelDiv.setAttribute('class', 'label');
    labelDiv.innerHTML = participant.identity;
    participantDiv.appendChild(labelDiv);
    
    participant.tracks.forEach(publication => {
        if (publication.isSubscribed)
            trackSubscribed(tracksDiv, publication.track);
    });
    participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
    participant.on('trackUnsubscribed', trackUnsubscribed);

    updateParticipantCount();
};

function participantDisconnected(participant) {
    let participantDiv = document.getElementById(participant.sid);

    while(participantDiv.firstChild) {
        participantDiv.removeChild(participantDiv.firstChild);
    }

    participantDiv.setAttribute('id', ' ');
    updateParticipantCount();
};


function trackSubscribed(div, track) {
    let trackElement = track.attach();
    div.appendChild(trackElement);
};

function trackUnsubscribed(track) {
    track.detach().forEach(element => {
        element.remove()
    });
};

function disconnect() {
    room.disconnect();

    let participantDiv = document.getElementById(participant.sid);
    while(participantDiv.firstChild) {
        participantDiv.removeChild(participantDiv.firstChild);
    }

    connected = false;
    updateParticipantCount();
};

// real-time stt

socket = io.connect('http://' + document.domain + ':' + location.port + '/meetingroom');
socket.on('ready', function(){
    SpeechtoText()
});
socket.on('end',function(){
    socket.disconnect()
    location.href='/minute';
});

socket.on('receive_message',function(msg){
    let minute = document.getElementById('minute-content');
    let new_script = document.createElement('article');
    let received_name = decodeURIComponent(msg.name);
    let received_chat = decodeURIComponent(msg.data);

    if(received_name == usernameInput) {
        new_script.setAttribute('class', 'local');

        let new_script_chat = document.createElement('div');
        new_script_chat.setAttribute('class', 'local-chat');
        new_script_chat.innerHTML = received_chat;
        new_script.appendChild(new_script_chat);
        new_script.focus();
    }
    else {
        new_script.setAttribute('class', 'participant');

        let new_script_name = document.createElement('div');
        new_script_name.setAttribute('class', 'participant-name');
        new_script_name.innerHTML = received_name;

        let new_script_chat = document.createElement('div');
        new_script_chat.setAttribute('class', 'participant-chat');
        new_script_chat.innerHTML = received_chat;

        new_script.appendChild(new_script_name);
        new_script.appendChild(new_script_chat);
    }

    minute.appendChild(new_script);

})

function startMeeting(event) {
    start_meeting.disabled = true
    end_meeting.disabled = false
    meeting_status.innerHTML = (room.participants.size + 1) + '명 참여 중';
    socket.emit('before_meeting')
};

function endMeeting(event) {
    end_meeting.disabled = true
    socket.emit('after_meeting')    
};

function SpeechtoText() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
        let today = new Date(); 
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = "ko-KR";
        recognition.start();
        recognition.onresult = function(e) {
            for(let i = e.resultIndex, len = e.results.length; i < len; i++){
                if(e.results[i].isFinal){
                    $('#wav_index').val(i);
                    get_emotion();
                    transcript = e.results[i][0].transcript;
                }
            }
            socket.emit('send_message', {
                date:encodeURIComponent(today.toUTCString()),
                name:encodeURIComponent(usernameInput),
                data:encodeURIComponent(transcript)
            })
            
        };
        recognition.onerror = function(e) {
            recognition.stop();
        }
    }
  }
  
meeting_title.innerHTML = roomnameInput;
connectMeetingStatusHandler();
addLocalVideo();
start_meeting.addEventListener('click', startMeeting);
end_meeting.addEventListener('click', endMeeting);

var test_i = 0;
$('#ser').click(function(){
    $('#wav_index').val(test_i);
    test_i ++ ;
    console.log(test_i);
    get_emotion();
});

function get_emotion(){
    var index = $('#wav_index').val();
    $.ajax({
        type : 'POST',                                  
        url : '/predict',
        data:  {'index': index },
        success : function(result){
            set_emotion(result)
        },
        error:function(request,status,error){
            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    })
}



var current_wav = 1 ;
var current_emo = [0,0,0,0];
var cur_arrow_pos = 1;
function set_emotion(result){
    if(result == 'happy') current_emo[0] ++;
    else if(result == 'neutral') current_emo[1] ++;
    else if(result == 'sad') current_emo[2] ++;
    else if(result == 'angry') current_emo[3] ++;

    if(current_wav % 5 == 0) {
        var pre_arrow_pos = cur_arrow_pos;
        var mode = 0;
        for(var i =0 ; i <4; i++){
            if(mode < current_emo[i]){
                mode = current_emo[i];
                cur_arrow_pos = i;
            }
        }

        var r_result = '';

        if(pre_arrow_pos == 0) r_result = 'happy'
        else if(pre_arrow_pos == 1) r_result = 'neutral'
        else if(pre_arrow_pos == 2) r_result = 'sad'
        else if(pre_arrow_pos == 3) r_result = 'angry'

        var arrow_img = $('#graph-arrow li.current_arrow').html();
        
        $('#graph-arrow li.current_arrow').empty();
        $('#graph-arrow li.current_arrow').removeClass('current_arrow');
        $('#emotion-image li.current_icon').children('img').attr("src", "/static//images/meeting/icon-"+r_result+"-mono.png");
        $('#emotion_image li.current_icon').removeClass('current_icon')

        if(cur_arrow_pos == 0) r_result = 'happy'
        else if(cur_arrow_pos == 1) r_result = 'neutral'
        else if(cur_arrow_pos == 2) r_result = 'sad'
        else if(cur_arrow_pos == 3) r_result = 'angry'

        $('#graph-arrow li#'+r_result+'-arrow').addClass('current_arrow');
        $('#graph-arrow li.current_arrow').html(arrow_img);
        $('#emotion-image li#'+r_result+'-icon').children('img').attr("src", "/static//images/meeting/icon-"+r_result+".png");
        $('#emotion-image li#'+r_result+'-icon').addClass('current_icon');
        console.log(current_wav);
        current_emo = [0,0,0,0];    
    }
    if(current_wav == 7){
        $('#minute-content').append('<article class="canny-notice"><div class="canny-chat neutral">똑똑~"이정음"님 회의에 집중하시고 계시죠? :)</div></article>');
    }
    if(current_wav == 29){
        $('#minute-content').append('<article class="canny-notice"><div class="canny-chat sad">"이정음"님! 힘을 내세요, 캐니는 항상 당신 편이에요 :)</div></article>');
    }
    current_wav ++ ;
}