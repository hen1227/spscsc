let particles = [];
let placedCharges = [];
const numParticles = 400;
let isCircle = false;
let spread = 200;

function setup() {
    createCanvas(720, 720);
    // for(let i=0; i< numParticles; i++){


    spawnBalls();
}

function circlePath(N){
    let t = TWO_PI * N / numParticles;

    let x = cos(t) * (spread)/2 + (width)/2;
    let y = sin(t) * (spread)/2 + (height)/2;
    return createVector(x, y);
}

function spiralPath(N){
    let t = TWO_PI * N / numParticles;
    let dist = map(N, 0, numParticles, spread/2, spread)

    let x = cos(t) * dist + (width)/2;
    let y = sin(t) * dist + (height)/2;
    return createVector(x, y);
}

function spawnBalls() {
    for (let i = 0; i < numParticles; i++) {
        let newPos;
        if(isCircle) {
            newPos = circlePath(i);
        }else{
            newPos = spiralPath(i);
        }

        let hueValue = map(i, 0, numParticles, 0, 360);
        let ballColor = color(hueValue, 100, 100);

        const ball = new Particle(newPos.x, newPos.y);
        particles.push(ball);
    }
}

function draw() {
    background(220);

    // Oscillate the charge of the placed charges
    for(let charge of placedCharges){
        charge.oscillateCharge();
        charge.display();
    }

    // Update and display particles
    for(let particle of particles){
        for(let charge of placedCharges){
            let force = charge.calculateForce(particle);
            particle.applyForce(force);
        }
        particle.update();
        particle.display();
    }
}

function mousePressed() {
    // Add a placed charge at the mouse location on mouse press
    let charge = new PlacedCharge(mouseX, mouseY);
    placedCharges.push(charge);
}

class PlacedCharge {
    constructor(x, y){
        this.position = createVector(x, y);
        this.charge = 1;  // Start with positive charge
    }

    oscillateCharge(){
        // Oscillate between -1 and 1 over time
        this.charge = sin(millis() / 500.0);
    }

    calculateForce(particle){
        let direction = p5.Vector.sub(this.position, particle.position);
        let distanceSq = constrain(direction.magSq(), 5, 25);  // Constrain to avoid extreme forces
        let strength = this.charge * particle.charge / distanceSq;
        let force = direction.normalize().mult(strength);
        return force;
    }

    display(){
        stroke(0);
        if(this.charge > 0){
            fill(255, 0, 0);
        } else {
            fill(0, 0, 255);
        }
        ellipse(this.position.x, this.position.y, 20);
    }
}

class Particle {
    constructor(x, y){
        this.position = createVector(x, y);
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);
        this.charge = 1;  // Uniform charge for all particles
        this.mass = 1;    // Define mass of the particle
    }

    applyForce(force){
        let f = p5.Vector.div(force, this.mass);  // F = ma, so a = F/m
        this.acceleration.add(f);
    }

    update(){
        this.velocity.add(this.acceleration);
        this.velocity.limit(1);  // Add a maximum speed
        this.velocity.mult(1);  // Add a maximum speed
        this.position.add(this.velocity);
        this.acceleration.mult(0);  // Clear acceleration for next frame
    }

    display(){
        stroke(0);
        let colorVal = map(this.charge, -1, 1, 0, 255)
        fill(colorVal, 0, 255-colorVal);
        ellipse(this.position.x, this.position.y, 10);
    }
}
