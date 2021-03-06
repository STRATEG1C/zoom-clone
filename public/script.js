const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;

let peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('open', id => {
        console.log(id);
        socket.emit('join-room', ROOM_ID, id);
    });

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        console.log(userId);
        connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown((e) => {
        if (e.which === 13 && text.val().length !== 0) {
            console.log(text);
            socket.emit('message', text.val());
            text.val('');
        }
    })

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    });
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};

const scrollToBottom = () => {
    const d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
};

// Mute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

// Stop our video
const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const openHideChat = () => {
    const chatArea = document.querySelector('.main__right');
    if (chatArea.classList.contains('hidden')) {
        chatArea.classList.remove('hidden');
    } else {
        chatArea.classList.add('hidden');
    }
}

if (window.innerWidth < 1000) {
    openHideChat();
}
