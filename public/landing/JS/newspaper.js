/**
 * ============================================
 * NEWSPAPER.JS - THE CHRONICLE
 * Modern Neo-Brutalist Editorial Experience
 * Inspired by istevit.in
 * ============================================
 */

(function () {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        preloaderDuration: 2000,
        scrollThreshold: 50,
        animationDuration: 0.8,
        staggerDelay: 0.1
    };

    // ==========================================
    // STATE
    // ==========================================
    const state = {
        isLoaded: false,
        menuOpen: false,
        scrollPosition: 0
    };

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    let elements = {};

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        cacheElements();
        initPreloader();
        initNavigation();
        initScrollEffects();
        initAnimations();
        initEventListeners();

        console.log('📰 THE CHRONICLE initialized');
    }

    // ==========================================
    // CACHE DOM ELEMENTS
    // ==========================================
    function cacheElements() {
        elements = {
            preloader: document.getElementById('preloader'),
            navBar: document.querySelector('.nav-bar'),
            menuBtn: document.getElementById('menuBtn'),
            mobileMenu: document.getElementById('mobileMenu'),
            mobileLinks: document.querySelectorAll('.mobile-link'),
            heroSection: document.querySelector('.hero'),
            sections: document.querySelectorAll('section'),
            storyCards: document.querySelectorAll('.story-card'),
            eventItems: document.querySelectorAll('.event-item'),
            marqueeTrack: document.querySelectorAll('.marquee-track')
        };
    }

    // ==========================================
    // PRELOADER
    // ==========================================
    function initPreloader() {
        // Wait for page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.preloader) {
                    elements.preloader.classList.add('hidden');
                }
                state.isLoaded = true;

                // Trigger entrance animations after preloader
                triggerEntranceAnimations();
            }, CONFIG.preloaderDuration);
        });
    }

    // ==========================================
    // NAVIGATION
    // ==========================================
    function initNavigation() {
        // Mobile menu toggle
        if (elements.menuBtn) {
            elements.menuBtn.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu on link click
        elements.mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const navHeight = elements.navBar ? elements.navBar.offsetHeight : 0;
                    const targetPosition = targetElement.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    function toggleMobileMenu() {
        state.menuOpen = !state.menuOpen;

        if (elements.menuBtn) {
            elements.menuBtn.classList.toggle('active', state.menuOpen);
        }

        if (elements.mobileMenu) {
            elements.mobileMenu.classList.toggle('active', state.menuOpen);
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = state.menuOpen ? 'hidden' : '';
    }

    function closeMobileMenu() {
        state.menuOpen = false;

        if (elements.menuBtn) {
            elements.menuBtn.classList.remove('active');
        }

        if (elements.mobileMenu) {
            elements.mobileMenu.classList.remove('active');
        }

        document.body.style.overflow = '';
    }

    // ==========================================
    // SCROLL EFFECTS
    // ==========================================
    function initScrollEffects() {
        // Register GSAP ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Navbar scroll effect
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            state.scrollPosition = window.scrollY;

            // Add scrolled class to nav
            if (elements.navBar) {
                elements.navBar.classList.toggle('scrolled', state.scrollPosition > CONFIG.scrollThreshold);
            }

            lastScrollTop = state.scrollPosition;
        }, { passive: true });
    }

    // ==========================================
    // GSAP ANIMATIONS
    // ==========================================
    function initAnimations() {
        // Animate sections on scroll
        elements.sections.forEach(section => {
            // Background text parallax
            const bgText = section.querySelector('.section-bg-text');
            if (bgText) {
                gsap.to(bgText, {
                    yPercent: -30,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            }
        });

        // Story cards animation
        elements.storyCards.forEach((card, index) => {
            gsap.from(card, {
                opacity: 0,
                y: 50,
                duration: CONFIG.animationDuration,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                delay: (index % 2) * CONFIG.staggerDelay
            });
        });

        // Event items animation
        elements.eventItems.forEach((item, index) => {
            gsap.from(item, {
                opacity: 0,
                x: -30,
                duration: CONFIG.animationDuration,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                delay: index * CONFIG.staggerDelay
            });
        });

        // About section animation
        const aboutSection = document.querySelector('.about-section');
        if (aboutSection) {
            const aboutLeft = aboutSection.querySelector('.about-left');
            const aboutRight = aboutSection.querySelector('.about-right');

            if (aboutLeft) {
                gsap.from(aboutLeft, {
                    opacity: 0,
                    x: -50,
                    duration: 1,
                    scrollTrigger: {
                        trigger: aboutSection,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                });
            }

            if (aboutRight) {
                gsap.from(aboutRight, {
                    opacity: 0,
                    x: 50,
                    duration: 1,
                    scrollTrigger: {
                        trigger: aboutSection,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    },
                    delay: 0.2
                });
            }
        }

        // Stats counter animation
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/\D/g, ''));
            const suffix = finalValue.replace(/[0-9]/g, '');

            gsap.from(stat, {
                textContent: 0,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                snap: { textContent: 1 },
                onUpdate: function () {
                    stat.textContent = Math.floor(this.targets()[0].textContent) + suffix;
                }
            });
        });

        // Newsletter section animation
        const newsletterSection = document.querySelector('.newsletter-section');
        if (newsletterSection) {
            gsap.from(newsletterSection.querySelector('.newsletter-content'), {
                opacity: 0,
                y: 50,
                scale: 0.95,
                duration: 1,
                scrollTrigger: {
                    trigger: newsletterSection,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    // ==========================================
    // ENTRANCE ANIMATIONS
    // ==========================================
    function triggerEntranceAnimations() {
        // Hero background text
        const heroBgText = document.querySelector('.hero-bg-text');
        if (heroBgText) {
            gsap.from(heroBgText, {
                opacity: 0,
                scale: 0.8,
                duration: 1.5,
                ease: 'power3.out'
            });
        }
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function initEventListeners() {
        // Story card hover effects
        elements.storyCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.01,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Form submission
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = newsletterForm.querySelector('.newsletter-input');
                if (input && input.value) {
                    // Animate success
                    gsap.to(newsletterForm, {
                        scale: 1.02,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            alert('Thanks for subscribing!');
                            input.value = '';
                        }
                    });
                }
            });
        }

        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.menuOpen) {
                closeMobileMenu();
            }
        });
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ==========================================
    // EXPOSE PUBLIC API
    // ==========================================
    window.Chronicle = {
        init,
        toggleMobileMenu,
        getState: () => ({ ...state })
    };

    // ==========================================
    // AUTO-INITIALIZE
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
