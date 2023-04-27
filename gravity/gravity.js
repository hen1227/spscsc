let balls = [];
let n = 50; // Modifiable
let mass = 15;
let ballSize = 6; // Modifiable
let spread = 300;
let maxV = 0.1;
let trailLength = 35;
let centerForce = 0.1; // Modifiable
let damping = 0.01;
let initialVx = 1; // Random
let initialVy = -2; // Random

let isCircle = true // Modifiable

let crossInteractions = false;

let canvas;

let ballCountSlider, ballRadiusSlider, centerForceSlider, isCircleCheckBox;
let replayButton, resetButton;
let qrCodeImage, toggleArrow,copyMessage;
let isQrCodeHidden = false;

function setup() {
    // Center the canvas on the page
    if (window.innerWidth < 800) {
        let canvas = createCanvas(window.innerWidth, window.innerWidth);
        canvas.parent("canvas");
        length1 = length2 = width/2;
    }else {
        let canvas = createCanvas(800, 800);
        canvas.parent("canvas");
    }

    background(0);
    colorMode(HSB, 360, 100, 100);

    spawnBalls();
    setRandomValues();

    ballCountSlider = select("#ball-count-slider");
    ballCountSlider.input(updateBallCount);

    ballRadiusSlider = select("#ball-radius-slider");
    ballRadiusSlider.changed(updateBallRadius);

    centerForceSlider = select("#center-force-slider");
    centerForceSlider.changed(updateCenterForce);

    isCircleCheckBox = select("#is-circle-checkbox");
    isCircleCheckBox.changed(updateCircleCheckbox);

    replayButton = select("#replay-btn");
    replayButton.mousePressed(replayPressed);

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetPressed);


    qrCodeImage = select("#qr-code");
    qrCodeImage.mousePressed(toggleQrCode);
    toggleArrow = select("#qr-toggle-arrow");
    toggleArrow.mousePressed(toggleQrCode);
    copyMessage = select("#copy-message");
    toggleQrCode(false);

    applySettingsFromUrl();
}

function circlePath(N){
    let t = TWO_PI * N / n;

    let x = cos(t) * (spread)/2 + (width)/2;
    let y = sin(t) * (spread)/2 + (height)/2;
    return createVector(x, y);
}

function spiralPath(N){
    let t = TWO_PI * N / n;
    let dist = map(N, 0, n, spread/2, spread)

    let x = cos(t) * dist + (width)/2;
    let y = sin(t) * dist + (height)/2;
    return createVector(x, y);
}

function spawnBalls() {
    for (let i = 0; i < n; i++) {
        let newPos;
        if(isCircle) {
            newPos = circlePath(i);
        }else{
            newPos = spiralPath(i);
        }

        let hueValue = map(i, 0, n, 0, 360);
        let ballColor = color(hueValue, 100, 100);

        const ball = new GravitationalObject(newPos.x, newPos.y, ballColor);
        ball.vel.x = initialVx;
        ball.vel.y = initialVy;
        balls.push(ball);
    }
}

function resetSimulation() {
    balls.length = 0;
    spawnBalls();
    generateQRCode();
}

function setRandomValues() {
    initialVx = random(-0.3, 0.3);
    initialVy = random(-0.3, 0.3);
}

function resetPressed(){
    setRandomValues();
    resetSimulation();
}

function replayPressed(){
    resetSimulation();
}

function draw() {
    background(0, 1);
    // blendMode(SUBTRACT);

    for (let object of balls) {
        object.displayTrail();
    }
    for (let object of balls) {
        if (crossInteractions) object.applyForces(balls);
        object.update();
        object.display();
    }
}

class GravitationalObject {
    constructor(x, y, ballColor) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = mass;
        this.color = color(ballColor);

