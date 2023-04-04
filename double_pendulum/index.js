let pendulums = [];
let n = 50;
let mass = 20;
let length1 = 150;
let length2 = 150;
let lineWidth = 5;
let gravity = 10;

let start1 = 0;
let start2 = 0;
let v2 = 0;
let v1 = 0;

let pendulumWidthSlider;
let pendulumCountSlider;
let pendulumInnerLengthSlider;
let pendulumOuterLengthSlider;
let resetButton;
let replayButton;

let qrCodeImage;
let toggleArrow;
let isQrCodeHidden = false;

let copyMessage;

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

    start1 = random(-PI/2, PI/2);
    start2 = random(-PI/2, PI/2);
    v2 = random(-1, 1);
    v1 = random(-1, 1);

    colorMode(HSB, 360, 100, 100);

    pendulumCountSlider = select("#pendulum-count-slider");
    pendulumCountSlider.input(updatePendulumCount);

    pendulumInnerLengthSlider = select("#pendulum-inner-length-slider");
    pendulumInnerLengthSlider.input(updatePendulumInnerLength);

    pendulumOuterLengthSlider = select("#pendulum-outer-length-slider");
    pendulumOuterLengthSlider.input(updatePendulumOuterLength);

    replayButton = select("#replay-btn");
    replayButton.mousePressed(replayPressed);

    resetButton = select("#reset-btn");
    resetButton.mousePressed(resetPressed);

    pendulumWidthSlider = select("#pendulum-width-slider");
    pendulumWidthSlider.input(updatePendulumWidth);


    qrCodeImage = select("#qr-code");
    qrCodeImage.mousePressed(toggleQrCode);
    toggleArrow = select("#qr-toggle-arrow");
    toggleArrow.mousePressed(toggleQrCode);
    copyMessage = select("#copy-message");

    applySettingsFromUrl();
}

function spawnPendulums(){
    for (let i = 0; i < n; i++) {
        let x = width / 2;
        let y = height / 2;

        let angle1 = start1 + (i/n/50);
        let angle2 = start2 + (i/n/50);

        let hueValue = map(i, 0, n, 0, 360);
        let penColor = color(hueValue, 100, 100);

        let newPen = new Pendulum(x, y, length1, length2, mass, mass, angle1, angle2, penColor);
        newPen.angle1Velocity = v1;
        newPen.angle2Velocity = v2;
        pendulums[i] = newPen;
    }
}

function updatePendulumCount() {
    n = pendulumCountSlider.value();
}

function updatePendulumInnerLength() {
    length1 = pendulumInnerLengthSlider.value();
}

function updatePendulumOuterLength() {
    length2 = pendulumOuterLengthSlider.value();
}

function updatePendulumWidth() {
    lineWidth = pendulumWidthSlider.value();
}

function resetPressed(){
    start1 = random(-PI/2, PI/2);
    start2 = random(-PI/2, PI/2);
    v2 = random(-1, 1);
    v1 = random(-1, 1);

    resetSimulation();
}

function replayPressed(){
    resetSimulation();
}

function resetSimulation() {
    pendulums.length = 0;
    spawnPendulums();
    generateQRCode();
}

function draw() {
    background(color(0, 100, 0));

    let dt = 1.0 / 20.0;
    for (let pendulum of pendulums) {
        pendulum.update(dt);
        pendulum.displayInner();
        pendulum.displayOuter();
    }
}



function applySettingsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("count")) {
        n = parseInt(urlParams.get("count"));
        pendulumCountSlider.value(n);
    }

    if (urlParams.has("width")) {
        lineWidth = parseInt(urlParams.get("width"));
        pendulumWidthSlider.value(lineWidth);
    }

    if (urlParams.has("inner")) {
        length1 = parseInt(urlParams.get("inner"));
        pendulumInnerLengthSlider.value(length1);
    }

    if (urlParams.has("outer")) {
        length2 = parseInt(urlParams.get("outer"));
        pendulumOuterLengthSlider.value(length2);
    }

    if (urlParams.has("s1")) {
        start1 = parseFloat(urlParams.get("s1"));
    }

    if (urlParams.has("s2")) {
        start2 = parseFloat(urlParams.get("s2"));
    }

    if (urlParams.has("v1")) {
        v1 = parseFloat(urlParams.get("v1"));
    }

    if (urlParams.has("v2")) {
        v2 = parseFloat(urlParams.get("v2"));
    }

    resetSimulation();
}

function generateSettingsUrl() {
    const baseUrl = window.location.href.split("?")[0];
    const urlParams = new URLSearchParams();
    urlParams.set("count", n);
    urlParams.set("width", lineWidth);
    urlParams.set("inner", length1);
    urlParams.set("outer", length2);
    urlParams.set("s1", start1);
    urlParams.set("s2", start2);
    urlParams.set("v1", v1);
    urlParams.set("v2", v2);
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