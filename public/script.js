const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
});

const peers = {};
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    const myVideo = document.createElement('video');
    addVideoStream(stream, myVideo);

    socket.on('user-connected', (userId) => {
      console.log('2d user came to room');
      connectToUserId(userId, stream);
    });
    myPeer.on('call', (call) => {
      console.log('call coming');
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (stream) => {
        addVideoStream(stream, video);
      });
      peers[call.peer] = call;
      call.on('close', () => {
        console.log('close');
        video.remove();
      });
    });
  });

myPeer.on('open', (id) => {
  socket.emit('join-room', roomId, id);
});

socket.on('user-disconnect', (id) => {
  console.log('id=' + id);
  if (peers[id]) {
    console.log('userDisConnected');
    peers[id].close();
  }
});
function connectToUserId(userId, stream) {
  const userVideo = document.createElement('video');
  const call = myPeer.call(userId, stream);
  call.on('stream', (stream) => {
    console.log('answer coming');
    userVideo.id = 'user video';
    addVideoStream(stream, userVideo);
  });
  call.on('close', () => {
    console.log('in close');
    userVideo.remove();
  });
  peers[userId] = call;
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
