/**
 * Shutter Transition Effect
 * Animate a vertical bar expanding horizontally to reveal the next section
 */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        const checkGsap = setInterval(() => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                clearInterval(checkGsap);
                initShutterTransition();
            }
        }, 100);
        return;
    }

    // Initialize if GSAP is ready
    initShutterTransition();
});

function initShutterTransition() {
    gsap.registerPlugin(ScrollTrigger);

    const sectionMentron = document.getElementById('sectionMentron');
    const shutterBar = document.querySelector('.shutter-bar');
    const transitionShutter = document.getElementById('transitionShutter');
    const sectionImpact = document.getElementById('sectionImpact');

    if (!sectionMentron || !shutterBar || !sectionImpact) {
        console.warn('Shutter transition elements not found');
        return;
    }

    // Create a timeline for the transition
    const shutterTl = gsap.timeline({
        scrollTrigger: {
            trigger: sectionMentron,
            start: "top top", // Pin when section hits top
            end: "+=250%", // Pin for 2.5x screen height (allow time for cards + shutter)
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    // Select cards
    const cards = document.querySelectorAll('.mission-card');

    shutterTl
        // Step 0: Ensure shutter is hidden initially but enabled
        .set(transitionShutter, { autoAlpha: 1 })

        // Step 1: Reveal Cards Sequence
        // Explicitly set initial state to match CSS (safety check)
        .set(cards, { opacity: 0, y: 50 })
        .to(cards, {
            y: 0,
            opacity: 1,
            duration: 2,
            stagger: 0.3,
            ease: "power2.out"
        })

        // Step 2: Hold/Delay (Let user read the fully revealed cards)
        .to({}, { duration: 1 })

        // Step 3: Shutter Transition Starts
        // Bar appears
        .to(shutterBar, {
            scaleX: 1,
            duration: 0.5,
            backgroundColor: '#FFD700' // Gold highlight
        })

        // Expand to fill screen
        .to(shutterBar, {
            scaleX: 1000,
            duration: 1.5,
            ease: "power2.inOut",
            backgroundColor: '#f5f2eb' // Fade to Beige (var(--bg-light))
        });

    // Improve smoothness
    ScrollTrigger.refresh();
}
