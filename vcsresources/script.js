/* VCS DYNAMIC DATA ENGINE & MODAL CONTROLLER - v10.N */

// Initialize data fetch on page load
document.addEventListener("DOMContentLoaded", () => {
    loadResources();
    loadGuilds();
});

// --- SMART LINK ROUTING ---
function getTargetAttribute(url) {
    // Ignore empty links, anchor tags, mailto links, and javascript triggers
    if (url && !url.startsWith("mailto:") && url !== "#" && !url.startsWith("javascript:")) {
        // External links (http, https, //) open in a new, secure tab
        if (url.startsWith('http') || url.startsWith('//')) {
            return 'target="_blank" rel="noopener noreferrer"';
        }
    }
    // Internal links stay in the same window
    return 'target="_self"';
}

// --- DATA FETCHING (LEFT COLUMN) ---
async function loadResources() {
    const container = document.getElementById('resources-container');
    try {
        // { cache: "no-store" } forces the browser to download the freshest JSON every time
        const response = await fetch('json/resources.json', { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = ''; // Clear the initialization text
        
        data.forEach(item => {
            const highlightClass = item.highlight ? 'highlight' : '';
            const targetInfo = getTargetAttribute(item.link);
            
            container.innerHTML += `
                <div class="resource-item ${highlightClass}">
                    <div class="item-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                    <a href="${item.link}" class="tier-btn" ${targetInfo}>${item.buttonText}</a>
                </div>
            `;
        });
    } catch (error) {
        console.error("Resource Uplink Failed:", error);
        container.innerHTML = `<p style="color: #ff5f1f;">[ SYSTEM FAULT: ${error.message} ]<br><span style="font-size: 0.8rem; color: #8b949e;">Ensure json/resources.json exists and is valid.</span></p>`;
    }
}

// --- DATA FETCHING (RIGHT COLUMN) ---
async function loadGuilds() {
    const container = document.getElementById('guilds-container');
    try {
        // { cache: "no-store" } ensures updates appear instantly
        const response = await fetch('json/guilds.json', { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = ''; // Clear the initialization text
        
        data.forEach(guild => {
            const lockedClass = guild.locked ? 'locked' : '';
            const targetInfo = getTargetAttribute(guild.link);
            
            // If locked, render a disabled button instead of an active link
            const buttonHTML = guild.locked 
                ? `<button class="contact-btn" disabled>${guild.buttonText}</button>`
                : `<a href="${guild.link}" class="contact-btn" ${targetInfo}>${guild.buttonText}</a>`;

            container.innerHTML += `
                <div class="guild-card ${lockedClass}">
                    <div class="guild-header">${guild.title}</div>
                    <p>${guild.description}</p>
                    ${buttonHTML}
                </div>
            `;
        });
    } catch (error) {
        console.error("Guild Uplink Failed:", error);
        container.innerHTML = `<p style="color: #ff5f1f;">[ SYSTEM FAULT: ${error.message} ]<br><span style="font-size: 0.8rem; color: #8b949e;">Ensure json/guilds.json exists and is valid.</span></p>`;
    }
}

// --- MODAL CONTROLS ---

// Opens the modal by changing display from 'none' to 'flex'
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Closes the modal by reverting display to 'none'
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Closes the modal if the user clicks the dark background outside the content box
function closeModalOnOutsideClick(event, modalId) {
    const modal = document.getElementById(modalId);
    if (event.target === modal) {
        closeModal(modalId);
    }
}
