/**
 * MENTRON Particle Burst Effect
 * Three.js WebGL particle sphere with scroll-driven explosion
 */

(function () {
    'use strict';

    // ============================================
    // CONFIG
    // ============================================

    // Detect mobile devices for performance optimization
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;

    const CONFIG = {
        // Reduce particles on mobile for better performance
        particleCount: isMobile ? 3000 : 10000,
        sphereRadius: isMobile ? 20 : 25,

        // Gold/beige color palette
        colors: [
            0xc4a35a, // Rich gold
            0xb8a06a, // Golden beige
            0xd4b86a, // Light gold
            0xa08040, // Dark gold
            0xe8d4a0  // Cream gold
        ],

        // Background colors
        bgLight: 0xf5f2eb,
        bgDark: 0x0a0a0a,

        // Explosion settings
        explosionRadius: isMobile ? 300 : 400,

        // Scroll thresholds (match cinematic.js)
        burstStart: 0.15,
        burstComplete: 0.45
    };

    // ============================================
    // STATE
    // ============================================
    let scene, camera, renderer, particles, geometry;
    let originalPositions = [];
    let explosionPositions = [];
    let burstProgress = 0;
    let clock;
    let burstTextElement = null;
    let mentronHighlight = null;
    let revealItems = [];
    let sectionMentron = null;
    let textInPosition = false;
    let hasExitedSection = false; // Track when we've scrolled past the MENTRON section

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        const container = document.getElementById('particleCanvas');
        if (!container) {
            console.error('Particle canvas container not found');
            return;
        }

        // Get the burst text element
        burstTextElement = document.getElementById('burstText');

        // Get reveal elements
        mentronHighlight = document.getElementById('mentronHighlight');
        sectionMentron = document.getElementById('sectionMentron');
        revealItems = document.querySelectorAll('.reveal-item');

        clock = new THREE.Clock();

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.bgLight);

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 80;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Create particles
        createParticles();

        // Setup scroll animation with GSAP
        setupScrollAnimation();

        // Start render loop
        animate();

        // Resize handler
        window.addEventListener('resize', onWindowResize);

        console.log('✓ Particle Burst initialized');
    }

    // ============================================
    // CREATE PARTICLES
    // ============================================
    function createParticles() {
        geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const baseRadius = CONFIG.sphereRadius;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            // Add roughness
            let r = baseRadius;
            if (Math.random() > 0.85) {
                r = baseRadius * Math.random();
            } else {
                r = baseRadius + (Math.random() - 0.5) * 3;
            }

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);
            originalPositions.push(x, y, z);

            // Random color from palette
            const colorHex = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            const color = new THREE.Color(colorHex);
            colors.push(color.r, color.g, color.b);

            // Explosion positions
            const burstMultiplier = 0.3 + Math.random() * 1.5;
            const explodeR = (CONFIG.explosionRadius + Math.random() * 200) * burstMultiplier;

            const ex = (x / r) * explodeR;
            const ey = (y / r) * explodeR;
            const ez = (z / r) * explodeR;

            explosionPositions.push(ex, ey, ez);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            sizeAttenuation: true
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Start systems
        setupScrollAnimation();
        animate();
    }

    // ============================================
    // SCROLL ANIMATION
    // ============================================
    function setupScrollAnimation() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP/ScrollTrigger not loaded, using fallback scroll');
            window.addEventListener('scroll', fallbackScroll, { passive: true });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Burst animation timeline (hero section)
        gsap.to({}, {
            scrollTrigger: {
                trigger: ".hero-scene",
                start: "top top",
                end: "bottom top",
                scrub: 1.5,
                onUpdate: (self) => {
                    burstProgress = self.progress;
                    updateParticles();
                    updateBackground();
                    updateBurstText();
                }
            }
        });

        // Track when we exit the first content section - hide the text
        if (sectionMentron) {
            ScrollTrigger.create({
                trigger: sectionMentron,
                start: "bottom center",
                end: "bottom top",
                onEnter: () => {
                    // Section is leaving viewport - fade out the text
                    hasExitedSection = true;
                    if (burstTextElement) {
                        burstTextElement.style.opacity = '0';
                    }
                },
                onLeaveBack: () => {
                    // Scrolling back up - show the text again
                    hasExitedSection = false;
                    if (burstTextElement && textInPosition) {
                        burstTextElement.style.opacity = '1';
                    }
                }
            });

            // GSAP Reveal Removed for Stability
        }
    }

    function fallbackScroll() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const progress = scrollY / viewportHeight;

        // Map scroll to burst progress
        if (progress >= CONFIG.burstStart && progress < CONFIG.burstComplete) {
            burstProgress = (progress - CONFIG.burstStart) / (CONFIG.burstComplete - CONFIG.burstStart);
        } else if (progress >= CONFIG.burstComplete) {
            burstProgress = 1;
        } else {
            burstProgress = 0;
        }

        updateParticles();
        updateBackground();
        updateBurstText();
    }

    // ============================================
    // UPDATE FUNCTIONS
    // ============================================
    function updateParticles() {
        if (!particles) return;

        const positions = particles.geometry.attributes.position.array;

        // Smooth easing for burst
        const easedP = 1 - Math.pow(1 - burstProgress, 3);

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            const ex = explosionPositions[ix];
            const ey = explosionPositions[iy];
            const ez = explosionPositions[iz];

            // Lerp between original and explosion
            positions[ix] = ox + (ex - ox) * easedP;
            positions[iy] = oy + (ey - oy) * easedP;
            positions[iz] = oz + (ez - oz) * easedP;
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    function updateBackground() {
        if (!scene || !scene.background) return;

        const lightColor = new THREE.Color(CONFIG.bgLight);
        const darkColor = new THREE.Color(CONFIG.bgDark);

        scene.background.lerpColors(lightColor, darkColor, burstProgress);
    }

    function updateBurstText() {
        if (!burstTextElement) return;

        // If we've scrolled past the section, don't update opacity here
        // The ScrollTrigger will handle it
        if (hasExitedSection) return;

        // Text starts appearing around 30% burst progress
        // Fully visible by 50% burst progress
        const textStartThreshold = 0.3;
        const textEndThreshold = 0.5;

        // Position animation thresholds
        const positionStartThreshold = 0.4; // Start moving to top
        const positionEndThreshold = 0.7;   // Fully at top
        const inPositionThreshold = 0.65;   // When to trigger reveal items

        let textOpacity = 0;
        if (burstProgress > textStartThreshold) {
            textOpacity = Math.min(1, (burstProgress - textStartThreshold) / (textEndThreshold - textStartThreshold));
        }

        // Apply eased opacity for smooth fade
        const easedOpacity = 1 - Math.pow(1 - textOpacity, 2);
        burstTextElement.style.opacity = easedOpacity;

        // Toggle color class based on background darkness
        if (burstProgress > 0.45) {
            burstTextElement.classList.add('on-dark');
        } else {
            burstTextElement.classList.remove('on-dark');
        }

        // Smooth position animation from center to top
        if (burstProgress >= positionStartThreshold) {
            // Calculate how far through the position animation we are (0 to 1)
            const positionProgress = Math.min(1, (burstProgress - positionStartThreshold) / (positionEndThreshold - positionStartThreshold));
            const easedPositionProgress = 1 - Math.pow(1 - positionProgress, 3); // Ease out cubic

            // Interpolate from center (50%) to top (120px)
            // Using viewport height for calculation
            const centerTop = window.innerHeight * 0.5;
            const targetTop = 120;
            const currentTop = centerTop - (centerTop - targetTop) * easedPositionProgress;

            // Interpolate scale from 1.0 to 0.7
            const startScale = 1.0;
            const endScale = 0.7;
            const currentScale = startScale - (startScale - endScale) * easedPositionProgress;

            burstTextElement.style.top = `${currentTop}px`;
            burstTextElement.style.left = '50%';
            burstTextElement.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

            // Trigger in-position state and reveal items
            if (burstProgress >= inPositionThreshold && !textInPosition) {
                burstTextElement.classList.add('in-position');

                // Hide the static MENTRON in the title if it exists
                if (mentronHighlight) {
                    mentronHighlight.classList.add('hidden');
                }

                textInPosition = true;

                // Manual Fallback Removed
            }
        } else {
            // Standard center animation before position animation starts
            const scale = 0.9 + (easedOpacity * 0.1);
            burstTextElement.style.top = '50%';
            burstTextElement.style.left = '50%';
            burstTextElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
        }

        // Reset state when scrolling back up past the position start
        if (burstProgress < positionStartThreshold && textInPosition) {
            burstTextElement.classList.remove('in-position');

            // Show the static MENTRON again
            if (mentronHighlight) {
                mentronHighlight.classList.remove('hidden');
            }

            textInPosition = false;
        }
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================
    function animate() {
        requestAnimationFrame(animate);

        if (particles) {
            // Gentle rotation (slower when exploded)
            const rotationSpeed = 0.002 * (1 - burstProgress * 0.8);
            particles.rotation.y += rotationSpeed;
            particles.rotation.x += rotationSpeed * 0.3;
        }

        renderer.render(scene, camera);
    }

    // ============================================
    // RESIZE
    // ============================================
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ============================================
    // INIT ON LOAD
    // ============================================
    window.addEventListener('load', function () {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }
        init();
    });

})();
