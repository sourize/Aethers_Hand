import './style.css'
import { SceneManager } from './src/scene/SceneManager.js'
import { HandTracker } from './src/input/HandTracker.js'
import { ParticleSystem } from './src/particles/ParticleSystem.js'

document.querySelector('#app').innerHTML = `
  <canvas id="canvas"></canvas>
  <div id="loading">Loading AI Model...</div>
  <video id="video" playsinline style="display:none;"></video>
`

const init = async () => {
    try {
        const sceneManager = new SceneManager();
        const particleSystem = new ParticleSystem(sceneManager.scene);
        const handTracker = new HandTracker();

        // Initial Active State
        sceneManager.add(particleSystem);

        const updateActiveButton = (shapeName) => {
            document.querySelectorAll('button[data-shape]').forEach(btn => {
                if (btn.dataset.shape === shapeName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        // Listen to updates
        particleSystem.onShapeChange = updateActiveButton;
        updateActiveButton('sphere'); // Default

        // UI Bindings
        document.querySelectorAll('button[data-shape]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = e.target.dataset.shape;
                particleSystem.setShape(shape);
            });
        });

        // Particle Count Slider
        const slider = document.getElementById('particleCount');
        const countLabel = document.getElementById('countValue');

        slider.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            countLabel.innerText = val;
            particleSystem.resize(val);
        });

        slider.addEventListener('input', (e) => {
            countLabel.innerText = e.target.value;
        });

        // Start Animation Loop Immediately
        const animate = () => {
            requestAnimationFrame(animate);
            particleSystem.update();
            sceneManager.render();
        }
        animate();

        // Start Hand Tracking ASYNC
        handTracker.start((result) => {
            // Update status
            const status = document.getElementById('status');
            if (result.landmarks && result.landmarks.length > 0) {
                status.innerText = "Hand Detected ✅";
                status.style.color = "#4ade80";
            } else {
                status.innerText = "Searching for hand... 🔍";
                status.style.color = "#fbbf24";
            }
            particleSystem.updateInteraction(result);
        }).then(() => {
            document.getElementById('loading').style.display = 'none';
        }).catch(err => {
            console.error("Hand Tracking failed:", err);
            document.getElementById('status').innerText = "Camera Error ❌";
            document.getElementById('loading').style.display = 'none';
        });

    } catch (error) {
        console.error("Initialization failed:", error);
        document.getElementById('loading').innerText = "Error initializing. Check console.";
    }
}

init();
