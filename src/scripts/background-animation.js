/**
 * Background SVG animation with localized "Data Clusters".
 */
class DataCluster {
    constructor(container, lineLayer, dotLayer, bounds) {
        this.container = container;
        this.lineLayer = lineLayer;
        this.dotLayer = dotLayer;
        this.bounds = bounds; // { x, y, w, h }
        
        this.points = [];
        this.dots = new Map();
        this.lines = [];
        this.maxPoints = 4;
        this.interval = 2000 + Math.random() * 2000;
        this.timer = null;
    }

    getPoint() {
        const m = 20; // Margin within cluster
        return {
            x: this.bounds.x + m + Math.random() * (this.bounds.w - m * 2),
            y: this.bounds.y + m + Math.random() * (this.bounds.h - m * 2),
            id: Math.random().toString(36).substr(2, 9),
            radius: 3.5 + Math.random() * 2.5
        };
    }

    createDot(p) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', p.radius);
        circle.setAttribute('class', 'dot');
        this.dotLayer.appendChild(circle);
        
        requestAnimationFrame(() => {
            setTimeout(() => circle.classList.add('visible'), 50);
        });
        return circle;
    }

    createLine(p1, p2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('class', 'line');
        
        const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        
        this.lineLayer.appendChild(line);

        requestAnimationFrame(() => {
            setTimeout(() => {
                line.classList.add('visible');
                // Smooth growth matching the shrink feel
                line.style.transition = 'stroke-dashoffset 2.5s ease-in-out, opacity 1s ease-in';
                line.style.strokeDashoffset = 0;
            }, 350); // Delay so dot appears first
        });
        return { el: line, length: length };
    }

    next() {
        const p = this.getPoint();
        const dot = this.createDot(p);
        this.dots.set(p.id, dot);

        if (this.points.length > 0) {
            const prev = this.points[this.points.length - 1];
            const lineObj = this.createLine(prev, p);
            this.lines.push({ 
                el: lineObj.el, 
                length: lineObj.length,
                from: prev.id, 
                to: p.id 
            });
        }

        this.points.push(p);

        if (this.points.length > this.maxPoints) {
            const old = this.points.shift();
            const d = this.dots.get(old.id);
            if (d) {
                d.classList.remove('visible');
                setTimeout(() => {
                    d.remove();
                    this.dots.delete(old.id);
                }, 3000);
            }

            const li = this.lines.findIndex(l => l.from === old.id);
            if (li !== -1) {
                const lObj = this.lines.splice(li, 1)[0];
                lObj.el.style.transition = 'stroke-dashoffset 3.5s ease-in, opacity 3s ease-in';
                lObj.el.style.strokeDashoffset = -lObj.length;
                lObj.el.classList.remove('visible');
                setTimeout(() => lObj.el.remove(), 3500);
            }
        }
    }

    start() {
        this.next();
        setTimeout(() => this.next(), 800);
        this.timer = setInterval(() => this.next(), this.interval);
    }

    stop() {
        clearInterval(this.timer);
    }
}

function initBackgroundAnimation(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = container.querySelector('svg');
    const lineLayer = svg ? svg.querySelector('.line-layer') : null;
    const dotLayer = svg ? svg.querySelector('.dot-layer') : null;
    
    if (!svg || !lineLayer || !dotLayer) return;

    const isMobile = window.innerWidth < 768;
    const numClusters = isMobile ? 3 : 5;

    function setupClusters() {
        clusters.forEach(c => c.stop());
        clusters = []; // Reset clusters array
        lineLayer.innerHTML = '';
        dotLayer.innerHTML = '';
        
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        
        if (w === 0 || h === 0) return;

        // Create clusters distributed across the full width
        const clusterSize = Math.min(w, h) * (isMobile ? 0.6 : 0.4);
        const zoneWidth = w / numClusters;
        
        for (let i = 0; i < numClusters; i++) {
            const minX = i * zoneWidth;
            const maxX = (i + 1) * zoneWidth - clusterSize;
            
            // Ensure cluster stays within its zone and container width
            const x = Math.max(0, Math.min(w - clusterSize, minX + Math.random() * (zoneWidth - clusterSize)));
            
            const bounds = {
                x: x,
                y: Math.random() * (h - clusterSize),
                w: clusterSize,
                h: clusterSize
            };
            const cluster = new DataCluster(container, lineLayer, dotLayer, bounds);
            // Don't start immediately, let observer decide
            clusters.push(cluster);
        }
    }

    setupClusters();
    
    // Intersection Observer to pause/play animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                clusters.forEach(c => c.start());
            } else {
                clusters.forEach(c => c.stop());
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupClusters();
            // Re-start if visible after resize
            if (container.getBoundingClientRect().top < window.innerHeight && container.getBoundingClientRect().bottom > 0) {
                clusters.forEach(c => c.start());
            }
        }, 250);
    });
}

function start() {
    initBackgroundAnimation('animation-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}

// Handle Astro view transitions if applicable
document.addEventListener('astro:page-load', start);
