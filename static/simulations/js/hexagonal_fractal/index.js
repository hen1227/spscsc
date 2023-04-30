const nodeRadius = 15;
const nodeSpacing = nodeRadius * 2;
const valueDecay = 0.05;
const valueTransfer = 0.15;
const mouseEffect = 0.3;
const mouseEffectRadius = 100;

let nodes = [];

function setup() {
    createCanvas(800, 800);
    colorMode(HSB, 360, 100, 100);

    const offsetX = nodeSpacing / 2;
    const offsetY = nodeSpacing * Math.sqrt(3) / 2;

    for (let y = 0; y < height + offsetY; y += offsetY * 2) {
        for (let x = 0; x < width + offsetX; x += nodeSpacing) {
            nodes.push(new Node(x, y, nodeRadius));
            nodes.push(new Node(x + offsetX, y + offsetY, nodeRadius));
        }
    }
}

function draw() {
    background(0);

    for (let node of nodes) {
        node.update();
        node.display();
    }
}

class Node {
    constructor(x, y, radius) {
        this.pos = createVector(x, y);
        this.radius = radius;
        this.value = 0;
    }

    update() {
        const mousePos = createVector(mouseX, mouseY);
        const distance = dist(mousePos.x, mousePos.y, this.pos.x, this.pos.y);

        if (distance < mouseEffectRadius) {
            this.value += (mouseEffectRadius - distance) * mouseEffect;
        }

        this.value *= 1 - valueDecay;

        for (let neighbor of nodes) {
            const neighborDistance = dist(neighbor.pos.x, neighbor.pos.y, this.pos.x, this.pos.y);
            if (neighborDistance < this.radius * 2.5) {
                if (this.value > neighbor.value) {
                    const transfer = (this.value - neighbor.value) * valueTransfer;
                    this.value -= transfer;
                    neighbor.value += transfer;
                }
            }
        }
    }

    display() {
        const hue = map(this.value, 0, 100, 0, 320);
        fill(hue, 100, 100);
        // noStroke();

        // Draw a hexagon instead of a circle
        let scaleFactor = map(this.value, 0, 100, 0.85, 0.95);
        push();
        noStroke();
        translate(this.pos.x, this.pos.y);
        rotate(radians(30));
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i;
            let x = this.radius * cos(angle) * scaleFactor;
            let y = this.radius * sin(angle) * scaleFactor;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    }
}