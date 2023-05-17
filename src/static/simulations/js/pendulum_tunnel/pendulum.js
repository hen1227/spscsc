class Pendulum {
    constructor(x, y, mass1, mass2, angle1, angle2, color) {
        this.origin = createVector(x, y);
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.angle1Velocity = 0;
        this.angle2Velocity = 0;
        this.color = color;
    }

    update(dt) {
        // https://en.wikipedia.org/wiki/Double_pendulum
        // Chaos! It works, don't touch
        let num1 = -gravity * (2 * this.mass1 + this.mass2) * sin(this.angle1);
        let num2 = -this.mass2 * gravity * sin(this.angle1 - 2 * this.angle2);
        let num3 = -2 * sin(this.angle1 - this.angle2) * this.mass2;
        let num4 = this.angle2Velocity * this.angle2Velocity * length2 + this.angle1Velocity * this.angle1Velocity * length1 * cos(this.angle1 - this.angle2);
        let den1 = length1 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
        let angle1Accel = (num1 + num2 + num3 * num4) / den1;

        num1 = 2 * sin(this.angle1 - this.angle2);
        num2 = this.angle1Velocity * this.angle1Velocity * length1 * (this.mass1 + this.mass2);
        num3 = gravity * (this.mass1 + this.mass2) * cos(this.angle1);
        num4 = this.angle2Velocity * this.angle2Velocity * length2 * this.mass2 * cos(this.angle1 - this.angle2);
        let den2 = length2 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
        let angle2Accel = (num1 * (num2 + num3 + num4)) / den2;

        this.angle1Velocity += angle1Accel * dt;
        this.angle2Velocity += angle2Accel * dt;
        this.angle1 += this.angle1Velocity * dt;
        this.angle2 += this.angle2Velocity * dt;

        this.x1 = this.origin.x + length1 * sin(this.angle1);
        this.y1 = this.origin.y + length1 * cos(this.angle1);
        this.x2 = this.x1 + length2 * sin(this.angle2);
        this.y2 = this.y1 + length2 * cos(this.angle2);
    }

    displayInner() {
        stroke(this.color.levels[0],this.color.levels[1],this.color.levels[2], pendulumOpacity);
        strokeWeight(lineWidth);
        line(this.origin.x, this.origin.y, this.x1, this.y1);
        if(showInnerBobs){
            noStroke();
            fill(this.color.levels[0],this.color.levels[1],this.color.levels[2], pendulumOpacity);
            ellipse(this.x1, this.y1, lineWidth*2)
        }
    }
    displayOuter() {
        stroke(this.color.levels[0],this.color.levels[1],this.color.levels[2], pendulumOpacity);
        strokeWeight(lineWidth);
        line(this.x1, this.y1, this.x2, this.y2);

        if(showOuterBobs){
            noStroke();
            fill(this.color.levels[0],this.color.levels[1],this.color.levels[2], pendulumOpacity);
            ellipse(this.x2, this.y2, lineWidth*2)
        }
    }

}