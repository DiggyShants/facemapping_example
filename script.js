let faceMesh, video, faces = [];
let isLoaded = false;
let showMesh = true;

// Feature storage
let activeFeatures = { eyes: null, nose: null, mouth: null };
let eyeImgs = [], noseImgs = [], mouthImgs = [];

// Configuration - Update these numbers based on how many images you make!
const EYE_COUNT = 4; 
const NOSE_COUNT = 3;
const MOUTH_COUNT = 3;

function preload() {
    // Load images from your /assets/ folder
    for (let i = 0; i < EYE_COUNT; i++) eyeImgs.push(loadImage(`assets/eye${i}.png`));
    for (let i = 0; i < NOSE_COUNT; i++) noseImgs.push(loadImage(`assets/nose${i}.png`));
    for (let i = 0; i < MOUTH_COUNT; i++) mouthImgs.push(loadImage(`assets/mouth${i}.png`));
}

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

window.initCamera = function() {
    document.getElementById('start-btn').style.display = 'none';
    video = createCapture(VIDEO, () => {
        faceMesh = ml5.faceMesh(video, {}, () => {
            isLoaded = true;
            faceMesh.detectStart(video, (results) => { faces = results; });
        });
    });
    video.size(640, 480);
    video.hide();
};

// Randomizer Functions for Buttons
window.setOverlay = function(type) {
    if (type === 'eyes') activeFeatures.eyes = random(eyeImgs);
    if (type === 'nose') activeFeatures.nose = random(noseImgs);
    if (type === 'mouth') activeFeatures.mouth = random(mouthImgs);
};

window.toggleFeature = function(f) { if(f === 'mesh') showMesh = !showMesh; };

window.resetOverlays = function() {
    activeFeatures = { eyes: null, nose: null, mouth: null };
};

function draw() {
    if (!isLoaded) return;
    translate(width, 0); scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces && faces.length > 0) {
        let face = faces[0];
        
        if (showMesh) drawDeepfakeMesh(face);
        
        // Render Random Images
        if (activeFeatures.eyes) {
            drawFeature(activeFeatures.eyes, face.keypoints[159], 150); // Left
            drawFeature(activeFeatures.eyes, face.keypoints[386], 150); // Right
        }
        if (activeFeatures.nose) drawFeature(activeFeatures.nose, face.keypoints[1], 100);
        if (activeFeatures.mouth) drawFeature(activeFeatures.mouth, face.keypoints[13], 150);
    }
}

function drawDeepfakeMesh(face) {
    stroke(0, 255, 0, 100); // Semi-transparent green
    strokeWeight(1);
    noFill();
    // This draws triangles between points to show the "topology"
    for (let i = 0; i < face.keypoints.length; i += 10) {
        beginShape(TRIANGLE_STRIP);
        for(let j = 0; j < 3; j++) {
            let pt = face.keypoints[(i+j) % face.keypoints.length];
            vertex(pt.x, pt.y);
        }
        endShape();
    }
}

function drawFeature(img, kp, size) {
    push();
    imageMode(CENTER);
    // Draw the image at the landmark coordinate
    image(img, kp.x, kp.y, size, size);
    pop();
}
