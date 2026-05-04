/* VCS HYPERSPACE ANIMATION ENGINE & MODAL CONTROLLER - v10.P */
/* Features a 3D perspective warp drive effect using standard Canvas2D */

document.addEventListener("DOMContentLoaded", () => {
    initializeStarfield();
});

// --- STARFIELD (WARP SPEED) ANIMATION ---
function initializeStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    // Set full screen dimensions
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const numStars = 600; // Total number of active stars
    const stars = [];

    // Initialize all stars at random starting depths
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * w - w / 2, // Range around central axis
            y: Math.random() * h - h / 2,
            z: Math.random() * w // Start deep in space
        });
    }

    // Perspective point (screen center)
    const px = w / 2;
    const py = h / 2;

    // Star movement logic (move z toward the user)
    function moveStars() {
        for (let i = 0; i < numStars; i++) {
            let s = stars[i];
            s.z -= 15; // Animation Speed (Decreasing Z depth)

            // When the star passes the user, reset it to the deep void
            if (s.z <= 1) {
                s.z = w; // Deep background reset
                s.x = Math.random() * w - w / 2;
                s.y = Math.random() * h - h / 2;
            }
        }
    }

    // Draw the Perspective Shift
    function drawStars() {
        ctx.fillStyle = '#000000'; // Void background (clears previous frame)
        ctx.fillRect(0, 0, w, h);

        moveStars();

        for (let i = 0; i < numStars; i++) {
            let s = stars[i];

            // 3D Perspective Projection (calculates screen X,Y based on depth Z)
            let x = (s.x / s.z) * px + px;
            let y = (s.y / s.z) * py + py;

            // Calculate star size based on depth (large when close)
            let size = ((w - s.z) / w) * 5; // Stars are large as they get close
            let opacity = ((w - s.z) / w) * 1; // Stars are bright as they get close

            if (x < 0 || x > w || y < 0 || y > h) continue; // Skip drawing off-screen

            // USER REQUIREMENT: Large White Stars
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Main animation loop
    function animate() {
        requestAnimationFrame(animate);
        drawStars();
    }

    animate();

    // Handle Window Resizing to keep the starfield synchronized
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
}


// --- SECURE LINK ROUTING ( Continuity from VCS HUB ) ---
// Ensures any manually added external links open in secure tabs
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const url = link.getAttribute('href');
        // Only target external internet links
        if (url && !url.startsWith("mailto:") && url !== "#" && !url.startsWith("javascript:")) {
            if (url.startsWith('http') || url.startsWith('//')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer'); // Sovereignty Standard
            }
        }
    });
});
