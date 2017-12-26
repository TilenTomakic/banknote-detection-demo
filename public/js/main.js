var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('#video');
var canvas = document.getElementById('canvas-info'),
    cw = canvas.width,
    ch = canvas.height,
    ctx = null,
    fps = 30,
    bX = 30,
    bY = 30,
    mX = 10,
    mY = 20,
    interval     =    1000/fps,
    lastTime     =    (new Date()).getTime(),
    currentTime  =    0,
    delta = 0;
if (typeof (canvas.getContext) !== undefined) {
  ctx = canvas.getContext('2d');

  gameLoop();
}
//=============================
var store = {
  streamUri: void 0,
  detected: { x: 0, y: 0, btc: 0 },
  cX: 0,
  cY: 0,
};

store.detected = false;

//=============================
//  CAMERA
//=============================

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};

function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
      constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += msg;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

// navigator.mediaDevices.getUserMedia(constraints).
// then(handleSuccess).catch(handleError);


//=============================
//  INIT INFO
//=============================
$.getJSON("/video.json", function(data) {
  store.streamUri = data.streamUri;
  console.log('Init info:', data);

 // var source = document.createElement('source');
 // source.setAttribute('src', store.streamUri);
 // video.appendChild(source);
 // video.play();

 video.setAttribute('src', store.streamUri);
});

//=============================
//  SOCKET
//=============================
var socket = io();

socket.on('detected', function(data){
 $("#loading").fadeOut(500);
 console.log('detected', data);
 if (!store.detected) {
   store.cX = data.x;
   store.cY = data.y;
 }
 store.detected = data;
});

socket.on('not-detected', function(){
  $("#loading").fadeIn(500);
  console.log('not-detected');
  store.detected = false;
});

//=============================
//  CANVAS
//=============================

function resizeCanvas() {
  canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  draw();
}

function gameLoop() {
  window.requestAnimationFrame(gameLoop);

  currentTime = (new Date()).getTime();
  delta = (currentTime - lastTime);

  if(delta > interval) {
    update(delta);
    draw(delta);

    lastTime = currentTime - (delta % interval);
  }
}

function update(delta) {
  if (store.detected) {
    var dx = store.cX > store.detected.x ? -1 : (store.cX < store.detected.x ? 1 : 0);
    var dy = store.cY > store.detected.y ? -1 : (store.cY < store.detected.y ? 1 : 0);
    dx *= delta * 0.3;
    dy *= delta * 0.3;
    store.cX += dx;
    store.cY += dy;
    if (dx > 0 && store.cX > store.detected.x) {
      store.cX = store.detected.x
    }
    if (dy > 0 && store.cY > store.detected.y) {
      store.cY = store.detected.y
    }
    if (dx < 0 && store.cX < store.detected.x) {
      store.cX = store.detected.x
    }
    if (dy < 0 && store.cY < store.detected.y) {
      store.cY = store.detected.y
    }
    console.log(store.cX, store.cY);
  }
}

function draw(delta) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!store.detected) {
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {

    var x = store.cX;
    var y = store.cY;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 80, y - 100);
    ctx.lineTo(x + 300, y - 100);
    ctx.stroke();

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(store.detected.btc + " BTC", x + 90, y - 110);
  }
}

resizeCanvas();
