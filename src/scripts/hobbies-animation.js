/**
 * Hobbies Section: Organic Blobs Animation
 * Evokes creativity through fluid, wandering motion.
 */
function initHobbiesAnimation() {
    const container = document.getElementById('hobbies-animation-container');
    const section = document.getElementById('hobbies');
    if (!container || !section) return;

    let hasStarted = false;

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
        
        // Constrain to 25% - 75% range (middle 50%) to stay well away from edges
        blob.style.left = `${25 + Math.random() * 50}%`;
        blob.style.top = `${25 + Math.random() * 50}%`;
        blob.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Multi-point wandering path variables (more constrained drift: +/- 250px)
        blob.style.setProperty('--duration', `${25 + Math.random() * 15}s`); 
        blob.style.setProperty('--tx', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--ty', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--tx1', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--ty1', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--tx2', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--ty2', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--tx3', `${(Math.random() - 0.5) * 250}px`);
        blob.style.setProperty('--ty3', `${(Math.random() - 0.5) * 250}px`);
        
        container.appendChild(blob);
        
        // Fade in the individual blob
        requestAnimationFrame(() => {
            blob.style.transition = 'opacity 2s ease-in';
            blob.style.opacity = '0.1';
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                hasStarted = true;
                // Create a set of initial blobs
                for (let i = 0; i < 6; i++) {
                    setTimeout(createBlob, i * 300); // Staggered appearance
                }
                observer.unobserve(section); // Only trigger once
            }
        });
    }, { threshold: 0.1 });

    observer.observe(section);
}

// Ensure initialization after DOM and potential Astro hydration
document.addEventListener('DOMContentLoaded', initHobbiesAnimation);
// Handle Astro view transitions if applicable
document.addEventListener('astro:page-load', initHobbiesAnimation);
