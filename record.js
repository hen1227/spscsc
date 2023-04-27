// In Setup
let capturedFramesCount = 0;
let captureFrames = 2500; // Number of frames you want to capture
let capturer = new CCapture({ format: 'webm' , framerate: 30} );
let isCapturing = false;
let recordingEnabled = false;


// Top of Loop
if (recordingEnabled){
    if (frameCount == 1){
        isCapturing = true;
        capturer.start();
        capturedFramesCount = 0;
    }
}

// Bottom of Loop
if(recordingEnabled) {
    capturedFramesCount++;
    if (isCapturing) {
        capturer.capture(canvas.elt);
        if (capturedFramesCount === captureFrames || keyCode == 83) {
            capturer.stop();
            capturer.save();
            isCapturing = false;
            noLoop();
        }
    }
}



// Anywhere
function keyPressed() {
    if(recordingEnabled) {
        if (key === 'c' || key === 'C') {
            capturer.stop();
            capturer.save();
            isCapturing = false;
            noLoop();
        }
    }
}
