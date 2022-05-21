const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
});
myPeer.on('open', (id) => {
  socket.emit('join-room', roomId, id);
});

navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    const myVideo = document.createElement('video');
    myVideo.id = 'my Video';
    addVideoStream(stream, myVideo);

    socket.on('user-connected', (userId) => {
      console.log('2d user came to room');
      connectToUserId(userId, stream);
    });
    myPeer.on('call', (call) => {
      console.log('call coming');
      call.answer(stream);
    });
  });

function connectToUserId(userId, stream) {
  const userVideo = document.createElement('video');
  const call = myPeer.call(userId, stream);
  console.log(call);
  call.on('stream', (stream) => {
    console.log('answer coming');
    userVideo.id = 'user video';
    addVideoStream(stream, userVideo);
  });
  call.on('close', () => {
    userVideo.remove();
  });
}
function addVideoStream(stream, video) {
  console.log('i add video stream');
  video.muted = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  video.srcObject = stream;
  videoGrid.append(video);
}
