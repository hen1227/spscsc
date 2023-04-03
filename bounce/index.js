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
// const lineWidth = 15;

const balls = [];
let ellipseCenter
let ellipseWidth = 0
let ellipseHeight = 0

let ballCountSlider;
let resetButton;
let ballRadiusSlider;
let showLineCheckbox;

function setup() {
    // createCanvas(800, 600);
    // frameRate(600);
    colorMode(HSB, 360, 100, 100);

    // Center the canvas on the page
    let canvas = createCanvas(800, 600);
    canvas.parent("canvas-container"); // Assuming a div with an ID of "canvas-container" exists in your HTML file

    ballCountSlider = select("#ball-count-slider");
    ballCountSlider.input(updateBallCount);

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetSimulation);

    ballRadiusSlider = select("#ball-radius-slider");
    ballRadiusSlider.input(updateBallRadius);

    showLineCheckbox = select("#show-line-checkbox");
    showLineCheckbox.changed(toggleShowLine);



    ellipseCenter = createVector(width / 2, 0);
    ellipseWidth = width;
    ellipseHeight = width;

    spawnBalls(); // Spawn n balls with random positions and velocities
}

// function mousePressed() {
//     // Reset the simulation when the screen is clicked
//     balls.length = 0; // Clear the balls array
//     spawnBalls(); // Spawn n balls with random positions and velocities
// }

function spawnBalls() {
    let startPos = random(30, width-30);
    for (let i = 0; i < n; i++) {
        const x = startPos + (2 * i / n);
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

function resetSimulation() {
    balls.length = 0;
    spawnBalls();
}

function updateBallRadius() {
    ballWidth = ballRadiusSlider.value();
}

function toggleShowLine() {
    drawLine = !drawLine;
}