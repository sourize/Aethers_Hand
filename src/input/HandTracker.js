import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class HandTracker {
    constructor() {
        this.video = document.getElementById('video');
        this.lastVideoTime = -1;
        this.results = undefined;
        this.handLandmarker = undefined;
    }

    async start(callback) {
        console.log("Initializing Hand Tracker...");

        try {
            // Load MediaPipe WASM files
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );

            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });

            console.log("HandLandmarker loaded.");

            // Start Camera
            await this.setupCamera();

            // Loop
            this.detectLoop(callback);

        } catch (error) {
            console.error("Error starting HandTracker:", error);
            throw error;
        }
    }

    async setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480
            }
        });

        this.video.srcObject = stream;

        return new Promise((resolve) => {
            this.video.onloadedmetadata = () => {
                this.video.play();
                resolve();
            };
        });
    }

    async detectLoop(callback) {
        // Run detection if video is playing
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;

            const results = this.handLandmarker.detectForVideo(this.video, performance.now());

            // Pass results to callback
            if (callback) {
                callback(results);
            }
        }

        requestAnimationFrame(() => this.detectLoop(callback));
    }
}
