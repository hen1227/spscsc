let balls = [];
let n = 25;
let mass = 15;
let ballSize = 6;
let spread = 170;
let maxV = 0.05;
let trailLength = 35;
let centerForce = 0.1;
let damping = 0.01;
let initialVx = 1;
let initialVy = -2;
let initialVz = 0.5;


let crossInteractions = true;

let autoRotateSpeed = 0.02;
let camXRot = 0;
let camYRot = 0;
let camZRot = 0;
let dragSensitivity = 0.01;

let canvas;
let capturedFramesCount = 0;
let captureFrames = 2500; // Number of frames you want to capture
let capturer = new CCapture({ format: 'webm', framerate: 30 });
let isCapturing = false;

let recordingEnabled = false;

function setup() {
    canvas = createCanvas(800, 800, WEBGL);
    frameRate(30);
    background(0);
    colorMode(HSB, 360, 100, 100);

    spawnBalls();
}

function circlePath(N) {
    let t = TWO_PI * N / n;

    let x = cos(t) * (spread) / 2;
    let y = sin(t) * (spread) / 2;
    let z = map(t,0, n, -spread/2, spread/2);
    return createVector(x, y, z);
}

function spiralPath(N) {
    let t = TWO_PI * N / n;
    let dist = map(N, 0, n, spread / 2, spread);

    let x = cos(t) * dist;
    let y = sin(t) * dist;
    let z = map(t,0, n, -spread/2, spread/2);
    return createVector(x, y, z);
}

function spawnBalls() {
    for (let i = 0; i < n; i++) {
        let newPos = circlePath(i);
        // let newPos = spiralPath(i);

        let hueValue = map(i, 0, n, 0, 360);
        let ballColor = color(hueValue, 100, 100);

        const ball = new GravitationalObject(newPos.x, newPos.y, newPos.z, ballColor);
        ball.vel.x = initialVx;
        ball.vel.y = initialVy;
        ball.vel.z = initialVz;
        balls.push(ball);
    }
}

function draw() {
    if (recordingEnabled) {
        if (frameCount == 1) {
            isCapturing = true;
            capturer.start();
            capturedFramesCount = 0;
        }
    }

    background(0, 1);

    // Add auto-rotation
    camYRot += autoRotateSpeed;

    // Apply camera transformations
    // translate(width / 2, height / 2);
    rotateX(camXRot);
    rotateY(camYRot);
    rotateZ(camZRot);


    for (let object of balls) {
        object.displayTrail();
    }
    for (let object of balls) {
        if (crossInteractions) object.applyForces(balls);
        object.update();
        object.display();
    }

    if (recordingEnabled) {
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
}

function keyPressed() {
    if (recordingEnabled) {
        if (key === 'c' || key === 'C') {
            capturer.stop();
            capturer.save();
            isCapturing = false;
            noLoop();
        }
    }
}

function mouseDragged() {
    let dx = (mouseX - pmouseX) * dragSensitivity;
    let dy = (mouseY - pmouseY) * dragSensitivity;

    camYRot += dx;
    camXRot += dy;
}

class GravitationalObject {
    constructor(x, y, z, ballColor) {
        this.pos = createVector(x, y, z);
        this.vel = createVector(0, 0, 0);
        this.acc = createVector(0, 0, 0);
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
        let G = 50 / n; // Gravitational constant
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

        let centerDirection = p5.Vector.sub(createVector(0, 0, 0), this.pos).normalize().mult(centerForce);
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
        push();
        translate(this.pos.x, this.pos.y, this.pos.z);
        sphere(ballSize / 2);
        pop();
    }

    displayTrail() {
        for (let i = 0; i < this.pastPositions.length; i++) {
            const pastPos = this.pastPositions[i];

            let alpha = map(i, 0, trailLength, 0.01, 0.8); // Set the alpha value
            let brightness = 255;
            let trailSize = map(i, 0, trailLength, ballSize / 2, ballSize);
            let colorWithAlpha = color(this.color._getHue(), this.color._getSaturation(), brightness, alpha); // Create a new color with the alpha value
            fill(colorWithAlpha);
            push();
            translate(pastPos.x, pastPos.y, pastPos.z);
            sphere(trailSize / 2);
            pop();
        }
    }
}