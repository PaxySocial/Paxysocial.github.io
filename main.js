const socket = io('https://marcopaxy.herokuapp.com/');

$('#div-chat').hide();

let customConfig;



// Node Get ICE STUN and TURN list
let o = {
    format: "urls"
};

let bodyString = JSON.stringify(o);
let options = {
    host: "global.xirsys.net",
    path: "/_turn/Paxysocial.github.io",
    method: "PUT",
    headers: {
        "Authorization": "Basic " + Buffer.from("paxy:19ff98ce-d676-11ea-8660-0242ac150002").toString("base64"),
        "Content-Type": "application/json",
        "Content-Length": bodyString.length
    }
};
let httpreq = https.request(options, function(httpres) {
    let str = "";
    httpres.on("data", function(data){ str += data; });
    httpres.on("error", function(e){ console.log("error: ",e); });
    httpres.on("end", function(){ 
        console.log("ICE List: ", str);
    });
});
httpreq.on("error", function(e){ console.log("request error: ",e); });
httpreq.end();

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));


function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

const peer = new Peer({ 
    key: 'peerjs',
    host: 'marcopeers.herokuapp.com', 
    secure: true,
    port: 443,
    config: customConfig
});

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
