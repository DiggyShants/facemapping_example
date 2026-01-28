// --- GLOBAL VARIABLES ---
let faceMesh, camera, videoElement, canvasElement, canvasCtx;
let isLoaded = false;
let showMesh = true;

// Feature storage for randomization
let activeFeatures = { eyes: null, nose: null, mouth: null };
let eyeImgs = [], noseImgs = [], mouthImgs = [];

// --- INITIALIZE ON PAGE LOAD ---
window.onload = function() {
    videoElement = document.getElementsByClassName('input_video')[0];
    canvasElement = document.getElementsByClassName('output_canvas')[0];
    canvasCtx = canvasElement.getContext('2d');

    // Preload images (Change numbers based on how many assets you have)
    for (let i = 0; i < 3; i++) {
        let e = new Image(); e.src = `assets/eye${i}.png`; eyeImgs.push(e);
        let n = new Image(); n.src = `assets/nose${i}.png`; noseImgs.push(n);
        let m = new Image(); m.src = `assets/mouth${i}.png`; mouthImgs.push(m);
    }

    // Setup MediaPipe Face Mesh
    faceMesh = new FaceMesh({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    console.log("System: MediaPipe Initialized.");
};

// --- START CAMERA FUNCTION ---
window.initCamera = function() {
    console.log("System: Requesting Camera...");
    document.getElementById('start-btn').style.display = 'none';

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({image: videoElement});
        },
        width: 640,
        height: 480
    });
    camera.start();
    isLoaded = true;
};

// --- BUTTON CONTROLS ---
window.toggleFeature = function(f) { if(f === 'mesh') showMesh = !showMesh; };

window.setOverlay = function(type) {
    if (type === 'eyes') activeFeatures.eyes = eyeImgs[Math.floor(Math.random() * eyeImgs.length)];
    if (type === 'nose') activeFeatures.nose = noseImgs[Math.floor(Math.random() * noseImgs.length)];
    if (type === 'mouth') activeFeatures.mouth = mouthImgs[Math.floor(Math.random() * mouthImgs.length)];
};

window.resetOverlays = function() {
    activeFeatures = { eyes: null, nose: null, mouth: null };
};

// --- RENDER LOOP ---
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw Video Feed (Mirrored)
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            
            // Draw Advanced Mesh
            if (showMesh) {
                drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#00FF0070', lineWidth: 1});
            }

            // Draw Randomized Features with Dynamic Scaling
            if (activeFeatures.eyes) {
                let eyeSize = getDist(landmarks[33], landmarks[133]) * canvasElement.width * 2.2;
                drawImg(activeFeatures.eyes, landmarks[159], eyeSize);
                drawImg(activeFeatures.eyes, landmarks[386], eyeSize);
            }
            if (activeFeatures.nose) {
                let noseSize = getDist(landmarks[61], landmarks[291]) * canvasElement.width * 1.5;
                drawImg(activeFeatures.nose, landmarks[1], noseSize);
            }
            if (activeFeatures.mouth) {
                let mouthSize = getDist(landmarks[61], landmarks[291]) * canvasElement.width * 2.0;
                drawImg(activeFeatures.mouth, landmarks[13], mouthSize);
            }
        }
    }
    canvasCtx.restore();
}

function getDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function drawImg(img, lm, size) {
    const x = lm.x * canvasElement.width;
    const y = lm.y * canvasElement.height;
    canvasCtx.drawImage(img, x - size/2, y - size/2, size, size);
}
