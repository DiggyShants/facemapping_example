let faceMesh, video, faces = [];
let showMesh = true;
let activeOverlays = { eyes: false, nose: false, mouth: false };
let isLoaded = false;

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

// Attach these to the WINDOW object so the HTML buttons can always find them
window.initCamera = async function() {
    log("Requesting Camera Permissions...");
    document.getElementById('start-btn').style.display = 'none';
    
    video = createCapture(VIDEO, () => {
        log("Camera Active. Loading Face Model (approx 15MB)...");
        faceMesh = ml5.faceMesh(video, { maxFaces: 1 }, () => {
            log("AI Ready! Features Unlocked.");
            isLoaded = true;
        });
        faceMesh.on("face", results => { faces = results; });
    });
    video.size(640, 480);
    video.hide();
};

window.toggleFeature = function(f) {
    if(f === 'mesh') showMesh = !showMesh;
    log("Mesh: " + (showMesh ? "Visible" : "Hidden"));
};

window.setOverlay = function(t) {
    activeOverlays[t] = !activeOverlays[t];
    document.getElementById('btn-' + t).classList.toggle('active');
    log("Toggled: " + t);
};

window.resetOverlays = function() {
    activeOverlays = { eyes:false, nose:false, mouth:false };
    showMesh = true;
    document.querySelectorAll('.button-group button').forEach(b => b.classList.remove('active'));
    log("All features cleared.");
};

function log(msg) {
    document.getElementById('debug-log').innerText = "System: " + msg;
    console.log(msg);
}

function draw() {
    if (!isLoaded) return;
    
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces.length > 0) {
        let face = faces[0];
        if (showMesh) drawMesh(face);
        
        // Use specific keypoint indices from the FaceMesh model
        if (activeOverlays.eyes) drawCartoonEyes(face.keypoints[159], face.keypoints[386]);
        if (activeOverlays.nose) drawCartoonNose(face.keypoints[1]);
        if (activeOverlays.mouth) drawCartoonMouth(face.keypoints[13]);
    }
}

function drawMesh(face) {
    fill(0, 255, 0); noStroke();
    face.keypoints.forEach((kp, i) => { if (i % 8 === 0) ellipse(kp.x, kp.y, 3, 3); });
}

function drawCartoonEyes(l, r) {
    push();
    fill(255); stroke(0); strokeWeight(3);
    ellipse(l.x, l.y, 50, 40); ellipse(r.x, r.y, 50, 40);
    fill(0); ellipse(l.x, l.y, 18, 18); ellipse(r.x, r.y, 18, 18);
    pop();
}

function drawCartoonNose(kp) {
    push(); fill(255, 0, 0); noStroke(); ellipse(kp.x, kp.y, 45, 45); pop();
}

function drawCartoonMouth(kp) {
    push(); noFill(); stroke(255, 204, 0); strokeWeight(12); arc(kp.x, kp.y, 70, 50, 0, PI); pop();
}
