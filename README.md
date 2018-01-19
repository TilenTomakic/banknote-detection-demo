# Real time banknote detection and conversion into BTC demo

## Install
You must have [NodeJS](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/en/) installed.

In root directory of project run:
```
yarn install
```

Download 'yolo-obj_800.weights' weight from [https://www.dropbox.com/s/nxdu4et4tkgie3l/yolo-obj_800.weights?dl=0](https://www.dropbox.com/s/nxdu4et4tkgie3l/yolo-obj_800.weights?dl=0) to `darknet/` folder. Result should look like `darknet/yolo-obj_800.weights`. I couldn't include  it in repository since file is to big.

### Darknet setup
`darknet.exe` is already pre-compiled (W10 x64) and included in project. So you can skip this step if you have W10 x64.

If you have different operating system or you are experiencing darknet errors, you must compile it on your own for your system.
You can do this by cloning forked darknet [https://github.com/TilenTomakic/darknet](https://github.com/TilenTomakic/darknet) (I had to modify original darknet source code so application can communicate with it). Then check README of cloned darknet for instructions how to build ((https://github.com/TilenTomakic/darknet#how-to-compile-on-windows)[https://github.com/TilenTomakic/darknet#how-to-compile-on-windows]).

After you compiled darknet copy following files (from  `darknet/build/darknet/x64`) into this project (`/darknet`):
```
darknet/build/darknet/x64/darknet.exe   -->  darknet/darknet.exe
darknet/build/darknet/x64/darknet.iobj    -->  darknet/darknet.iobj
darknet/build/darknet/x64/darknet.ipdb    -->  darknet/darknet.ipdb
darknet/build/darknet/x64/darknet.pdb   -->  darknet/darknet.pdb
darknet/build/darknet/x64/opencv_ffmpeg331_64.dll   -->  darknet/opencv_ffmpeg331_64.dll
darknet/build/darknet/x64/opencv_world331.dll   -->  darknet/opencv_world331.dll
darknet/build/darknet/x64/pthreadGC2.dll    -->  darknet/pthreadGC2.dll
darknet/build/darknet/x64/pthreadVC2.dll    -->  darknet/pthreadVC2.dll
``` 

## Running project
In root directory of project run:
```
node index.js
```

Your app will be available on port 3000. Open browser `http://localhost:3000`.

### Troubleshooting
If you have problems with object detection (don't have NVIDEA card or CUDA 9.0 installed) you can turn off GPU detection by opening
`darknet.js` and commenting out this to lines:
```
  '-i', // USE GPU instead of CPU
  '0',  // USE GPU instead of CPU
```
Alternatively you can compile darknet on your own. Check **Darknet setup**.
