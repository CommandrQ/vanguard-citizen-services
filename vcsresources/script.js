/* VCS DYNAMIC DATA ENGINE & MODAL CONTROLLER */

document.addEventListener("DOMContentLoaded", () => {
    loadResources();
    loadGuilds();
});

function getTargetAttribute(url) {
    if (url && !url.startsWith("mailto:") && url !== "#" && !url.startsWith("javascript:")) {
        if (url.startsWith('http') || url.startsWith('//')) {
            return 'target="_blank" rel="noopener noreferrer"';
        }
    }
    return 'target="_self"';
}

async function loadResources() {
    const container = document.getElementById('resources-container');
    try {
        const response = await fetch('json/resources.json', { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = ''; 
        
        data.forEach(item => {
            const highlightClass = item.highlight ? 'highlight' : '';
            const targetInfo = getTargetAttribute(item.link);
            container.innerHTML += `
                <div class="resource-item ${highlightClass}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <a href="${item.link}" class="tier-btn" ${targetInfo}>${item.buttonText}</a>
                </div>
            `;
        });
    } catch (error) {
        console.error("Resource Uplink Failed:", error);
        container.innerHTML = `<p style="color: #ff5f1f;">[ SYSTEM FAULT: ${error.message} ]</p>`;
    }
}

async function loadGuilds() {
    const container = document.getElementById('guilds-container');
    try {
        const response = await fetch('json/guilds.json', { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const data = await response.json();
        container.innerHTML = ''; 
        
        data.forEach(guild => {
            const lockedClass = guild.locked ? 'locked' : '';
            const targetInfo = getTargetAttribute(guild.link);
            
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
        container.innerHTML = `<p style="color: #ff5f1f;">[ SYSTEM FAULT: ${error.message} ]</p>`;
    }
}

// --- MODAL CONTROLS ---

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeModalOnOutsideClick(event, modalId) {
    const modal = document.getElementById(modalId);
    if (event.target === modal) {
        closeModal(modalId);
    }
}
