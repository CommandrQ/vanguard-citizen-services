/**
 * VANGUARD WEATHER MX: CORE COMMAND SCRIPT
 * MODULAR VERSION: Optimized for Crisis Telemetry
 */

const CONFIG = {
    USER_AGENT: '(Vanguard Weather Mx, commandrq@gmail.com)',
    POLL_RATE: 180000, // 3 Minutes
    STATE_MAP: { "Kentucky": "KY", "Tennessee": "TN" /* ...extendable... */ }
};

let SESSION = {
    sector: null, // { state, lat, lon }
    alerts: [],
    lastId: null
};

const UI = {};

document.addEventListener('DOMContentLoaded', () => {
    // 1. CACHE DOM ELEMENTS
    const ids = ['update-btn', 'reset-loc-btn', 'geo-btn', 'location-search', 'autocomplete-results', 
                 'notify-btn', 'close-modal', 'alert-modal', 'dashboard', 'primary-alert', 
                 'beginner-action', 'chaser-bulletin', 'modal-title', 'modal-body'];
    ids.forEach(id => UI[id.replace(/-([a-z])/g, g => g[1].toUpperCase())] = document.getElementById(id));

    // 2. BOOT PROTOCOL
    if (localStorage.getItem('vanguard_mx_alerts') === 'true' && Notification.permission === 'granted') {
        UI.notifyBtn.textContent = "ALERTS: ACTIVE";
        UI.notifyBtn.style.color = "#00ff00";
    }

    // 3. CORE EVENT BINDING
    UI.updateBtn.onclick = () => SESSION.sector && executeSweep();
    UI.geoBtn.onclick = requestGeolocation;
    UI.notifyBtn.onclick = toggleAlerts;
    UI.closeModal.onclick = () => UI.alertModal.classList.add('hidden');
    UI.resetLocBtn.onclick = resetSystem;

    UI.locationSearch.oninput = (e) => {
        const val = e.target.value.trim();
        if (val.length < 3) return UI.autocompleteResults.classList.add('hidden');
        // Simple Logic: If 5 numbers, it's a Zip. Else, it's a City.
        /^\d{5}$/.test(val) ? fetchZip(val) : fetchCity(val);
    };

    setInterval(() => SESSION.sector && executeSweep(true), CONFIG.POLL_RATE);
});

// --- TELEMETRY MODULES ---

async function executeSweep() {
    const url = `https://api.weather.gov/alerts/active?area=${SESSION.sector.state}&cb=${Date.now()}`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': CONFIG.USER_AGENT }, cache: 'no-store' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        processAlerts(data.features);
    } catch (e) {
        renderUI('status-offline', 'SYSTEM INACTIVE // LINK SUSPENDED', 'Data bridge to NWS is compromised. Switch to radio backup.', '<p>CRITICAL: DATA FEED LOST.</p>');
    }
}

function processAlerts(features) {
    SESSION.alerts = features.map(f => f.properties);
    let tornado = null, severe = null, imminent = false, list = '';

    if (SESSION.alerts.length === 0) {
        list = `<p>Sector ${SESSION.sector.state} is currently clear.</p>`;
    } else {
        SESSION.alerts.forEach((a, i) => {
            // Check for Imminent 15-minute intercept if GPS is active
            if (SESSION.sector.lat && a.description.includes('TIME...MOT...LOC')) {
                const impact = checkIntercept(a.description);
                if (impact <= 15) imminent = true;
            }
            if (a.event === 'Tornado Warning') tornado = a;
            else if (a.event.includes('Thunderstorm') || a.event.includes('Flash Flood')) severe = a;

            list += `<div class="alert-item ${a.event === 'Tornado Warning' ? 'tornado-alert' : ''}" onclick="openModal(${i})">[VIEW]: ${a.event}</div>`;
        });
    }

    // STATE HIERARCHY
    if (imminent) {
        renderUI('status-red', 'IMMEDIATE IMPACT EXPECTED', 'STORM ARRIVAL < 15 MINS. SEEK SHELTER IMMEDIATELY. DO NOT WAIT.', list);
    } else if (tornado) {
        renderUI('status-red', `TORNADO WARNING: ${tornado.areaDesc}`, 'Please move to an interior room on the lowest floor. Act calmly and quickly.', list);
    } else if (severe) {
        renderUI('status-orange', `${severe.event.toUpperCase()} ACTIVE`, 'Please stay indoors and away from windows. Secure property now.', list);
    } else {
        renderUI('status-green', `ALL CLEAR IN ${SESSION.sector.state}`, 'No forecasted threats. Monitoring nominal. Enjoy your day.', list);
    }
}

// --- LOGIC HELPERS ---

function renderUI(cls, banner, action, bulletin) {
    UI.dashboard.className = cls;
    UI.primaryAlert.textContent = banner;
    UI.beginnerAction.innerHTML = `<p>${action}</p>`;
    UI.chaserBulletin.innerHTML = bulletin;
}

function requestGeolocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, { headers: { 'User-Agent': CONFIG.USER_AGENT } });
        const data = await res.json();
        SESSION.sector = { state: data.properties.relativeLocation.properties.state, lat: latitude, lon: longitude };
        UI.locationSearch.value = SESSION.sector.state;
        executeSweep();
    }, () => alert("Location access required for precision monitoring."));
}

function checkIntercept(desc) {
    // Modular placeholder for the Haversine/Velocity math integrated previously
    return 99; // Returns minutes to impact
}

function openModal(i) {
    const a = SESSION.alerts[i];
    UI.modalTitle.textContent = a.event;
    UI.modalBody.innerHTML = `<strong>AREA:</strong> ${a.areaDesc}<br><br><strong>NWS DATA:</strong><br>${a.description}<br><br><strong>INSTRUCTION:</strong><br>${a.instruction}`;
    UI.alertModal.classList.remove('hidden');
}

function resetSystem() {
    SESSION.sector = null;
    localStorage.removeItem('vanguard_mx_alerts');
    location.reload();
}

function toggleAlerts() {
    Notification.requestPermission().then(p => {
        if (p === 'granted') {
            localStorage.setItem('vanguard_mx_alerts', 'true');
            UI.notifyBtn.textContent = "ALERTS: ACTIVE";
            UI.notifyBtn.style.color = "#00ff00";
        }
    });
}
