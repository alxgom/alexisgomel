/**
 * Hobbies Section: Organic Blobs Animation
 * Evokes creativity through fluid, wandering motion.
 */
function initHobbiesAnimation() {
    const container = document.getElementById('hobbies-animation-container');
    if (!container) return;

    // Palette: Red (Primary), Teal, Amber, Blue, Lavender
    const colors = [
        '#a50034', // var(--primary)
        '#115740', // var(--teal)
        '#ffab60', // var(--amber)
        '#26619c', // var(--blue)
        '#9c2661'  // var(--lavender)
    ];

    function createBlob() {
        const blob = document.createElement('div');
        blob.className = 'hobby-blob';
        
        const size = 300 + Math.random() * 400;
        blob.style.width = `${size}px`;
        blob.style.height = `${size}px`;
        
        blob.style.left = `${Math.random() * 100}%`;
        blob.style.top = `${Math.random() * 100}%`;
        blob.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Multi-point wandering path variables
        blob.style.setProperty('--duration', `${20 + Math.random() * 15}s`); 
        blob.style.setProperty('--tx', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--ty', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--tx1', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--ty1', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--tx2', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--ty2', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--tx3', `${(Math.random() - 0.5) * 600}px`);
        blob.style.setProperty('--ty3', `${(Math.random() - 0.5) * 600}px`);
        
        container.appendChild(blob);
    }

    // Create a set of initial blobs
    for (let i = 0; i < 6; i++) {
        createBlob();
    }
}

// Ensure initialization after DOM and potential Astro hydration
document.addEventListener('DOMContentLoaded', initHobbiesAnimation);
// Handle Astro view transitions if applicable
document.addEventListener('astro:page-load', initHobbiesAnimation);
