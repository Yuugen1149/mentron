# ISTE 3D Magazine Landing Page

This module implements a visually stunning, interactive "Magazine/Newspaper" themed landing page using Three.js and GSAP.

## Files

- `HTML/landing-3d.html`: Main entry point.
- `CSS/landing-3d.css`: Print-media styled CSS with paper textures and typography.
- `JS/landing-3d.js`: Three.js scene featuring floating, procedurally generated magazine pages.

## Features

1.  **Immersive 3D Background**:

    - **Floating Pages**: Multiple 3D planes representing magazine pages float in the background.
    - **Procedural Textures**: Uses HTML5 Canvas to generate unique "paper" textures with noise and vignettes, as well as dynamic content layouts (headlines, text blocks) for each page. No external image files are required.
    - **Realistic Paper Feel**: Pages have slight curvature (vertex displacement) and react to lighting.

2.  **Interactive Elements**:

    - **Mouse Parallax**: Pages tilt and rotate subtly based on mouse movement, creating depth.
    - **Scroll Animation**: As the user scrolls, pages fly upwards at varying speeds (parallax) and rotate, simulating a "flow" of information.
    - **Mobile Optimization**: Automatically reduces the number of pages (from 12 to 5) and disables expensive rendering features (antialiasing) on mobile devices to ensure smooth performance.

3.  **Aesthetic**:
    - **Theme**: "The Campus Chronicle" - a high-end editorial look.
    - **Colors**: Warm paper tones (`#fdfbf7`), sharp ink black text (`#1a1a1a`), and deep red accents (`#8b0000`).
    - **Typography**: Uses _Playfair Display_ for headings and _Inter_ for body text.

## How to Run

1.  Open `HTML/landing-3d.html` in a browser.
2.  For best results, use a local development server (e.g., VS Code Live Server) to ensure proper loading of modules.

## Customization

- **Headlines**: Edit the `headlines` array in `JS/landing-3d.js` inside `createContentTexture()` to change the text on the floating pages.
- **Page Count**: Modify `pageCount` in `JS/landing-3d.js` to add more or fewer floating elements.
- **Colors**: Update CSS variables in `CSS/landing-3d.css`.
