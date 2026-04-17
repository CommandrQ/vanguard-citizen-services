/* ==========================================================================
   THE VANGUARD ENGINE (Logic & Choreography)
   ========================================================================== */

// --- DOM ELEMENTS ---
const btnKnock = document.getElementById('btn-knock');
const dialogueBox = document.getElementById('dialogue-box');
const questionText = document.getElementById('question-text');
const btnNext = document.getElementById('btn-next');
const flashOverlay = document.getElementById('flash-overlay');

// --- THE INITIATION SCRIPT ---
const questions = [
    "When was the last time you were Educated?",
    "When was the last time you were Empowered?",
    "When was the last time you were Elevated?"
];

let currentQuestionIndex = 0;

/* ==========================================================================
   ACT I: THE SEQUENCE
   ========================================================================== */

// 1. The user interacts with the gate
btnKnock.addEventListener('click', () => {
    // Hide the 'Knock' button and reveal the dialogue box
    btnKnock.classList.add('hidden');
    dialogueBox.classList.remove('hidden');
    
    // Load the first question and apply the smooth fade-in animation
    questionText.innerText = questions[currentQuestionIndex];
    questionText.classList.add('fade-in');

    // Reveal the "Proceed" button immediately
    btnNext.classList.remove('hidden');
});

// 2. The Navigation Logic
btnNext.addEventListener('click', () => {
    currentQuestionIndex++;

    if (currentQuestionIndex === 1) {
        // Question 2: Reset animations and quickly pop it in
        resetAnimations();
        questionText.innerText = questions[currentQuestionIndex];
        questionText.classList.add('pop-in');

    } else if (currentQuestionIndex === 2) {
        // Question 3 (Final): Reset animations, pop it in, and hide the button
        resetAnimations();
        questionText.innerText = questions[currentQuestionIndex];
        questionText.classList.add('pop-in');
        
        btnNext.classList.add('hidden');

        // Wait exactly 2 seconds, then trigger the cinematic transition
        setTimeout(() => {
            triggerCitadelTransition();
        }, 2000);
    }
});

// Utility function to clear CSS animation states so they can be re-triggered cleanly
function resetAnimations() {
    questionText.classList.remove('fade-in');
    questionText.classList.remove('pop-in');
    // Forcing a browser reflow so the animation restarts smoothly
    void questionText.offsetWidth; 
}

/* ==========================================================================
   ACT II: THE CITADEL TRANSITION
   ========================================================================== */

// 3. The Cinematic Screen Wipe & Redirect
function triggerCitadelTransition() {
    // Ignite the pure white CSS flash overlay
    flashOverlay.classList.add('flash-active');

    // Wait 1.5 seconds for the screen to go completely blind, then redirect
    setTimeout(() => {
        // Directs the user to the newly separated Hub page
        window.location.href = 'home.html';
    }, 1500); 
}
