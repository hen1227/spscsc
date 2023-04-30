const balls = [];
const updatesPerFrame = 200;

let circleRadius = 300;

let ballRadius = 20;
let numBalls = 25;
let offsetPercent = 100;
let speed = 2;
let playSound = true;


let ballRadiusSlider, numBallSlider, offsetPercentSlider, speedSlider;

let startVelX = 2.6;
let startVelY = 4.8;
let startX = 0;
let startY = 0;
let startAngle = 100;

let isQrCodeHidden = false;

// Set ADSR values: Attack, Decay, Sustain, Release
let soundAttack = 0.01;
let soundDecay = 0.01;
let soundSustain = 0.1;
let soundRelease = 0.1;

let lowestPitch = 100;
let highestPitch = 800;

// Options: 'sine','triangle', 'sawtooth', 'square'
let soundStyle = "sine";
let masterAmplitude = 0.1;


function setup() {
    colorMode(HSB, 360, 100, 100);

    if (window.innerWidth < 800) {
        let canvas = createCanvas(window.innerWidth, window.innerWidth);
        circleRadius = width;
        canvas.parent("canvas");
    }else {
        let canvas = createCanvas(800, 800);
        canvas.parent("canvas");
    }

    setRandomValues();

    numBallSlider = select("#ball-count-slider");
    numBallSlider.input(updateCount);

    ballRadiusSlider = select("#ball-radius-slider");
    ballRadiusSlider.input(updateRadius);

    offsetPercentSlider = select("#ball-offset-slider");
    offsetPercentSlider.input(updateOffset);

    speedSlider = select("#ball-speed-slider");
    speedSlider.input(updateSpeed);

    replayButton = select("#replay-btn");
    replayButton.mousePressed(replayPressed);

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetPressed);



    qrCodeImage = select("#qr-code");
    qrCodeImage.mousePressed(toggleQrCode);
    toggleArrow = select("#qr-toggle-arrow");
    toggleArrow.mousePressed(toggleQrCode);
    copyMessage = select("#copy-message");

    applySettingsFromUrl();

    spawnBalls();
}

function draw() {
    background(0);

    push();
    translate(width / 2, height / 2);
    noFill();
    stroke(255);
    strokeWeight(4);
    ellipse(0, 0, circleRadius * 2);

    for (let i = 0; i < updatesPerFrame; i++) {
        for (const ball of balls) {
            ball.update(1/updatesPerFrame);
            ball.checkCircleCollision(circleRadius);
        }
    }

    for (const ball of balls) {
        ball.display();
    }
    pop();
}

function spawnBalls(){
    for (let i = 0; i < numBalls; i++) {

        let hueValue = map(i, 0, numBalls, 0, 360);
        let pitchValue = map(i, 0, numBalls, lowestPitch, highestPitch);
        let ballColor = color(hueValue, 100, 100);

        let ball = new Ball(startX+(i*7 /numBalls), startY+(i*circleRadius/100*offsetPercent /numBalls), ballColor, pitchValue, startVelX* cos(startAngle), startVelY* sin(startAngle));

        balls.push(ball);
    }
}

function setRandomValues(){
    startX =  random(-circleRadius/8, circleRadius/8);
    startY =  random(-circleRadius/8, circleRadius/8);
    startAngle = random(0, 3.1415926);
}

function updateCount(){
    numBalls = numBallSlider.value();
}
function updateRadius(){
    ballRadius = ballRadiusSlider.value();
}
function updateOffset(){
    offsetPercent = offsetPercentSlider.value();
}
function updateSpeed(){
    speed = speedSlider.value();
}

function resetPressed(){
    setRandomValues();
    resetSimulation();
}

function replayPressed(){
    resetSimulation();
}

function resetSimulation() {

    for (let i = 0; i < balls.length; i++) {
        balls[i].dispose();
    }
    balls.length = 0;
    spawnBalls();
    generateQRCode();
}


function applySettingsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("count")) {
        numBalls= parseInt(urlParams.get("count"));
        numBallSlider.value(numBalls);
    }
    if (urlParams.has("radius")) {
        ballRadius= parseInt(urlParams.get("radius"));
        ballRadiusSlider.value(ballRadius);
    }
    if (urlParams.has("offset")) {
        offsetPercent= parseInt(urlParams.get("offset"));
        offsetPercentSlider.value(offsetPercent);
    }
    if (urlParams.has("speed")) {
        speed= parseInt(urlParams.get("speed"));
        speedSlider.value(speed);
    }
    if (urlParams.has("a")) {
        startAngle= parseFloat(urlParams.get("a"));
    }
    if (urlParams.has("x")) {
        startX = parseFloat(urlParams.get("x"));
    }
    if (urlParams.has("y")) {
        startY = parseFloat(urlParams.get("y"));
    }

    resetSimulation();
}

function generateSettingsUrl() {
    const baseUrl = window.location.href.split("?")[0];
    const urlParams = new URLSearchParams();
    urlParams.set("count", numBalls);
    urlParams.set("radius", ballRadius);
    urlParams.set("offset", offsetPercent);
    urlParams.set("speed", speed);
    urlParams.set("a", startAngle);
    urlParams.set("x", startX);
    urlParams.set("y", startY);
    return `${baseUrl}?${urlParams.toString()}`;
}

function generateQRCode() {
    const settingsUrl = generateSettingsUrl();
    const qrCodeOptions = {
        scale: 3,
        color: {
            dark: "#70e070", // Square color (default: black)
            light: "#211d21", // Background color (default: white)
        },
    };
    QRCode.toDataURL(settingsUrl, qrCodeOptions, (err, url) => {
        if (err) throw err;
        qrCodeImage.attribute("src", url); // Set the QR code image's src attribute
    });
}

function toggleQrCode() {
    isQrCodeHidden = !isQrCodeHidden;

    const settingsUrl = generateSettingsUrl();

    navigator.clipboard.writeText(settingsUrl).then(() => {
        copyMessage.style("display", "block");

        setTimeout(() => {
            copyMessage.style("display", "none");
        }, 1000);
    }).catch((err) => {
        console.error("Could not copy text: ", err);
    });

    if (isQrCodeHidden) {
        qrCodeImage.style("left", "-200px");
        toggleArrow.style("left", "10px");
    } else {
        qrCodeImage.style("left", "10px");
        toggleArrow.style("left", "-200px");
    }
}

class Ball {
    constructor(x, y, color, pitch, vx, vy, radius = 10) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;


        this.pitch = pitch;
        this.oscillator = new p5.Oscillator(soundStyle);
        this.oscillator.freq(this.pitch);
        this.oscillator.amp(0);
        this.oscillator.start();

        this.envelope = new p5.Env();
        this.envelope.setADSR(soundAttack, soundDecay, soundSustain, soundRelease); // Set ADSR values: Attack, Decay, Sustain, Release
        this.envelope.setRange(masterAmplitude, 0.0); // Set amplitude range: initial amplitude, final amplitude

    }

    update(dt) {
        this.x += this.vx * dt * speed;
        this.y += this.vy * dt * speed;
    }

    checkCircleCollision(circleRadius) {
        const distanceToCenter = dist(0, 0, this.x, this.y);
        if (distanceToCenter + ballRadius > circleRadius) {
            const angle = atan2(this.y, this.x);
            const normalX = cos(angle);
            const normalY = sin(angle);

            // Dot product between velocity and normal
            const dot = this.vx * normalX + this.vy * normalY;

            // Reflect velocity
            this.vx -= 2 * dot * normalX;
            this.vy -= 2 * dot * normalY;

            // Move ball to the correct position to avoid getting stuck
            const overlap = (ballRadius + distanceToCenter) - circleRadius;
            this.x -= overlap * normalX;
            this.y -= overlap * normalY;

            this.playBeep(); // Adjust the beep duration as needed
        }
    }

    playBeep() {
        // this.oscillator.amp(1, 0.01); // Set the amplitude to 0.5 with a 0.01s fade-in time
        // setTimeout(() => {
        //     this.oscillator.amp(0, 0.01); // Set the amplitude back to 0 with a 0.01s fade-out time
        // }, duration * 1000);

        if(playSound){
            this.envelope.play(this.oscillator);
        }
    }

    dispose() {
        this.oscillator.stop();
        this.oscillator.dispose();
        this.envelope.dispose();
    }

    isInsideCircle(circleRadius) {
        return dist(0, 0, this.x, this.y) <= circleRadius - ballRadius;
    }

    display() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, ballRadius * 2);
    }
}