/* ==========================================================================
   THE VANGUARD BRAND KIT
   ========================================================================== */
:root {
    --void-obsidian: #0D0D0D;
    --deep-shadow: #050505;
    --relic-gold: #D4AF37;
    --aura-purple: #BF94FF;
    --starlight-white: #F5F5F7;
    --iron-mist: #86868B;
    --success-green: #00FF41;
}

/* ==========================================================================
   GLOBAL BASE
   ========================================================================== */
body {
    margin: 0; padding: 0;
    background-color: var(--deep-shadow);
    color: var(--starlight-white);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro", sans-serif;
    overflow: hidden; 
    user-select: none; 
}

.cinzel-heading {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9); 
}

.centered-text { text-align: center; }
.starlight-text { color: var(--starlight-white); }
.relic-gold-text { color: var(--relic-gold); }
.iron-mist-text { color: var(--iron-mist); }

/* ==========================================================================
   LAYOUT
   ========================================================================== */
.fullscreen-flex {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
}

.main-header { margin-bottom: 0.5rem; z-index: 10; }
.vertical-spacer { height: 40px; }

.os-status-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-dot {
    width: 8px; height: 8px;
    background-color: var(--success-green);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--success-green);
    animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
}

/* ==========================================================================
   THE RPG UI
   ========================================================================== */
.rpg-box {
    background: linear-gradient(135deg, var(--void-obsidian) 0%, var(--deep-shadow) 100%);
    border: 2px solid var(--relic-gold);
    border-radius: 4px;
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.9), 4px 4px 10px rgba(0, 0, 0, 0.8);
    padding: 1rem;
    color: var(--starlight-white);
    text-align: center;
}

button.rpg-box {
    cursor: pointer;
    font-family: 'Cinzel', serif;
    transition: all 0.3s ease;
    outline: none;
}

.hover-glow:hover {
    box-shadow: inset 0 0 15px rgba(191, 148, 255, 0.5), 0 0 15px rgba(212, 175, 55, 0.6);
    border-color: var(--starlight-white);
}

.pulse-border {
    animation: goldPulse 3s infinite alternate;
}

@keyframes goldPulse {
    from { border-color: var(--relic-gold); }
    to { border-color: var(--starlight-white); box-shadow: 0 0 15px var(--relic-gold); }
}

/* ==========================================================================
   MIRRORGATE CAROUSEL
   ========================================================================== */
.mirrorgates-viewport {
    perspective: 1500px;
    width: 100%;
    max-width: 800px;
    height: 400px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-track {
    width: 240px; /* Width of one card */
    height: 320px;
    position: absolute;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mirrorgate-node {
    position: absolute;
    width: 240px;
    height: 320px;
    backface-visibility: hidden;
    opacity: 0.2;
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.mirrorgate-node.active-gate { opacity: 1; }

.gate-image-container {
    width: 100%;
    height: 150px;
    border: 1px solid var(--relic-gold);
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.gate-image-container img { width: 100%; height: 100%; object-fit: cover; }

/* 3D Geometry for 4 items */
.mirrorgate-node:nth-child(1) { transform: rotateY(0deg) translateZ(400px); }
.mirrorgate-node:nth-child(2) { transform: rotateY(90deg) translateZ(400px); }
.mirrorgate-node:nth-child(3) { transform: rotateY(180deg) translateZ(400px); }
.mirrorgate-node:nth-child(4) { transform: rotateY(270deg) translateZ(400px); }

/* FLOATING CONTROLS */
.floating-controls {
    position: absolute;
    width: 110%; /* Spans wider than the carousel */
    display: flex;
    justify-content: space-between;
    z-index: 100;
    pointer-events: none; /* Allows clicking through the container */
}

.floating-controls button {
    pointer-events: auto;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: rgba(13, 13, 13, 0.8);
}

.centered-footer { margin-top: 2rem; }

/* ==========================================================================
   EFFECTS
   ========================================================================== */
#hub-background {
    position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -2;
    background: radial-gradient(circle at center, #0D0D0D 0%, #050505 100%);
    box-shadow: inset 0 0 100px rgba(191, 148, 255, 0.1);
}

#flash-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: var(--starlight-white); z-index: 9999; opacity: 0; pointer-events: none;
    transition: opacity 1.5s ease;
}
.flash-active { opacity: 1 !important; }

#wipe-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: var(--void-obsidian); z-index: 9998; transform: translateX(100%);
    transition: transform 0.6s cubic-bezier(0.7, 0, 0.3, 1);
}
.wipe-left-active { transform: translateX(0) !important; }
