import * as THREE from 'three';
import { Shapes } from './Shapes.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.count = 20000; // 20k particles
        this.particles = new Float32Array(this.count * 3);

        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.count * 3);
        this.targets = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);

        // Initial Shape
        const sphere = Shapes.sphere(this.count, 20);
        this.setTargetPositions(sphere);

        // Copy initial to current
        for (let i = 0; i < this.count * 3; i++) {
            this.positions[i] = sphere[i];
            this.colors[i] = 1.0; // White/Mixed
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        // Material
        const textureLoader = new THREE.TextureLoader();
        // Create a simple circle texture programmatically or load one?
        // Standard circle sprite

        this.material = new THREE.PointsMaterial({
            size: 0.2, // Small size
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
            // map: texture... (optional for performance)
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.currentShapeIndex = 0;
        this.shapeNames = ['sphere', 'cube', 'heart', 'flower', 'saturn', 'fireworks'];

        // Interaction State
        this.hoverPoint = null;
        this.isPinching = false;

        // Rotation Control
        this.rotationVelocity = { x: 0, y: 0.002 }; // Initial slow spin
        this.targetRotationVelocity = { x: 0, y: 0.002 };
    }

    setTargetPositions(newPositions) {
        for (let i = 0; i < this.count * 3; i++) {
            this.targets[i] = newPositions[i] || 0;
        }
    }

    setShape(shapeName) {
        if (Shapes[shapeName]) {
            console.log("Switching to", shapeName);
            const newPos = Shapes[shapeName](this.count);
            this.setTargetPositions(newPos);

            // Custom Color Logic
            const colors = this.geometry.attributes.color.array;
            for (let i = 0; i < this.count; i++) {
                const i3 = i * 3;
                let r = 1, g = 1, b = 1;

                if (shapeName === 'heart') {
                    // Red/Pink
                    r = 1.0;
                    g = Math.random() * 0.2;
                    b = Math.random() * 0.4;
                } else if (shapeName === 'flower') {
                    // Rainbow based on position or index
                    const hue = (i / this.count) + Math.random() * 0.1;
                    const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
                    r = color.r; g = color.g; b = color.b;
                } else if (shapeName === 'saturn') {
                    // Gold Planet, Blue/White Rings
                    // We know planet is first 40% (approx see shape logic)
                    if (i < this.count * 0.4) {
                        r = 1.0; g = 0.8 + Math.random() * 0.2; b = 0.2; // Gold
                    } else {
                        r = 0.2; g = 0.9; b = 1.0; // Cyan/White
                    }
                } else if (shapeName === 'fireworks') {
                    // Random bright colors per particle
                    if (Math.random() > 0.1) {
                        const hue = Math.random();
                        const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
                        r = color.r; g = color.g; b = color.b;
                    } else {
                        r = 1; g = 1; b = 1;
                    }
                } else {
                    // Cool Blue/Cyber Default
                    r = 0.1;
                    g = 0.5 + Math.random() * 0.5;
                    b = 1.0;
                }

                colors[i3] = r;
                colors[i3 + 1] = g;
                colors[i3 + 2] = b;
            }
            this.geometry.attributes.color.needsUpdate = true;

            // Notify UI
            if (this.onShapeChange) {
                this.onShapeChange(shapeName);
            }
        }
    }

    resize(newCount) {
        this.count = newCount;
        this.scene.remove(this.points);
        this.geometry.dispose();

        this.particles = new Float32Array(this.count * 3);
        this.positions = new Float32Array(this.count * 3);
        this.targets = new Float32Array(this.count * 3);
        this.colors = new Float32Array(this.count * 3);

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        // Reset Shape
        this.setShape(this.shapeNames[this.currentShapeIndex]);
    }

    nextShape() {
        this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapeNames.length;
        this.setShape(this.shapeNames[this.currentShapeIndex]);
    }

    update() {
        const positions = this.geometry.attributes.position.array;

        // Interpolation speed
        const lerpFactor = 0.05;

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // Standard Lerp to target
            let tx = this.targets[i3];
            let ty = this.targets[i3 + 1];
            let tz = this.targets[i3 + 2];

            // Interaction: Repel/Attract
            let scaleFactor = 1.0;

            if (this.isPinching && this.currentPinchDist) {
                // Dynamic Expansion based on distance
                // pinchDist usually 0.0 ~ 0.2
                // Map 0.0 to 1.0, and 0.2 to 3.0+
                scaleFactor = 1.0 + (this.currentPinchDist * 15.0);
            }

            // Apply Scaling to Target
            tx *= scaleFactor;
            ty *= scaleFactor;
            tz *= scaleFactor;

            if (this.hoverPoint && !this.isPinching) {
                const dx = positions[i3] - this.hoverPoint.x;
                const dy = positions[i3] - this.hoverPoint.y;
                const dz = positions[i3] - this.hoverPoint.z;

                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);

                if (dist < 20) {
                    // Repel
                    let force = (20 - dist) / 20;

                    if (this.isPinching) {
                        // Stronger repel if pinching/spreading
                        force *= 1.0 + (this.currentPinchDist * 5.0);
                    }

                    tx += dx * force * 2;
                    ty += dy * force * 2;
                    tz += dz * force * 2;
                }
            }

            // Standard Lerp
            positions[i3] += (tx - positions[i3]) * lerpFactor;
            positions[i3 + 1] += (ty - positions[i3 + 1]) * lerpFactor;
            positions[i3 + 2] += (tz - positions[i3 + 2]) * lerpFactor;
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Smooth Rotation Control (Inertia)
        // Lerp current velocity to target
        this.rotationVelocity.x += (this.targetRotationVelocity.x - this.rotationVelocity.x) * 0.05;
        this.rotationVelocity.y += (this.targetRotationVelocity.y - this.rotationVelocity.y) * 0.05;

        this.points.rotation.x += this.rotationVelocity.x;
        this.points.rotation.y += this.rotationVelocity.y;

        // Add subtle wave noise to make it feel alive
        const time = Date.now() * 0.001;
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            // Sine wave based on simple unique offset
            const noise = Math.sin(time + positions[i3] * 0.05) * 0.02;
            positions[i3] += noise;
            positions[i3 + 1] += Math.cos(time + positions[i3 + 1] * 0.05) * 0.02;
            positions[i3 + 2] += Math.sin(time + positions[i3 + 2] * 0.05) * 0.02;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    updateInteraction(handResult) {
        if (handResult && handResult.landmarks && handResult.landmarks.length > 0) {

            // --- Two Hand Logic (Rotation) ---
            if (handResult.landmarks.length === 2) {
                const hand1 = handResult.landmarks[0][8]; // Index tip
                const hand2 = handResult.landmarks[1][8];

                // 1. Steering (Z-Rotation) based on angle
                const dx = hand1.x - hand2.x;
                const dy = hand1.y - hand2.y;
                const angle = Math.atan2(dy, dx);
                this.points.rotation.z = angle;

                // 2. Joystick (X/Y Rotation) based on Midpoint
                // Calculate midpoint of two hands
                const midX = (hand1.x + hand2.x) / 2;
                const midY = (hand1.y + hand2.y) / 2;

                // Map midpoint (0..1) to Speed (-0.05..0.05)
                // Center screen (0.5, 0.5) = 0 speed
                // Left (<0.5) = Rotate Left, Right (>0.5) = Rotate Right
                const speedX = (midX - 0.5) * 0.1; // Yaw (Y-axis rotation)
                const speedY = (midY - 0.5) * 0.1; // Pitch (X-axis rotation)

                // Update Target Velocity
                this.targetRotationVelocity.y = speedX;
                this.targetRotationVelocity.x = speedY;
            } else {
                // Return to auto-idle if 1 hand or no hands
                if (this.isPinching) {
                    this.targetRotationVelocity = { x: 0, y: 0 }; // Stop if pinching
                } else {
                    this.targetRotationVelocity = { x: 0, y: 0.002 }; // Idle spin
                }
            }

            // --- One Hand Logic ---
            const landmarks = handResult.landmarks[0];
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];

            // Map 0..1 to World Coordinates approx -50..50
            const x = (indexTip.x - 0.5) * -100;
            const y = (indexTip.y - 0.5) * -80;
            const z = 0;

            this.hoverPoint = { x, y, z };

            // Check Pinch
            const pdx = indexTip.x - thumbTip.x;
            const pdy = indexTip.y - thumbTip.y;
            const pinchDist = Math.sqrt(pdx * pdx + pdy * pdy);

            // Dynamic Pinch Tracking (Hysteresis)
            if (this.isPinching) {
                // While pinching, allow expansion up to 0.3
                if (pinchDist > 0.3) {
                    this.isPinching = false;
                    this.currentPinchDist = 0;
                    console.log("Pinch Broken (Too wide)");
                } else {
                    this.currentPinchDist = pinchDist;
                }
            } else {
                // Start pinch only if very close
                if (pinchDist < 0.06) {
                    this.isPinching = true;
                    this.currentPinchDist = pinchDist;
                    console.log("Pinch Started");
                }
            }

            // Threshold for pinch (Increased for easier activation)
            // if (pinchDist < 0.08) { ... old logic removed ... }

            // Open Palm Switch (Hold to Switch)
            const isOpen = this.isHandOpen(landmarks);

            // Visual Feedback Helper
            const statusDiv = document.getElementById('status');

            if (isOpen && !this.isPinching) {
                if (!this.openPalmStartTime) {
                    this.openPalmStartTime = Date.now();
                }

                const elapsed = Date.now() - this.openPalmStartTime;

                if (elapsed > 1000) { // Hold for 1 second
                    if (!this.openPalmDebounce) {
                        this.nextShape();
                        this.openPalmDebounce = true;
                        if (statusDiv) statusDiv.innerHTML = "✨ Shape Switched! ✨";

                        setTimeout(() => {
                            this.openPalmDebounce = false;
                            if (statusDiv) statusDiv.innerHTML = "Hand Detected ✅";
                        }, 3000);

                        this.openPalmStartTime = null;
                    }
                } else if (!this.openPalmDebounce) {
                    // Show Progress
                    const progress = Math.min(100, Math.floor((elapsed / 1000) * 100));
                    if (statusDiv) statusDiv.innerHTML = `Hold for Switch... ${progress}%`;
                }

            } else {
                // Reset if not holding
                this.openPalmStartTime = null;
                // Only reset text if we were holding and didn't just switch
                if (statusDiv && !this.openPalmDebounce && statusDiv.innerHTML.includes("Hold")) {
                    statusDiv.innerHTML = "Hand Detected ✅";
                }
            }

        } else {
            this.hoverPoint = null;
            this.isPinching = false;
        }
    }

    isHandOpen(landmarks) {
        // Check if fingertips are above (y less than) PIP joints for all 4 fingers?
        // Simple check: Tips higher than MP joints
        // 8 is tip, 6 is PIP. y(8) < y(6) means finger up (MediaPipe y is inverted? 0 is top)
        // Yes, 0 is top. So y(8) < y(6) is "up".

        // This logic depends on hand orientation.
        // Let's assume hand is upright.
        return (
            landmarks[8].y < landmarks[6].y &&
            landmarks[12].y < landmarks[10].y &&
            landmarks[16].y < landmarks[14].y &&
            landmarks[20].y < landmarks[18].y
        );
    }
}
