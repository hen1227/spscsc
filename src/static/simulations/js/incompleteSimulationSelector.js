// Set up the Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("scene-container").appendChild(renderer.domElement);

// Add balls to the scene
const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const balls = [];

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// Create balls based on the first image
const firstImage = document.querySelector(".hidden-images img");
let ballsCreated = false;

const ballsPerPixel = 128;
firstImage.addEventListener("load", () => {
    const imageData = getImageData(firstImage);
    const { width, height } = imageData;

    console.log(imageData.data);
    for (let i = 0; i < width * height; i += ballsPerPixel) {
        const pixelIndex = i * 4;
        const a = imageData.data[pixelIndex + 3]; // Alpha value
        // if(imageData.data[pixelIndex] === 0) {
        //     continue;
        // }
        console.log(imageData.data[i])
        // Create a ball only if the alpha value is not 0
        if (a !== 0) {
            const ball = new THREE.Mesh(geometry, material);
            ball.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
            console.log(ball);
            scene.add(ball);
            balls.push(ball);
        }
    }

    ballsCreated = true; // Set the flag
});

camera.position.z = 30;

// Create links and add them to the DOM
const links = ["double-pendulum", "bounce", "circular-projectiles", "gravity", "pendulum-tunnel"];
const linkRadius = 120;
const linksContainer = document.querySelector(".links-container");
links.forEach((text, index) => {
    const link = document.createElement("a");
    link.className = "link";
    link.innerText = text;
    link.style.transform = `rotate(${index * 72}deg) translate(${linkRadius}px)`;
    linksContainer.appendChild(link);
});

const linkObjects = linksContainer.children;
// Add the fadeIn class to the hovered image and remove it from others
Array.from(linkObjects).forEach((link, index) => {
    link.addEventListener("mouseover", () => {
        hoveredImage = images[index];
        images.forEach((image, i) => {
            if (i === index) {
                image.classList.add("fadeIn");
            } else {
                image.classList.remove("fadeIn");
            }
        });
    });
    link.addEventListener("mouseout", () => {
        hoveredImage = null;
        images.forEach((image) => {
            image.classList.remove("fadeIn");
        });
    });
});

// Function to get pixel data from the image
function getImageData(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

// Load images and assign balls to pixels
const images = document.querySelectorAll(".hidden-images img");
const imageDatas = [];

images.forEach((image) => {
    image.addEventListener("load", () => {
        imageDatas.push(getImageData(image));
    });
    image.style.display = "block"; // Ensure the images are visible for getImageData to work
});

// Initialize hoveredImage
let hoveredImage = null;

// Adjust the balls' motion and color
function animate() {
    requestAnimationFrame(animate);

    if (!ballsCreated) {
        return; // Do not animate the balls if they haven't been created
    }

    if (!hoveredImage) {
        balls.forEach((ball) => {
            ball.rotation.x += 0.005;
            ball.rotation.y += 0.005;
            ball.material.color.r + 0.001;
            ball.material.color.g + 0.001;
            ball.material.color.b + 0.001;
        });
    } else {
        const imageData = imageDatas[Array.from(images).indexOf(hoveredImage)];
        const { width, height } = imageData;

        const pixelSize = Math.ceil(Math.sqrt(width * height / balls.length));
        const pixelsPerBall = pixelSize * pixelSize;
        const numBalls = Math.ceil(width * height / pixelsPerBall);

        balls.forEach((ball, index) => {
            const pixelIndex = index * pixelsPerBall * 4;
            const r = imageData.data[pixelIndex];
            const g = imageData.data[pixelIndex + 1];
            const b = imageData.data[pixelIndex + 2];
            const a = 1;

            console.log(r)
            console.log(g)
            console.log(b)

            const dim = Math.sqrt(width*height/ballsPerPixel)
            let x = (Math.floor(index) % Math.floor(dim)) - dim/2
            let y = Math.floor(index / Math.ceil(dim)) - dim/2

            ball.position.x += (ball.position.x-x)*-0.1;
            ball.position.y += (ball.position.y-y)*-0.1;
            ball.position.z += (ball.position.z-0)*-0.1;

            if (a !== 0) {
                const color = new THREE.Color(r/255, g/255, b/255);
                ball.material = new THREE.MeshBasicMaterial({ color: color });

            } else {
                ball.material.color.setRGB(0, 0, 0);
            }
        });
    }

    renderer.render(scene, camera);
}

// Handle mouse move
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    camera.position.x = 30 * mouseX;
    camera.position.y = 30 * mouseY;
    camera.lookAt(scene.position);
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


animate();