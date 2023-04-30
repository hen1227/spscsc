let pendulums = [];
let n = 50;
let mass = 20;
let length1 = 150;
let length2 = 150;
let lineWidth = 5;
let gravity = 10;
let opacity = 100;
let showInnerBobs = false;
let showOuterBobs = false;

let start1 = 0;
let start2 = 0;
let v2 = 0;
let v1 = 0;

let pendulumWidthSlider;
let pendulumCountSlider;
// let pendulumInnerLengthSlider;
// let pendulumOuterLengthSlider;
let pendulumOpacitySlider;
let showInnerBobsCheckbox;
let showOuterBobsCheckbox;

let resetButton;
let replayButton;

let recordButton;

let qrCodeImage;
let toggleArrow;
let isQrCodeHidden = false;

let copyMessage;

let canvasRecordingSystem;

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

    canvasRecordingSystem = new CanvasRecorder()

    setRandomValues();

    pendulumCountSlider = select("#pendulum-count-slider");
    pendulumCountSlider.input(updatePendulumCount);

    // pendulumInnerLengthSlider = select("#pendulum-inner-length-slider");
    // pendulumInnerLengthSlider.input(updatePendulumInnerLength);

    showInnerBobsCheckbox = select("#pendulum-show-inner-bobs");
    showInnerBobsCheckbox.changed(toggleShowInnerBobs);

    showOuterBobsCheckbox = select("#pendulum-show-outer-bobs");
    showOuterBobsCheckbox.changed(toggleShowOuterBobs);

    pendulumOpacitySlider = select("#pendulum-opacity-slider");
    pendulumOpacitySlider.input(updateOpacity);


    // recordButton = select("#record-btn");
    // recordButton.mousePressed(toggleRecording);

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

function draw() {
    background(color(0, 0, 0));

    let dt = 1.0 / 20.0;
    for (let pendulum of pendulums) {
        pendulum.update(dt);
        pendulum.displayInner();
        pendulum.displayOuter();
    }

    canvasRecordingSystem.recordFrame();
}

function spawnPendulums(){
    colorMode(HSB, 360, 100, 100);
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
    colorMode(RGB)
}

function updatePendulumCount() {
    n = pendulumCountSlider.value();
}

function updateOpacity(){
    opacity = pendulumOpacitySlider.value();
}

function toggleShowInnerBobs(){
    showInnerBobs = !showInnerBobs;
}

function toggleShowOuterBobs(){
    showOuterBobs = !showOuterBobs;
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

function setRandomValues() {
    length1 = width / 4 -10;
    length2 = width / 4 -10;
    start1 = PI - random(-PI/2, PI/2);
    start2 = random(-PI, PI);
    v2 = random(-0.2, 0.2);
    v1 = random(-0.2, 0.2);
}

function resetPressed(){
    setRandomValues();
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

function toggleRecording() {
    canvasRecordingSystem.toggleRecording();
    recordButton.html(canvasRecordingSystem.isRecording ? "Stop Recording" : "Start Recording");
    resetSimulation();
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
        length1 = parseFloat(urlParams.get("inner"))*width;
        // pendulumInnerLengthSlider.value(length1);
    }

    if (urlParams.has("outer")) {
        length2 = parseFloat(urlParams.get("outer"))*width;
        // pendulumOuterLengthSlider.value(length2);
    }

    if (urlParams.has("opacity")) {
        opacity = parseFloat(urlParams.get("opacity"));
        pendulumOpacitySlider.value(opacity);
    }

    if (urlParams.has("b1")) {
        showInnerBobs = urlParams.get("b1") === "true";
        showInnerBobsCheckbox.checked(showInnerBobs);
    }

    if (urlParams.has("b2")) {
        showOuterBobs = urlParams.get("b2") === "true";
        showOuterBobsCheckbox.checked(showOuterBobs);
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
    urlParams.set("opacity", opacity);
    // urlParams.set("inner", String(length1/width));
    // urlParams.set("outer", String(length2/width));
    urlParams.set("s1", start1);
    urlParams.set("s2", start2);
    urlParams.set("v1", v1);
    urlParams.set("v2", v2);
    urlParams.set("b1", showInnerBobs);
    urlParams.set("b2", showOuterBobs);
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
        // toggleArrow.addClass("hidden");
    } else {
        qrCodeImage.style("left", "10px");
        toggleArrow.style("left", "-200px");
        // toggleArrow.removeClass("hidden");
    }
}