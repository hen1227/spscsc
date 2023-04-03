class Pendulum {
    constructor(x, y, length1, length2, mass1, mass2, angle1, angle2, color) {
        this.origin = createVector(x, y);
        this.length1 = length1;
        this.length2 = length2;
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.angle1 = angle1;
        this.angle2 = angle2;
        this.angle1Velocity = 0;
        this.angle2Velocity = 0;
        this.color = color;
    }

    update(dt) {
        let num1 = -gravity * (2 * this.mass1 + this.mass2) * sin(this.angle1);
        let num2 = -this.mass2 * gravity * sin(this.angle1 - 2 * this.angle2);
        let num3 = -2 * sin(this.angle1 - this.angle2) * this.mass2;
        let num4 = this.angle2Velocity * this.angle2Velocity * this.length2 + this.angle1Velocity * this.angle1Velocity * this.length1 * cos(this.angle1 - this.angle2);
        let den1 = this.length1 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
        let angle1Accel = (num1 + num2 + num3 * num4) / den1;

        num1 = 2 * sin(this.angle1 - this.angle2);
        num2 = this.angle1Velocity * this.angle1Velocity * this.length1 * (this.mass1 + this.mass2);
        num3 = gravity * (this.mass1 + this.mass2) * cos(this.angle1);
        num4 = this.angle2Velocity * this.angle2Velocity * this.length2 * this.mass2 * cos(this.angle1 - this.angle2);
        let den2 = this.length2 * (2 * this.mass1 + this.mass2 - this.mass2 * cos(2 * this.angle1 - 2 * this.angle2));
        let angle2Accel = (num1 * (num2 + num3 + num4)) / den2;

        this.angle1Velocity += angle1Accel * dt;
        this.angle2Velocity += angle2Accel * dt;
        this.angle1 += this.angle1Velocity * dt;
        this.angle2 += this.angle2Velocity * dt;
    }

    display() {
        let x1 = this.origin.x + this.length1 * sin(this.angle1);
        let y1 = this.origin.y + this.length1 * cos(this.angle1);
        let x2 = x1 + this.length2 * sin(this.angle2);
        let y2 = y1 + this.length2 * cos(this.angle2);

        stroke(this.color);
        strokeWeight(lineWidth);
        line(this.origin.x, this.origin.y, x1, y1);
        line(x1, y1, x2, y2);
    }
}