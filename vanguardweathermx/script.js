/**
 * VANGUARD WEATHER MX: COMMAND SCRIPT
 * V7: POPUP LOGIC & DESKTOP SYNC
 */

const CONFIG = {
    USER_AGENT: '(Vanguard Weather Mx, commandrq@gmail.com)',
    POLL_RATE: 180000, 
    STATE_MAP: { "Kentucky": "KY", "Tennessee": "TN", "Ohio": "OH", "Indiana": "IN", "Illinois": "IL" } 
};

let SESSION = { sector: null, alerts: [] };
const UI = {};

document.addEventListener('DOMContentLoaded', () => {
    const ids = ['update-btn', 'reset-loc-btn', 'geo-btn', 'location-search', 'autocomplete-results', 
                 'notify-btn', 'close-modal', 'alert-modal', 'dashboard', 'primary-alert', 
                 'beginner-action', 'chaser-bulletin', 'modal-title', 'modal-body', 'last-scan-time',
                 'telemetry-toggle', 'expert-panel'];
    ids.forEach(id => UI[id.replace(/-([a-z])/g, g => g[1].toUpperCase())] = document.getElementById(id));

    if (localStorage.getItem('vanguard_mx_alerts') === 'true' && Notification.permission === 'granted') {
        UI.notifyBtn.style.color = "#00ff00";
    }

    UI.telemetryToggle.onclick = () => {
        UI.expertPanel.classList.toggle('hidden-panel');
        UI.telemetryToggle.classList.toggle('active-toggle');
    };

    UI.updateBtn.onclick = () => SESSION.sector && executeSweep();
    UI.geoBtn.onclick = requestGeolocation;
    UI.notifyBtn.onclick = toggleAlerts;
    UI.closeModal.onclick = () => UI.alertModal.classList.add('hidden');
    UI.resetLocBtn.onclick = resetSystem;

    UI.locationSearch.oninput = (e) => {
        const val = e.target.value.trim();
        if (val.length < 3) return UI.autocompleteResults.classList.add('hidden');
        /^\d{5}$/.test(val) ? fetchZip(val) : fetchCity(val);
    };

    setInterval(() => SESSION.sector && executeSweep(true), CONFIG.POLL_RATE);
});

// --- DATA LOGIC ---

async function executeSweep() {
    const url = `https://api.weather.gov/alerts/active?area=${SESSION.sector.state}&cb=${Date.now()}`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': CONFIG.USER_AGENT }, cache: 'no-store' });
        const data = await res.json();
        updateTimestamp();
        processAlerts(data.features);
    } catch (e) {
        updateTimestamp();
        renderUI('status-offline', 'SYSTEM INACTIVE', 'Monitor radio or local weather for additional threats.', '<p>[!] DATA LINK INTERRUPTED.</p>');
    }
}

function updateTimestamp() {
    const now = new Date();
    UI.lastScanTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function processAlerts(features) {
    SESSION.alerts = features.map(f => f.properties);
    let tornado = null, severe = null, list = '';

    if (SESSION.alerts.length === 0) {
        list = `<p>Sector ${SESSION.sector.state} is clear.</p>`;
    } else {
        SESSION.alerts.forEach((a, i) => {
            if (a.event === 'Tornado Warning') tornado = a;
            else if (a.event.includes('Thunderstorm') || a.event.includes('Flood')) severe = a;
            
            // Reconstructed simple alert with dedicated popup link
            list += `<div class="alert-item ${a.event === 'Tornado Warning' ? 'tornado-alert' : ''}">
                        <strong>[NATURE OF THREAT]:</strong> ${a.event}<br>
                        <span class="nws-popup-link" onclick="openModal(${i})">>>> OPEN FULL NWS ALERT <<<</span>
                     </div>`;
        });
    }

    if (tornado) renderUI('status-red', `TORNADO WARNING: ${tornado.areaDesc}`, 'Seek interior shelter immediately.', list);
    else if (severe) renderUI('status-orange', `${severe.event.toUpperCase()} ACTIVE`, 'Stay indoors. Secure property.', list);
    else renderUI('status-green', `ALL CLEAR IN ${SESSION.sector.state}`, 'No forecasted threats. Monitoring nominal.', list);
}

function renderUI(cls, banner, action, bulletin) {
    UI.dashboard.className = cls;
    UI.primaryAlert.textContent = banner;
    UI.beginnerAction.innerHTML = `<p>${action}</p>`;
    UI.chaserBulletin.innerHTML = bulletin;
}

function requestGeolocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const res = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`, { headers: { 'User-Agent': CONFIG.USER_AGENT } });
            const data = await res.json();
            SESSION.sector = { state: data.properties.relativeLocation.properties.state };
            UI.locationSearch.value = SESSION.sector.state;
            executeSweep();
        } catch(e) { alert("GPS Bridge Failure."); }
    }, () => alert("Location access required for tactical monitoring."));
}

function openModal(i) {
    const a = SESSION.alerts[i];
    UI.modalTitle.textContent = a.event;
    UI.modalBody.innerHTML = `<strong>AREA:</strong> ${a.areaDesc}<br><br><strong>TELEMETRY:</strong><br>${a.description}<br><br><strong>PROTOCOL:</strong><br>${a.instruction}`;
    UI.alertModal.classList.remove('hidden');
}

function resetSystem() { location.reload(); }

function toggleAlerts() {
    Notification.requestPermission().then(p => {
        if (p === 'granted') {
            localStorage.setItem('vanguard_mx_alerts', 'true');
            UI.notifyBtn.style.color = "#00ff00";
        }
    });
}

// Search Helpers
async function fetchZip(zip) {
    try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        const data = await res.json();
        commitSearch(data.places[0]["state abbreviation"], `${data.places[0]["place name"]}, ${data.places[0]["state abbreviation"]}`);
    } catch(e) {}
}

async function fetchCity(city) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&format=json`);
        const data = await res.json();
        const p = data.results.find(x => x.country_code === "US");
        if(p) commitSearch(CONFIG.STATE_MAP[p.admin1], `${p.name}, ${CONFIG.STATE_MAP[p.admin1]}`);
    } catch(e) {}
}

function commitSearch(state, text) {
    SESSION.sector = { state };
    UI.locationSearch.value = text;
    UI.autocompleteResults.classList.add('hidden');
    executeSweep();
}
