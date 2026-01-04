import * as THREE from 'three';

export const Shapes = {
    sphere: (count, radius = 20) => {
        const positions = new Float32Array(count * 3);
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden Angle

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const r = Math.sqrt(1 - y * y); // radius at y

            const theta = phi * i; // golden angle increment

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            positions[i * 3] = x * radius;
            positions[i * 3 + 1] = y * radius;
            positions[i * 3 + 2] = z * radius;
        }
        return positions;
    },

    cube: (count, size = 20) => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * size;
            positions[i * 3 + 1] = (Math.random() - 0.5) * size;
            positions[i * 3 + 2] = (Math.random() - 0.5) * size;
        }
        return positions;
    },

    heart: (count, scale = 1) => {
        const positions = new Float32Array(count * 3);
        let i = 0;
        while (i < count) {
            // Heart Surface Parametric Equation
            // x = 16sin^3(t)
            // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
            // z = variation for volume

            // To make it a volume, we can use rejection sampling on the 3D implicit equation
            // (x^2 + 9/4y^2 + z^2 - 1)^3 - x^2z^3 - 9/80y^2z^3 <= 0

            const x = (Math.random() - 0.5) * 3;
            const y = (Math.random() - 0.5) * 3;
            const z = (Math.random() - 0.5) * 3; // Thinner z for better shape recognition

            // Normalize coordinates for the formula
            const px = x;
            const py = y;
            const pz = z;

            const a = px * px + (9 / 4) * py * py + pz * pz - 1;

            if (a * a * a - px * px * pz * pz * pz - (9 / 80) * py * py * pz * pz * pz <= 0) {
                positions[i * 3] = x * 15 * scale;
                positions[i * 3 + 1] = y * 15 * scale;
                positions[i * 3 + 2] = z * 15 * scale; // flatted
                i++;
            }
        }
        return positions;
    },

    flower: (count, scale = 5) => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const u = Math.random();
            const v = Math.random();

            const theta = 2 * Math.PI * u;
            const phi = v * Math.PI;

            // Rose / Rhodonea curve r = cos(k * theta)
            // 3D generalization
            const k = 4; // 4 petals
            const rEnv = 10 + 5 * Math.cos(k * theta) * Math.sin(phi);

            const r = rEnv * scale / 5;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    },

    saturn: (count, radius = 8) => {
        const positions = new Float32Array(count * 3);
        const planetRatio = 0.3; // 30% planet, 70% rings
        const planetCount = Math.floor(count * planetRatio);

        // Planet (Sphere)
        for (let i = 0; i < planetCount; i++) {
            const y = 1 - (i / (planetCount - 1)) * 2;
            const r = Math.sqrt(1 - y * y) * radius;
            const theta = Math.PI * (3 - Math.sqrt(5)) * i;

            positions[i * 3] = Math.cos(theta) * r;
            positions[i * 3 + 1] = y * radius;
            positions[i * 3 + 2] = Math.sin(theta) * r;
        }

        // Rings (Disc with gap)
        for (let i = planetCount; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Ring range: 1.5 to 3.0 radius
            const distance = radius * 1.6 + Math.random() * radius * 1.8;

            positions[i * 3] = Math.cos(angle) * distance;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Very thin
            positions[i * 3 + 2] = Math.sin(angle) * distance;

            // Tilt the ring for effect ?? No, keeping it flat is safer for now, rotate whole system
        }
        return positions;
    },

    fireworks: (count, radius = 30) => {
        // Starburst
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Random direction
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            // Random radius with pow to concentrate in center but have long tails
            const r = Math.pow(Math.random(), 3) * radius * 1.5;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }
};
