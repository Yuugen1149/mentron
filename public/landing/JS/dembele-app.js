```javascript
// We assume THREE, GSAP and ScrollTrigger are loaded via CDN in HTML
// No ES module imports to avoid CORS on file:// protocol

// Config
const CONFIG = {
    particleCount: 15000, // increased for density
    bgLight: new THREE.Color('#F5F5F0'), // creamy white
    bgDark: new THREE.Color('#0a0a0a'),
    // Palette: Bright Gold, Deep Gold, White (glint)
    colors: [
        new THREE.Color('#FFD700'), // Gold
        new THREE.Color('#DAA520'), // GoldenRod
        new THREE.Color('#F0E68C'), // Khaki
        new THREE.Color('#FFFFFF')  // White highlight
    ]
};

// State
let scene, camera, renderer, particles, geometry;
let originalPositions = [];
let explosionPositions = [];

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = CONFIG.bgLight; // Start Light

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = -5; // Slightly lower to keep ball centered high but reachable

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('dembele-canvas').appendChild(renderer.domElement);

    // 2. Create Particles (We'll use a sphere approximation if font loading is too complex for this demo, 
    // but let's try a procedural text-like distribution or just a sphere that explodes first)
    // For specific text without loading a font file, we can use a canvas text measuring trick or just a defined shape.
    // Let's stick to a procedural cloud that LOOKS like a dense object first.
    createParticles();

    // 3. Animation Loop
    animate();

    // 4. Scroll Triggers
    setupScrollAnimation();

    // Resize
    window.addEventListener('resize', onWindowResize);
}

function createParticles() {
    geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    // Create a "Rough Sphere" (like a pyrite nugget or textured gold ball)
    const baseRadius = 28;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        // Spherical distribution with surface noise
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        // Add "roughness" - some particles deeper, some outer, creating volume/texture
        // 90% near surface, 10% volume fill for density
        let r = baseRadius;
        const randomness = Math.random();
        
        if (randomness > 0.9) {
            // Internal sparkle (volume)
            r = baseRadius * Math.random(); 
        } else {
            // Surface rough (crust)
            r = baseRadius + (Math.random() - 0.5) * 2; 
        }

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions.push(x, y, z);
        originalPositions.push(x, y, z);
        
        // Colors: Pick a random gold shade from palette
        const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        colors.push(color.r, color.g, color.b);

        // Explosion: Radial burst
        const explodeR = 300 + Math.random() * 500;
        // Direction is normalized position * large radius
        const ex = (x / r) * explodeR;
        const ey = (y / r) * explodeR;
        const ez = (z / r) * explodeR;

        explosionPositions.push(ex, ey, ez);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.35, // Smaller, finer particles
        vertexColors: true, // Use our custom gold palette
        transparent: true,
        opacity: 0.9,
        blending: THREE.NormalBlending // Normal looks more "solid", Additive looks "holographic"
        // Let's stick to default blending or maybe additive if it's too dark. 
        // For a solid gold ball, normal blending usually looks better than additive ghostliness.
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function setupScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    // Timeline for the explosion
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-spacer",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Smooth interaction
            onUpdate: (self) => {
                // Interpolate Background Color
                // We do this manually because Three.js color interpolation in GSAP can be tricky without the plugin sometimes
                scene.background.lerpColors(CONFIG.bgLight, CONFIG.bgDark, self.progress);

                // Also update HTML body bg for consistency if canvas has transparency issues
                // but here canvas covers all.
            }
        }
    });

    // Animate Particles Positions
    // We can't query DOM elements for particles, so we animate a progress object and update the geometry
    const progress = { value: 0 };

    tl.to(progress, {
        value: 1,
        ease: "power2.inOut",
        onUpdate: () => {
            const posAttribute = particles.geometry.attributes.position;
            const p = progress.value;

            for (let i = 0; i < CONFIG.particleCount; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                // Lerp between original and explosion
                const ox = originalPositions[ix];
                const oy = originalPositions[iy];
                const oz = originalPositions[iz];

                const ex = explosionPositions[ix];
                const ey = explosionPositions[iy];
                const ez = explosionPositions[iz];

                posAttribute.array[ix] = ox + (ex - ox) * p;
                posAttribute.array[iy] = oy + (ey - oy) * p;
                posAttribute.array[iz] = oz + (ez - oz) * p;
            }
            posAttribute.needsUpdate = true;

            // Fade out intro text
            const introText = document.querySelector('.intro-text-layer');
            if (introText) {
                introText.style.opacity = 1 - p * 2; // Fade out quickly
                introText.style.display = p > 0.5 ? 'none' : 'block';
            }

            // Fade in Dark Content
            const darkContent = document.querySelector('.dark-content');
            if (darkContent) {
                darkContent.style.opacity = (p - 0.5) * 2; // Start showing halfway through
            }
        }
    });
}

    // Mouse State
    const mouse = new THREE.Vector2(-1000, -1000); // Start off-screen
    const targetMouse = new THREE.Vector2(-1000, -1000);
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        // Normalize mouse to -1 to 1 range
        targetMouse.x = (event.clientX - windowHalfX) * 0.1; // Scale down for scene units roughly
        targetMouse.y = (event.clientY - windowHalfY) * 0.1;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth mouse movement
        mouse.x += (targetMouse.x - mouse.x) * 0.1;
        mouse.y += (targetMouse.y - mouse.y) * 0.1;

        if (particles) {
            // 1. Base Rotation
            particles.rotation.y += 0.002;
            particles.rotation.x += 0.001;
            
            // 2. Interactive "Magnet/Bulge" Effect
            // We need to apply deformation based on mouse position.
            // Since the object rotates, we must transform the mouse position into the object's LOCAL space
            // so the "bulge" stays under the mouse cursor while the particles rotate through it.
            
            // Calculate Mouse in Local Space
            // Inverse rotation of the object
            // Just undoing the Y rotation roughly is enough for the visual effect usually, 
            // but let's be precise if we want it to feel "stuck" to the mouse.
            
            // Actually, simpler approach for this specific "Protrude" effect:
            // We modify the positions buffer.
            
            const positions = particles.geometry.attributes.position.array;
            
            // Get local mouse pos (approximate projection to z=0 plane of the ball)
            // The ball is at 0,0,0 usually? No, camera is at -5.
            // Let's assume mouse maps to x,y at the ball's depth.
            // Mouse X/Y are in view coords.
            
            // We need to rotate the "interaction zone" opposite to the sphere rotation
            const cosRy = Math.cos(-particles.rotation.y);
            const sinRy = Math.sin(-particles.rotation.y);
            const cosRx = Math.cos(-particles.rotation.x);
            const sinRx = Math.sin(-particles.rotation.x);

            // Rotate mouse coord to match the rotating frame? 
            // Better: Iterate original points, apply rotation, check distance? TOO EXPENSIVE (15k sqrts).
            
            // Optimization: Just check distance in 2D (X,Y) ignore Z for the trigger, 
            // but apply force in 3D?
            // Or only iterate a subset?
            
            // Let's try a performant approach:
            // We only need to deform `originalPositions` + `offset`.
            // But we need to write to `positions`.
            // And `positions` are being rendered with line/point matrix applied.
            
            // Wait, if we modify `positions` array, it rotates with the object.
            // So if we pull a point out, it will rotate away from the mouse.
            // We want it to "bulge" at the mouse.
            // This implies the bulge must be dynamic.
            
            // Let's transform the mouse vector into Local Space.
            const localMouse = new THREE.Vector3(mouse.x, -mouse.y, 40); // 40 is roughly front of sphere (radius 30)
            localMouse.applyAxisAngle(new THREE.Vector3(1,0,0), -particles.rotation.x);
            localMouse.applyAxisAngle(new THREE.Vector3(0,1,0), -particles.rotation.y);

            const interactRadius = 15;
            const interactRadiusSq = interactRadius * interactRadius;

            for (let i = 0; i < CONFIG.particleCount; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                const ox = originalPositions[ix];
                const oy = originalPositions[iy];
                const oz = originalPositions[iz];

                // Distance from local mouse to original point
                const dx = ox - localMouse.x;
                const dy = oy - localMouse.y;
                const dz = oz - localMouse.z;
                
                const distSq = dx*dx + dy*dy + dz*dz;

                if (distSq < interactRadiusSq) {
                    // It's close! Bulge out.
                    // Calculate "Protrusion" vector.
                    // Radial from center (0,0,0) is just normalized (ox, oy, oz).
                    // Or attract to mouse? "Protrude out" -> Expand radius.
                    
                    const dist = Math.sqrt(distSq);
                    const factor = (1 - dist / interactRadius); // 1 at center, 0 at edge
                    const power = factor * factor * 12; // 12 units protrusion max

                    // Direction: Radial (Normal)
                    // We assume sphere is centered at 0,0,0
                    // Rough normalization (radius is ~25-30)
                    const len = Math.sqrt(ox*ox + oy*oy + oz*oz);
                    const nx = ox / len;
                    const ny = oy / len;
                    const nz = oz / len;

                    positions[ix] = ox + nx * power;
                    positions[iy] = oy + ny * power;
                    positions[iz] = oz + nz * power;
                } else {
                    // Reset to original (spring back instantly for now, or lerp if we had state)
                    positions[ix] = ox;
                    positions[iy] = oy;
                    positions[iz] = oz;
                }
            }
            particles.geometry.attributes.position.needsUpdate = true;
        }
        renderer.render(scene, camera);
    }

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start
init();
