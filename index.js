const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const request = require('request');
const io      = require('socket.io')(http);
const Darknet = require('./darknet');
const _       = require('lodash');
const port    = 3000;

// CHANGE IP TO YOUR VIDEO STREAM URL
const streamUri   = 'http://192.168.1.4:8080/video';

//const streamUri   = 'http://193.2.178.44:8080/videofeed';
const bitstampApi = 'https://www.bitstamp.net/api/v2/ticker/btceur/';

// BITCOIN
let bitstamp = {
  "high"     : void 0,
  "last"     : void 0,
  "timestamp": void 0,
  "bid"      : void 0,
  "vwap"     : void 0,
  "volume"   : void 0,
  "low"      : void 0,
  "ask"      : void 0,
  "open"     : void 0
};
request.get({ url: bitstampApi, json: true }, function (e, r, data) {
  console.log('Bitstamp:', data);
  bitstamp = data;
});
// BITCOIN END

// EXPRESS SERVER
app.use(express.static('public'));
app.get('/video.json', (req, res) => { res.json({ streamUri, bitstamp }); });
http.listen(port, function () {
  console.log(`Server is up on port ${ port }`);
});
// EXPRESS SERVER END

// SOCKET.IO
io.on('connection', function (socket) {
  console.log('Web client connected');
  // socket.emit('detected', {"raw":{"left":139,"right":595,"top":161,"bottom":370,"obj_id":0,"obj":"pet","prob":45},"x":367,"y":265.5,"btc":12594.99});

  socket.on('disconnect', () => {
    console.log('Web client disconnected');
  });
});
// SOCKET.IO END

// DARKNET
const notes = {
  '5EUR': 5,
  '10EUR': 10,
  '20EUR': 20,
  '50EUR': 50
};

const darknet = new Darknet(
  streamUri,
  (data) => {
    const n = _.maxBy(data, 'prob');
    if (n) {
      console.log(n);
      io.sockets.emit('detected', { raw: n, x: (n.left + n.right) / 2, y: (n.top +  n.bottom) / 2, btc: (notes[n.obj])/(+bitstamp.ask) });
    } else {
      io.sockets.emit('not-detected');
    }
  }
);
darknet.start();

process.on('SIGTERM', function () {
  console.log('Stopping darknet.');
  darknet.kill();
});
// DARKNET END
