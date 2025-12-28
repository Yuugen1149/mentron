// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Configuration
const config = {
    flipDuration: 1,
    perspective: 2000,
    shadowOpacity: 0.6
};

// DOM Elements
const container = document.getElementById('newspaper-container');
const pages = gsap.utils.toArray('.page');
const pageIndicator = document.getElementById('page-indicator');
const soundToggle = document.getElementById('sound-toggle');

// Audio Context (Mock implementation for "Optional sound effects")
let isMuted = false;
// In a real implementation, load audio buffers here.
// const flipSound = new Audio('assets/page-flip.mp3');

function playFlipSound() {
    if (isMuted) return;
    // console.log("Playing flip sound..."); // Placeholder
    // if (flipSound) { flipSound.currentTime = 0; flipSound.play(); }
}

soundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    soundToggle.style.opacity = isMuted ? '0.3' : '1';
});

// Initial Setup
gsap.set(container, { perspective: config.perspective });

// Ensure z-index is correct (Page 1 on top, Page 3 at bottom)
pages.forEach((page, i) => {
    page.style.zIndex = pages.length - i;
});

// --- SCROLL ANIMATION LOGIC ---

// Create a timeline that spans the scroll distance
// We want to pin the container and "flip" pages as we scroll down
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#newspaper-container",
        pin: true,
        start: "top top",
        end: () => `+=${pages.length * 100}%`, // Scroll distance relative to number of pages
        scrub: 1, // Smooth scrubbing
        onUpdate: (self) => updatePageIndicator(self.progress)
    }
});

// Animate each page (except the last one which doesn't need to flip away)
pages.forEach((page, i) => {
    if (i === pages.length - 1) return; // Last page stays

    // The animation for this specific page
    tl.to(page, {
        rotationX: -110, // Flip up and slightly past vertical to reveal next
        z: -100, // Move slightly back
        y: -100, // Move slightly up
        opacity: 0, // Fade out towards end of flip
        transformOrigin: "top center",
        ease: "power2.inOut",
        duration: 1,
        onStart: () => {
            playFlipSound();
            // Add shadow to the next page
            const nextPage = pages[i + 1];
            if(nextPage) {
                gsap.to(nextPage.querySelector('.page-shadow'), {
                    opacity: 0.4,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1
                });
            }
        },
        // Animate the shadow of current page for depth
    }, i * 1); // Stagger start times based on index
    
    // Add a shadow overlay animation to the current page as it flips
    tl.to(page.querySelector('.page-shadow'), {
        opacity: 1,
        duration: 0.5,
        ease: "power1.in"
    }, i * 1);
});

// --- HELPER FUNCTIONS ---

function updatePageIndicator(progress) {
    // Calculate current page based on progress (0 to 1)
    // 3 pages = 2 flips. 
    // Progress 0-0.5 = Page 1 flipping
    // Progress 0.5-1.0 = Page 2 flipping
    
    const totalFlips = pages.length - 1;
    let currentPage = Math.floor(progress * totalFlips) + 1;
    
    // Clamp
    if (currentPage > pages.length) currentPage = pages.length;
    
    // Visual adjustment: if progress is very close to end of a flip, show next page number
    // Actually, simple calculation is fine.
    
    // If progress is 0, we are on page 1.
    // If progress is 1, we are on page 3.
    // Re-calc:
    const exactPage = 1 + (progress * totalFlips);
    const roundedPage = Math.round(exactPage);
    
    pageIndicator.innerText = `Page ${roundedPage} of ${pages.length}`;
}

// --- INTERACTIVE ELEMENTS (HOVER LOGIC) ---
// Note: CSS handles most hover states, but we can add tilt or physics here if needed.
const cuttings = document.querySelectorAll('.cutting');

cuttings.forEach(el => {
    el.addEventListener('mouseenter', () => {
        // Optional: specific JS behavior on hover
    });
    
    el.addEventListener('click', () => {
        // Mock navigation or modal expansion
        const headline = el.querySelector('h2, h3, h4');
        if(headline) {
            console.log(`Clicked article: ${headline.innerText}`);
            // Could trigger a modal here
        }
    });
});

// Resize Handler to refresh ScrollTrigger
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});