class Ball {
    constructor(x, y, r, c) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        // this.radius = r;
        this.color = c;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    display() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, ballWidth * 2);
    }
}

function closestPointOnEllipse(ball, ellipseCenter, ellipseWidth, ellipseHeight) {
    const angle = atan2(ball.pos.y - ellipseCenter.y, ball.pos.x - ellipseCenter.x);
    const x = ellipseCenter.x + ellipseWidth / 2 * cos(angle);
    const y = ellipseCenter.y + ellipseHeight / 2 * sin(angle);
    return createVector(x, y);
}

function resolveCollision(ball, ellipseCenter, ellipseWidth, ellipseHeight) {
    const closest = closestPointOnEllipse(ball, ellipseCenter, ellipseWidth, ellipseHeight);
    const distance = p5.Vector.dist(ball.pos, closest);

    if (distance <= ballWidth) {
        const normal = p5.Vector.sub(closest, ball.pos).normalize();
        const tangent = createVector(-normal.y, normal.x);

        const relativeVelocity = p5.Vector.sub(ball.vel, createVector(0, 0)); // Assuming the ellipse is static
        const normalVelocity = normal.copy().mult(relativeVelocity.dot(normal));
        const tangentVelocity = tangent.copy().mult(relativeVelocity.dot(tangent));

        ball.vel = p5.Vector.add(tangentVelocity, normalVelocity.mult(-1));
        const penetration = ballWidth - distance;
        ball.pos.add(normal.copy().mult(-penetration));
    }
}

let n = 100;
const simulationSteps = 150;

let ballWidth = 15;
let drawLine = false;
let startPos = -1;
// const lineWidth = 15;

const balls = [];
let ellipseCenter
let ellipseWidth = 0
let ellipseHeight = 0

let ballCountSlider;
let resetButton;
let ballRadiusSlider;
let showLineCheckbox;

let qrCodeImage;
let toggleArrow;
let isQrCodeHidden = false;

let copyMessage;

function setup() {
    // createCanvas(800, 600);
    // frameRate(600);
    colorMode(HSB, 360, 100, 100);

    // Center the canvas on the page
    if (window.innerWidth < 800) {
        let canvas = createCanvas(window.innerWidth, window.innerWidth/8*6);
        canvas.parent("canvas");
    }else {
        let canvas = createCanvas(800, 600);
        canvas.parent("canvas");
    }

    ballCountSlider = select("#ball-count-slider");
    ballCountSlider.input(updateBallCount);

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetSimulation);

    ballRadiusSlider = select("#ball-radius-slider");
    ballRadiusSlider.input(updateBallRadius);

    showLineCheckbox = select("#show-line-checkbox");
    showLineCheckbox.changed(toggleShowLine);

    qrCodeImage = select("#qr-code");
    qrCodeImage.mousePressed(toggleQrCode);
    toggleArrow = select("#qr-toggle-arrow");
    toggleArrow.mousePressed(toggleQrCode);
    copyMessage = select("#copy-message");

    applySettingsFromUrl();

    ellipseCenter = createVector(width / 2, 0);
    ellipseWidth = width;
    ellipseHeight = width;
}

function spawnBalls(pos) {
    startPos = pos
    for (let i = 0; i < n; i++) {
        const x = pos + (2 * i / n);
        const y = ballWidth;
        let hueValue = map(i, 0, n, 0, 360);
        let ballColor = color(hueValue, 100, 100);

        const ball = new Ball(x, y, ballWidth, ballColor);
        balls.push(ball);
    }
}

function draw() {
    background(color(0, 100, 0));

    let prevBallPos = createVector(-1, -1)
    for (const ball of balls) {
        for (let i = 0; i < simulationSteps; i++) {
            ball.applyForce(createVector(0, 0.0003 / simulationSteps)); // Apply gravity
            ball.update();
            resolveCollision(ball, ellipseCenter, ellipseWidth, ellipseHeight);
        }
        ball.display();

        // print(prevBallPos);
        if (drawLine && prevBallPos.x !== -1){
            stroke(ball.color);
            strokeWeight(ballWidth*2);
            line(prevBallPos.x, prevBallPos.y, ball.pos.x, ball.pos.y);
        }
        prevBallPos = ball.pos;
    }

    push();
    stroke(255);
    strokeWeight(3);
    noFill();
    ellipse(ellipseCenter.x, ellipseCenter.y, ellipseWidth, ellipseHeight);
    pop();
}


function updateBallCount() {
    n = ballCountSlider.value();
}

function resetSimulation(pos = random(30, width-30)) {
    balls.length = 0;
    spawnBalls(pos);
    generateQRCode();
}

function updateBallRadius() {
    ballWidth = ballRadiusSlider.value();
}

function toggleShowLine() {
    drawLine = !drawLine;
}

function applySettingsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("count")) {
        n = parseInt(urlParams.get("count"));
        ballCountSlider.value(n);
    }

    if (urlParams.has("ballRadius")) {
        ballWidth = parseInt(urlParams.get("ballRadius"));
        ballRadiusSlider.value(ballWidth);
    }

    if (urlParams.has("showLine")) {
        drawLine = urlParams.get("showLine") === "true";
        showLineCheckbox.checked(drawLine);
    }

    if (urlParams.has("start")) {
        startPos = parseFloat(urlParams.get("start"));
        resetSimulation(startPos * width);
    }else{
        resetSimulation();
    }
}

function generateSettingsUrl() {
    const baseUrl = window.location.href.split("?")[0];
    const urlParams = new URLSearchParams();
    urlParams.set("start", String(startPos / width));
    urlParams.set("count", n);
    urlParams.set("ballRadius", ballWidth);
    urlParams.set("showLine", drawLine);
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

function toggleQrCode() {
    isQrCodeHidden = !isQrCodeHidden;

    const settingsUrl = generateSettingsUrl();

    navigator.clipboard.writeText(settingsUrl).then(() => {
        // Show the "Copied Link to clipboard" message
        copyMessage.style("display", "block");

        // Hide the message after 1 second
        setTimeout(() => {
            copyMessage.style("display", "none");
        }, 1000);
    }).catch((err) => {
        console.error("Could not copy text: ", err);
    });

    if (isQrCodeHidden) {
        qrCodeImage.style("left", "-200px");
        toggleArrow.style("left", "10px");
        // toggleArrow.addClass("hidden");
    } else {
        qrCodeImage.style("left", "10px");
        toggleArrow.style("left", "-200px");
        // toggleArrow.removeClass("hidden");
    }
}