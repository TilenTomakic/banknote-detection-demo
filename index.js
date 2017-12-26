const express = require('express');
const app     = express();
const http    = require('http').Server(app);
const request = require('request');
const io      = require('socket.io')(http);
const Darknet = require('./darknet');
const _       = require('lodash');
const port    = 3000;

const streamUri   = 'http://192.168.1.13:8080/video';
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
  //socket.emit('detected', { x: 30, y: 300, btc: +bitstamp.ask });

  socket.on('disconnect', () => {
    console.log('Web client disconnected');
  });
});
// SOCKET.IO END

// DARKNET
const darknet = new Darknet(
  streamUri,
  (data) => {
    const n = _.maxBy(data, 'prob');
    if (n) {
      console.log(n);
      io.sockets.emit('detected', { x: (n.left + n.right) / 2, y: (n.top +  n.bottom) / 2, btc: +bitstamp.ask });
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
