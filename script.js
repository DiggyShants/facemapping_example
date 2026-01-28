let faceMesh, video, faces = [];
let showMesh = true;
let activeOverlays = { eyes: false, nose: false, mouth: false };
let isLoaded = false;

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
}

async function initCamera() {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('status').innerText = "Requesting camera...";
    
    video = createCapture(VIDEO, () => {
        document.getElementById('status').innerText = "Loading AI Model...";
        faceMesh = ml5.faceMesh(video, { maxFaces: 1 }, () => {
            document.getElementById('status').innerText = "AI Ready!";
            isLoaded = true;
        });
        faceMesh.on("face", results => { faces = results; });
    });
    video.size(640, 480);
    video.hide();
}

function draw() {
    if (!isLoaded) return;
    
    // Mirror the view
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    if (faces.length > 0) {
        let face = faces[0];
        if (showMesh) drawMesh(face);
        if (activeOverlays.eyes) drawEyes(face.keypoints[159], face.keypoints[386]);
        if (activeOverlays.nose) drawNose(face.keypoints[1]);
        if (activeOverlays.mouth) drawMouth(face.keypoints[13]);
    }
}

function drawMesh(face) {
    fill(0, 255, 0);
    noStroke();
    face.keypoints.forEach((kp, i) => {
        if (i % 5 === 0) ellipse(kp.x, kp.y, 3, 3);
    });
}

function drawEyes(l, r) {
    fill(255); stroke(0); strokeWeight(2);
    ellipse(l.x, l.y, 45, 35); ellipse(r.x, r.y, 45, 35);
    fill(0); ellipse(l.x, l.y, 15, 15); ellipse(r.x, r.y, 15, 15);
}

function drawNose(kp) { fill(255, 0, 0); noStroke(); ellipse(kp.x, kp.y, 40, 40); }
function drawMouth(kp) { noFill(); stroke(255, 204, 0); strokeWeight(10); arc(kp.x, kp.y, 60, 40, 0, PI); }

function toggleFeature(f) { if(f==='mesh') showMesh = !showMesh; }
function setOverlay(t) { activeOverlays[t] = !activeOverlays[t]; }
function resetOverlays() { activeOverlays = { eyes:false, nose:false, mouth:false }; showMesh=true; }
