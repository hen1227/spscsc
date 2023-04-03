let pendulums = [];
let n = 50;
let size = 20;
let length1 = 150;
let length2 = 150;
let lineWidth = 5;
let gravity = 10;

let ballCountSlider;
let resetButton;
let ballRadiusSlider;
let showLineCheckbox;

function setup() {

    // Center the canvas on the page
    let canvas = createCanvas(800, 600);
    canvas.parent("pen-canvas-container"); // Assuming a div with an ID of "pen-canvas-container" exists in your HTML file

    colorMode(HSB, 360, 100, 100);

    // ballCountSlider = select("#ball-count-slider");
    // ballCountSlider.input(updateBallCount);
    //
    // resetButton = select("#reset-btn");
    // resetButton.mousePressed(resetSimulation);
    //
    // ballRadiusSlider = select("#ball-radius-slider");
    // ballRadiusSlider.input(updateBallRadius);
    //
    // showLineCheckbox = select("#show-line-checkbox");
    // showLineCheckbox.changed(toggleShowLine);

    for (let i = 0; i < n; i++) {
        let angle1 = PI*3/4 + (i/n/30)
        // let angle2 = random(0, TWO_PI);
        let x = width / 2;
        let y = height / 2;

        let hueValue = map(i, 0, n, 0, 360);
        let penColor = color(hueValue, 100, 100);
        let newPen = new Pendulum(x, y, length1, length2, size, size, angle1, PI/2, penColor);
        newPen.angle1Velocity = -0.2;
        pendulums[i] = newPen;
    }
}

function draw() {
    background(color(0, 100, 0));

    let dt = 1.0 / 20.0;
    for (let pendulum of pendulums) {
        pendulum.update(dt);
        pendulum.display();
    }
}