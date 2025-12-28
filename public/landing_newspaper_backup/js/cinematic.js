/**
 * MENTRON Cinematic Landing Page
 * Hero → Scroll → Header flows up → Scroll back → Header hides
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        headerAppear: 0.35,    // 35% - header appears
        headerLock: 0.65,      // 65% - header locks to top
        themeSwitch: 0.4       // 40% - theme inverts to dark
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        body: document.body,
        floatingHeader: document.getElementById('floatingHeader'),
        heroContent: document.getElementById('heroContent'),
        scrollIndicator: document.getElementById('scrollIndicator')
    };

    // ============================================
    // SCROLL HANDLER
    // ============================================
    function handleScroll() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const progress = scrollY / viewportHeight;

        // --- THEME SWITCH ---
        if (progress >= CONFIG.themeSwitch) {
            elements.body.classList.add('theme-dark');
        } else {
            elements.body.classList.remove('theme-dark');
        }

        // --- SCROLL INDICATOR ---
        if (progress > 0.05) {
            elements.scrollIndicator.classList.add('hidden');
        } else {
            elements.scrollIndicator.classList.remove('hidden');
        }

        // --- FLOATING HEADER ---
        // Show header when scrolling past threshold
        if (progress >= CONFIG.headerAppear) {
            elements.floatingHeader.classList.add('visible');
        } else {
            // Hide header when scrolling back up
            elements.floatingHeader.classList.remove('visible');
            elements.floatingHeader.classList.remove('locked');
        }

        // Lock header to top when scrolling further
        if (progress >= CONFIG.headerLock) {
            elements.floatingHeader.classList.add('locked');
        } else {
            elements.floatingHeader.classList.remove('locked');
        }

        // --- HERO CONTENT FADE ---
        if (progress > 0.5) {
            elements.heroContent.style.opacity = Math.max(0, 1 - (progress - 0.5) * 2);
        } else {
            elements.heroContent.style.opacity = 1;
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.body.classList.add('theme-dark');
            elements.floatingHeader.classList.add('visible', 'locked');
            elements.scrollIndicator.classList.add('hidden');
            return;
        }

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        console.log('✓ Mentron Cinematic initialized');
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