        this.pastPositions = [];
    }

    applyForces(objects) {
        for (let other of objects) {
            if (other !== this) {
                let force = this.calculateForce(other);
                this.applyForce(force);
            }
        }
    }

    calculateForce(other) {
        let G = 50/n; // Gravitational constant
        let distanceVector = p5.Vector.sub(other.pos, this.pos);
        let distance = distanceVector.mag();
        let forceMagnitude = min(G * this.mass * other.mass / (distance * distance), maxV);
        let force = distanceVector.copy().normalize().mult(forceMagnitude);
        return force;
    }

    applyForce(force) {
        let acceleration = p5.Vector.div(force, this.mass);
        this.acc.add(acceleration);
    }

    update() {
        // Apply damping force
        let dampingForce = this.vel.copy().mult(-1).mult(damping);
        this.applyForce(dampingForce);


        let centerDirection = p5.Vector.sub(createVector(width/2, height/2), this.pos).normalize().mult(centerForce);
        this.acc.add(centerDirection);

        // Update position and velocity
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Store past positions
        this.pastPositions.push(this.pos.copy());
        if (this.pastPositions.length > trailLength) {
            this.pastPositions.shift();
        }
    }

    display() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, ballSize);
    }
    displayTrail(){
        for (let i = 0; i < this.pastPositions.length; i++){
            const pastPos = this.pastPositions[i];

            let alpha = map(i, 0, trailLength, 0.01, 0.8); // Set the alpha value
            // let brightness = map(i, 0, trailLength, 0, 255); // Set the alpha value
            let brightness = 255;
            let trailSize = map(i, 0, trailLength, ballSize/2, ballSize);
            let colorWithAlpha = color(this.color._getHue(), this.color._getSaturation(), brightness, alpha); // Create a new color with the alpha value
            fill(colorWithAlpha);
            ellipse(pastPos.x, pastPos.y, trailSize);
        }
    }
}

function updateCircleCheckbox(){
    isCircle = !isCircle;
}

function updateBallCount(){
    n = ballCountSlider.value();
}

function updateBallRadius(){
    ballSize = ballRadiusSlider.value();
}

function updateCenterForce(){
    centerForce = centerForceSlider.value()/100;
}


function applySettingsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("count")) {
        n = parseInt(urlParams.get("count"));
        ballCountSlider.value(n);
    }

    if (urlParams.has("ballRadius")) {
        ballSize = parseFloat(urlParams.get("ballRadius")) * width;
        ballRadiusSlider.value(ballSize);
    }

    if (urlParams.has("circle")) {
        isCircle = urlParams.get("circle") === "true";
        isCircleCheckBox.checked(isCircle);
    }

    if (urlParams.has("vx")) {
        initialVx = parseFloat(urlParams.get("vx"));
    }

    if (urlParams.has("vy")) {
        initialVy = parseFloat(urlParams.get("vy"));
    }

    resetSimulation();
}

function generateSettingsUrl() {
    const baseUrl = window.location.href.split("?")[0];
    const urlParams = new URLSearchParams();
    urlParams.set("vx", String(initialVx));
    urlParams.set("vy", String(initialVx));
    urlParams.set("count", n);
    urlParams.set("ballRadius", String(ballSize / width));
    urlParams.set("circle", isCircle);
    return `${baseUrl}?${urlParams.toString()}`;
}

function generateQRCode() {
    const settingsUrl = generateSettingsUrl();

    const qrCodeOptions = {
        scale: 3,
        color: {
            dark: "#70e070", // Square color (default: black)
            light: "#312331", // Background color (default: white)
        },
    };
    QRCode.toDataURL(settingsUrl, qrCodeOptions, (err, url) => {
        if (err) throw err;
        qrCodeImage.attribute("src", url); // Set the QR code image's src attribute
    });
}

function toggleQrCode(copyLink = true) {
    isQrCodeHidden = !isQrCodeHidden;
    const settingsUrl = generateSettingsUrl();
    if(copyLink) {
        navigator.clipboard.writeText(settingsUrl).then(() => {
            copyMessage.style("display", "block");

            setTimeout(() => {
                copyMessage.style("display", "none");
            }, 1000);
        }).catch((err) => {
            console.error("Could not copy text: ", err);
        });
    }

    if (isQrCodeHidden) {
        qrCodeImage.style("left", "-200px");
        toggleArrow.style("left", "10px");
    } else {
        qrCodeImage.style("left", "10px");
        toggleArrow.style("left", "-200px");
    }
}