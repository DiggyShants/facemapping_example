let faceMesh, video, faces = [];
let showMesh = true;
let activeOverlays = { eyes: false, nose: false, mouth: false };
let isLoaded = false;

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

window.initCamera = async function() {
    updateStatus("Requesting Camera Permissions...");
    document.getElementById('start-btn').style.display = 'none';
    
    // In ml5 v1.x, the callback receives 'results' directly
    video = createCapture(VIDEO, () => {
        updateStatus("Camera Active. Loading Face Model...");
        
        // ML5 NEXT GEN SYNTAX
        faceMesh = ml5.faceMesh(video, { maxFaces: 1 }, (results) => {
            updateStatus("AI Ready! Features Unlocked.");
            faces = results; // Set initial results
            isLoaded = true;
        });

        // The listener for new data in v1.x is detectStart
        faceMesh.detectStart(video, (results) => {
            faces = results;
        });
    });
    
    video.size(640, 480);
    video.hide();
};

window.toggleFeature = function(f) {
    if(f === 'mesh') showMesh = !showMesh;
    updateStatus("Mesh: " + (showMesh ? "Visible" : "Hidden"));
};

window.setOverlay = function(t) {
    activeOverlays[t] = !activeOverlays[t];
    const btn = document.getElementById('btn-' + t);
    if(btn) btn.classList.toggle('active');
    updateStatus("Toggled: " + t);
};

window.resetOverlays = function() {
    activeOverlays = { eyes:false, nose:false, mouth:false };
    showMesh = true;
    document.querySelectorAll('.button-group button').forEach(b => b.classList.remove('active'));
    updateStatus("All features cleared.");
};

// Renamed from 'log' to 'updateStatus' to avoid p5.js conflict
function updateStatus(msg) {
    const statusEl = document.getElementById('debug-log');
    if(statusEl) statusEl.innerText = "System: " + msg;
    console.log("Deepfake Lab: " + msg);
}

function draw() {
    if (!isLoaded) return;
    
    // Mirror the view for a natural feel
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces && faces.length > 0) {
        let face = faces[0];
        
        if (showMesh) drawMesh(face);
        
        // Keypoints in ml5 v1.x are accessed directly via index
        if (activeOverlays.eyes) drawCartoonEyes(face.keypoints[159], face.keypoints[386]);
        if (activeOverlays.nose) drawCartoonNose(face.keypoints[1]);
        if (activeOverlays.mouth) drawCartoonMouth(face.keypoints[13]);
    }
}

function drawMesh(face) {
    fill(0, 255, 0); 
    noStroke();
    // Loop through all 468+ points
    for (let i = 0; i < face.keypoints.length; i++) {
        let kp = face.keypoints[i];
        if (i % 5 === 0) { // Only draw every 5th point so it's not too crowded
            ellipse(kp.x, kp.y, 3, 3);
        }
    }
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
    push(); noFill(); stroke(255, 204, 0); strokeWeight(12); 
    // Draw the arc based on the mouth keypoint
    arc(kp.x, kp.y, 70, 50, 0, PI); 
    pop();
}
