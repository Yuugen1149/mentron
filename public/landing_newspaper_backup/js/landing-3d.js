// ============================================
// MENTRON NEWSPAPER LANDING PAGE
// 3D Page Flip Animation with GSAP
// ============================================

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

// Audio Context (Placeholder for sound effects)
let isMuted = true;

function playFlipSound() {
    if (isMuted) return;
    // Sound implementation placeholder
    console.log("Page flip sound...");
}

// Sound toggle handler
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.style.opacity = isMuted ? '0.4' : '1';
    });
}

// Initial Setup
gsap.set(container, { perspective: config.perspective });

// Ensure z-index is correct (Page 1 on top, Page 3 at bottom)
pages.forEach((page, i) => {
    page.style.zIndex = pages.length - i;
});

// ============================================
// SCROLL ANIMATION LOGIC
// ============================================

// Create a timeline that spans the scroll distance
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "#newspaper-container",
        pin: true,
        start: "top top",
        end: () => `+=${pages.length * 100}%`,
        scrub: 1,
        onUpdate: (self) => updatePageIndicator(self.progress)
    }
});

// Animate each page (except the last one which stays)
pages.forEach((page, i) => {
    if (i === pages.length - 1) return;

    // Page flip animation
    tl.to(page, {
        rotationX: -110,
        z: -150,
        y: -120,
        opacity: 0,
        transformOrigin: "top center",
        ease: "power2.inOut",
        duration: 1,
        onStart: () => {
            playFlipSound();
            // Add shadow to the next page
            const nextPage = pages[i + 1];
            if (nextPage) {
                gsap.to(nextPage.querySelector('.page-shadow'), {
                    opacity: 0.4,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1
                });
            }
        }
    }, i * 1);

    // Shadow animation for current page
    tl.to(page.querySelector('.page-shadow'), {
        opacity: 0.8,
        duration: 0.5,
        ease: "power1.in"
    }, i * 1);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function updatePageIndicator(progress) {
    const totalFlips = pages.length - 1;
    const exactPage = 1 + (progress * totalFlips);
    const roundedPage = Math.min(Math.round(exactPage), pages.length);

    if (pageIndicator) {
        pageIndicator.innerText = `Page ${roundedPage} of ${pages.length}`;
    }
}

// ============================================
// INTERACTIVE ELEMENTS
// ============================================

const cuttings = document.querySelectorAll('.cutting');

cuttings.forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(el, {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    el.addEventListener('click', () => {
        const headline = el.querySelector('h2, h3, h4');
        if (headline) {
            console.log(`Clicked article: ${headline.innerText}`);
        }
    });
});

// ============================================
// BUTTON INTERACTIONS
// ============================================

const ctaButtons = document.querySelectorAll('.news-btn, .news-btn-lg');

ctaButtons.forEach(btn => {
    const originalText = btn.textContent;

    btn.addEventListener('click', (e) => {
        const href = btn.closest('a')?.href;

        // If it's the subscribe button, animate
        if (btn.classList.contains('news-btn-lg') && btn.textContent.includes('SUBSCRIBE')) {
            e.preventDefault();
            btn.textContent = 'COMING SOON!';
            btn.style.background = 'var(--ink-accent)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }

        // If it's apply now, redirect to login
        if (btn.textContent.includes('APPLY NOW') || btn.textContent.includes('GET STARTED')) {
            window.location.href = '/login';
        }
    });
});

// ============================================
// RESIZE HANDLER
// ============================================

window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// ============================================
// INITIAL ANIMATION
// ============================================

gsap.from('.page', {
    opacity: 0,
    scale: 0.95,
    duration: 1,
    ease: "power3.out",
    stagger: 0.1
});

gsap.from('.edition-info', {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.5,
    ease: "power3.out"
});

gsap.from('.sound-control', {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    delay: 0.8,
    ease: "back.out(1.7)"
});
