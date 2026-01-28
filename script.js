let faceMesh;
let video;
let faces = [];
let isLoaded = false;
let showMesh = true;
let activeOverlays = { eyes: false, nose: false, mouth: false };

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

window.initCamera = function() {
    updateStatus("Requesting Camera...");
    document.getElementById('start-btn').style.display = 'none';

    // We create the capture and wait for it to be ready
    video = createCapture(VIDEO, (stream) => {
        updateStatus("Stream active. Preparing AI...");
        
        // ML5 v1.x Initialization
        // We pass the video and an empty options object {} to avoid the 'multiple options' error
        faceMesh = ml5.faceMesh(video, {}, () => {
            updateStatus("AI Ready! Start moving.");
            isLoaded = true;
            
            // Only start detecting once the model and video are both confirmed
            faceMesh.detectStart(video, (results) => {
                faces = results;
            });
        });
    });
    
    video.size(640, 480);
    video.hide();
};

function updateStatus(msg) {
    const statusEl = document.getElementById('debug-log');
    if(statusEl) statusEl.innerText = "System: " + msg;
    console.log("Deepfake Lab: " + msg);
}

// Window functions for buttons
window.toggleFeature = function(f) {
    if(f === 'mesh') showMesh = !showMesh;
    updateStatus("Mesh: " + (showMesh ? "Visible" : "Hidden"));
};

window.setOverlay = function(t) {
    activeOverlays[t] = !activeOverlays[t];
    updateStatus("Toggled: " + t);
};

window.resetOverlays = function() {
    activeOverlays = { eyes:false, nose:false, mouth:false };
    showMesh = true;
    updateStatus("Reset All");
};

function draw() {
    // Only draw if the camera and AI are ready
    if (!isLoaded || !video) {
        background(0);
        return;
    }

    // Mirror the video
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces && faces.length > 0) {
        let face = faces[0];
        
        if (showMesh) drawMesh(face);
        
        // Draw features based on keypoints
        if (activeOverlays.eyes) drawEyes(face.keypoints[159], face.keypoints[386]);
        if (activeOverlays.nose) drawNose(face.keypoints[1]);
        if (activeOverlays.mouth) drawMouth(face.keypoints[13]);
    }
}

function drawMesh(face) {
    fill(0, 255, 0);
    noStroke();
    // Use the actual keypoints array from v1.x
    if (face.keypoints) {
        face.keypoints.forEach((kp, i) => {
            if (i % 6 === 0) ellipse(kp.x, kp.y, 4, 4);
        });
    }
}

function drawEyes(l, r) {
    fill(255); stroke(0); strokeWeight(2);
    ellipse(l.x, l.y, 45, 35); ellipse(r.x, r.y, 45, 35);
    fill(0); ellipse(l.x, l.y, 15, 15); ellipse(r.x, r.y, 15, 15);
}

function drawNose(kp) {
    fill(255, 0, 0); noStroke();
    ellipse(kp.x, kp.y, 40, 40);
}

function drawMouth(kp) {
    noFill(); stroke(255, 204, 0); strokeWeight(10);
    arc(kp.x, kp.y, 80, 50, 0, PI);
}
