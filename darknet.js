const spawn = require('child_process').spawn;

module.exports = class {
  constructor(videoLocation, onDetectionCb) {
    this.darknet        = void 0;
    this.videoLocation  = videoLocation;
    this.darknetReady   = false;
    this.onDetectionCb  = onDetectionCb;
    this.restartDelay   = 1000 * 10;
  }

  start() {
    const self = this;
    const cwd  = `${ process.cwd() }\\darknet`;
    console.log(`Darknet  directory: ${ cwd }`);
    this.darknet = spawn('darknet.exe', [
        'detector',
        'demo',
        'data/obj.data',
        'yolo-obj.cfg',
        'yolo-obj_800.weights',
        this.videoLocation,

        '-i', // USE GPU instead of CPU
        '0',  // USE GPU instead of CPU

        '-thresh',
        '0.3'
      ],
      {cwd}
    );
    this.darknet.stdout.on('data', function (data) {
      // console.log('stdout: ', data.toString());
      self.processData(data.toString());
    });

    this.darknet.stderr.on('data', function (data) {
      console.error('stderr: ', data);
    });

    this.darknet.on('exit', function (code) {
      console.log('child process exited with code ', code);
      self.autoRestart();
    });
  }

  processData(stdout) {
    if (this.darknetReady) {
      const lines = stdout.split('\r');
      for (let n of lines) {
        try {
          if (n.length > 8) { // fast way of detecting if we are on correct line
            const objArray = JSON.parse(n);
            this.onDetection(objArray);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      this.onDetection([]);
    } else {
      if (stdout.indexOf('STARTED') > -1) {
        this.darknetReady = true;
        console.log('Darknet ready.');
      }
    }
  }

  /**
   * Array of detections, valid until called again.
   * @param data {{left: number, right: number, top: number, bottom: number, obj_id: number, obj: string, prob: number}[]}
   */
  onDetection(data) {
    this.onDetectionCb(data);
  }

  stop() {
    if (this.darknet) {
      this.darknet.kill();
    }
  }

  autoRestart() {
    console.log(`Restarting darknet in ${ this.restartDelay }ms.`);
    const self = this;
    setTimeout(() => {
      self.start();
    }, this.restartDelay);
  }
};

