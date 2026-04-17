/* ==========================================================================
   THE CITADEL HUB ENGINE (Spatial Logic & Memory)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const flashOverlay = document.getElementById('flash-overlay');
    const wipeOverlay = document.getElementById('wipe-overlay');
    const carouselTrack = document.getElementById('carousel-track');
    const gates = document.querySelectorAll('.mirrorgate-node');
    
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnEnter = document.getElementById('btn-enter');

    // --- 1. ENTRY SEQUENCE ---
    // Remove the white flash overlay that carried over from index.html
    setTimeout(() => {
        flashOverlay.classList.remove('flash-active');
        checkFirstTimeUser();
    }, 100); // Slight delay ensures CSS renders before animating

    // --- 2. USER MEMORY ---
    function checkFirstTimeUser() {
        const hasVisited = localStorage.getItem('vanguardInitiated');
        if (!hasVisited) {
            setTimeout(() => {
                alert("Welcome to The Grand Citadel.\n\nYou are no longer waiting. Use the controls to rotate the Mirrorgates and access our directory. Return periodically for new operations.");
                localStorage.setItem('vanguardInitiated', 'true');
            }, 1500); // Waits for the white fade to clear before speaking
        }
    }

    // --- 3. 3D CAROUSEL LOGIC ---
    let currentAngle = 0; // Tracks the rotation of the 3D space
    let currentIndex = 0; // Tracks which gate is active (0, 1, or 2)

    function updateCarousel() {
        // Rotate the entire track container
        carouselTrack.style.transform = `rotateY(${currentAngle}deg)`;
        
        // Remove active glow from all gates
        gates.forEach(gate => gate.classList.remove('active-gate'));
        
        // Calculate the currently facing gate and illuminate it
        // Note: Because we are rotating the track negatively to go right, we need math to find the active index
        let normalizedIndex = Math.round(currentAngle / -120) % 3;
        if (normalizedIndex < 0) normalizedIndex += 3; // Handle negative wrapping
        
        currentIndex = normalizedIndex;
        gates[currentIndex].classList.add('active-gate');
    }

    // Initialize the first gate
    updateCarousel();

    // Rotate Left
    btnPrev.addEventListener('click', () => {
        currentAngle += 120; // 360 degrees / 3 gates
        updateCarousel();
    });

    // Rotate Right
    btnNext.addEventListener('click', () => {
        currentAngle -= 120;
        updateCarousel();
    });

    // --- 4. THE MIRRORGATE WIPE TRANSITION ---
    btnEnter.addEventListener('click', () => {
        // Find out where the active gate is pointing
        const destination = gates[currentIndex].getAttribute('data-destination');
        
        // Trigger the anime-style left wipe (Black Obsidian overtakes the screen)
        wipeOverlay.classList.add('wipe-left-active');
        
        // Wait for the wipe to cover the screen (600ms matches CSS), then redirect
        setTimeout(() => {
            // Note: Until you build mission.html, roster.html, etc., this will go to a 404 page.
            window.location.href = destination; 
        }, 600);
    });

});
