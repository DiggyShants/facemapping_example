let faceMesh, video, faces = [];
let showMesh = true;
let activeOverlays = { eyes: false, nose: false, mouth: false };
let isLoaded = false;

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

// Make globally accessible for the HTML buttons
window.initCamera = async function() {
    updateStatus("Requesting Camera Permissions...");
    document.getElementById('start-btn').style.display = 'none';
    
    video = createCapture(VIDEO, () => {
        updateStatus("Camera Active. Loading AI Model...");
        
        // ML5 NEXT GEN SYNTAX: 
        // We initialize faceMesh and then use detectStart to begin the loop
        faceMesh = ml5.faceMesh(video, { maxFaces: 1 }, () => {
            updateStatus("AI Ready! Features Unlocked.");
            isLoaded = true;
        });

        // The 'detectStart' method is what replaces the old '.on' syntax
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

// Renamed to 'updateStatus' to avoid p5.js 'log' conflict
function updateStatus(msg) {
    const statusEl = document.getElementById('debug-log');
    if(statusEl) statusEl.innerText = "System: " + msg;
    console.log("Deepfake Lab: " + msg);
}

function draw() {
    if (!isLoaded) return;
    
    // Mirror the view
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces && faces.length > 0) {
        let face = faces[0];
        
        if (showMesh) drawMesh(face);
        
        // Landmark indexing for ml5 v1.x
        if (activeOverlays.eyes) drawCartoonEyes(face.keypoints[159], face.keypoints[386]);
        if (activeOverlays.nose) drawCartoonNose(face.keypoints[1]);
        if (activeOverlays.mouth) drawCartoonMouth(face.keypoints[13]);
    }
}

function drawMesh(face) {
    fill(0, 255, 0); 
    noStroke();
    for (let i = 0; i < face.keypoints.length; i++) {
        let kp = face.keypoints[i];
        if (i % 8 === 0) { // Drawing every 8th point for a clean "map" look
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
    arc(kp.x, kp.y, 70, 50, 0, PI); 
    pop();
}
