const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let showMesh = true;
let activeFeatures = { eyes: null, nose: null, mouth: null };
let isLoaded = false;

// Preload your images (ensure they are in your GitHub /assets/ folder)
const eyeImg = new Image(); eyeImg.src = "assets/eye0.png";
const noseImg = new Image(); noseImg.src = "assets/nose0.png";
const mouthImg = new Image(); mouthImg.src = "assets/mouth0.png";

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw mirrored video
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            
            // 1. Draw Professional Wireframe
            if (showMesh) {
                // FACEMESH_TESSELATION is the "mesh" look you preferred
                drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, 
                              {color: '#00FF0070', lineWidth: 1});
            }

            // 2. Dynamic Feature Resizing
            if (activeFeatures.eyes) {
                // Distance between landmark 33 and 133 gives eye width
                let eyeWidth = getDistance(landmarks[33], landmarks[133]) * canvasElement.width * 2.5;
                drawFeature(eyeImg, landmarks[159], eyeWidth); // Left
                drawFeature(eyeImg, landmarks[386], eyeWidth); // Right
            }
            
            if (activeFeatures.nose) {
                // Distance between nostrils gives nose width
                let noseWidth = getDistance(landmarks[61], landmarks[291]) * canvasElement.width * 0.8;
                drawFeature(noseImg, landmarks[1], noseWidth);
            }
        }
    }
    canvasCtx.restore();
}

// Math helper to calculate size based on landmarks
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function drawFeature(img, landmark, size) {
    const x = landmark.x * canvasElement.width;
    const y = landmark.y * canvasElement.height;
    canvasCtx.drawImage(img, x - size/2, y - size/2, size, size);
}

// Initialization
const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

window.startAdvancedCamera = function() {
    const camera = new Camera(videoElement, {
        onFrame: async () => { await faceMesh.send({image: videoElement}); },
        width: 640, height: 480
    });
    camera.start();
    document.getElementById('start-btn').style.display = 'none';
};

window.toggleFeature = (f) => { if(f === 'mesh') showMesh = !showMesh; };
window.setOverlay = (t) => { activeFeatures[t] = !activeFeatures[t]; };
