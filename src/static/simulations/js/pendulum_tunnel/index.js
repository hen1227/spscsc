// Define the number of balls and layers
const numBalls = 50;
const spawnRate = 5;
const growthRate = 0.02;
const movementSpeed = 3;

const lineWidth = 4;
const gravity = 0.3;
const updateSpeed = 0.25;
const pendulumMass = 25;
let length1, length2;
let pendulumOpacity = 1;
const showOuterBobs = false;
const showInnerBobs = false;
let pendulum;

// Define an array to store the balls
let balls = [];

let canvas;

function setup() {
// Center the canvas on the page
    if (window.innerWidth < 800) {
        canvas = createCanvas(window.innerWidth, window.innerWidth);
        canvas.parent("canvas");
        length1 = length2 = width/2;
    }else {
        canvas = createCanvas(800, 800);
        canvas.parent("canvas");
    }

    noStroke();
    colorMode(HSB, 360, 100, 100);

    length1 = length2 = width/6;

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetSimulation);

    resetSimulation();
}

function draw() {
    background(0);


    if(frameCount % spawnRate === 1) {
        // Initialize the balls
        for (let i = 0; i < numBalls; i++) {
            balls.push(createNewBall(i / numBalls * TWO_PI));
        }
    }
    pendulum.update(updateSpeed);
    pendulumOpacity -= 0.0020;
    pendulum.displayInner();
    pendulum.displayOuter();
    noStroke();


    // Update and display the balls
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        // Update ball position and size
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.size += ball.growthRate;

        // Calculate opacity based on size
        const opacity = map(ball.size, 5, 7, 0, 1);
        let ballsColor = color(ball.ballColor._getHue(), 100, 100, opacity); // Create a new color with the alpha value
        fill(ballsColor);

        // Display the ball
        ellipse(ball.x, ball.y, ball.size);
    }

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        // Replace ball if it's offscreen or too large
        if (ball.x < -ball.size || ball.x > width + ball.size || ball.y < -ball.size || ball.y > height + ball.size) {
            const index = balls.indexOf(ball);
            if (index > -1) { // only splice array when item is found
                balls.splice(index, 1);
            }
        }
    }
}

function resetSimulation(){
    balls = [];
    pendulum = new Pendulum(width/2, height/2, pendulumMass, pendulumMass, PI - random(-1, 1), PI - random(-1,1), color(255, 100 ,100));
    pendulumOpacity = 1;
}

function createNewBall(angle) {
    // Create a new ball with random initial position, speed, and size
    const x = pendulum.x1;
    const y = pendulum.y1;
    const vx = cos(angle) * movementSpeed;
    const vy = sin(angle) * movementSpeed;
    const size = 5;
    const ballColor = color(((angle + abs(pendulum.angle2))/PI*180) % 360, 100, 100);


    return { x, y, vx, vy, angle, size, growthRate, ballColor };
}
