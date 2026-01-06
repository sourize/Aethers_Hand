# Aether's Hand ✋✨

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Engine](https://img.shields.io/badge/Engine-Three.js-black?logo=three.js)
![Vision](https://img.shields.io/badge/Vision-MediaPipe-blue?logo=google)
![Tooling](https://img.shields.io/badge/Tooling-Vite-646CFF?logo=vite&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

**Sculpt the void.** Aether's Hand is an immersive web experience where your gestures control a dynamic 3D nebula. Powered by Three.js and MediaPipe to turn your hands into real-time gravity wells.

## 🚀 Live Demo

[**Launch Experience**](https://aethershand.vercel.app)

> **Note**: For the best experience, use a Desktop device with a webcam. Mobile devices will show a "Desktop Only" warning to ensure performance.

## ✨ Features

- **Real-Time Hand Tracking**: Uses Google MediaPipe to track hand landmarks with high precision directly in the browser.
- **20,000+ Particles**: A performant particle system built with Three.js `BufferGeometry`.
- **Gesture Control System**:
    - **👆 Point**: Move the gravity well.
    - **🤏 Pinch (Dynamic)**: Pinch index & thumb to expand/explode the nebula. Spreading fingers intensifies the effect (Hysteresis-based).
    - **🕹️ Joystick Rotation**: Use two hands to steer and rotate the entire galaxy like a steering wheel.
    - **✋ Open Palm**: Hold for 1 second to cycle through different particle formations (Sphere, Cube, Heart, Saturn, etc.).

## 🛠️ Tech Stack

- **Engine**: [Three.js](https://threejs.org/) (WebGL)
- **Computer Vision**: [MediaPipe Hands](https://developers.google.com/mediapipe)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Hosting**: [Vercel](https://vercel.com/)

## 📦 Quick Start

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sourize/Aethers_Hand.git
    cd "Aether's Hand"
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
