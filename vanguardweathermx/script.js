const CONFIG = {
    USER_AGENT: '(Vanguard Weather Mx, commandrq@gmail.com)',
    POLL_RATE: 180000, 
    STATE_MAP: { "Kentucky": "KY", "Tennessee": "TN", "Ohio": "OH", "Indiana": "IN", "Illinois": "IL" } 
};

// Centralized Text Labels
const UI_LABELS = {
    err_zip: "VANGUARD COMMAND: Invalid Zip Code.",
    err_jurisdiction: "VANGUARD COMMAND: Sector must be within US jurisdiction.",
    err_not_found: "VANGUARD COMMAND: Sector not found. Verify spelling.",
    err_db: "VANGUARD COMMAND: Location database offline.",
    err_gps_fail: "GPS Bridge Failure.",
    err_gps_denied: "Location access required for tactical monitoring.",
    err_notify: "System notifications are not supported on this device.",
    offline_banner: "SYSTEM INACTIVE",
    offline_action: "Monitor radio or local weather for additional threats.",
    offline_bulletin: "<p>[!] DATA LINK INTERRUPTED.</p>",
    clear_banner: "ALL CLEAR IN ",
    clear_action: "No forecasted threats. Monitoring nominal.",
    clear_bulletin: " is clear.</p>",
    warn_orange_action: "Stay indoors. Secure property.",
    warn_red_banner: "TORNADO WARNING: ",
    warn_red_action: "Seek interior shelter immediately.",
    threat_label: "[NATURE OF THREAT]:",
    open_alert: ">>> OPEN FULL NWS ALERT <<<"
};

let SESSION = { sector: null, alerts: [], pendingScan: null };
let searchThrottleTimeout;
const UI = {};

document.addEventListener('DOMContentLoaded', () => {
    const ids = ['update-btn', 'reset-loc-btn', 'geo-btn', 'location-search', 'autocomplete-results', 
                 'notify-btn', 'close-modal', 'alert-modal', 'dashboard', 'primary-alert', 
                 'beginner-action', 'chaser-bulletin', 'modal-title', 'modal-body', 'last-scan-time',
                 'is-current-loc', 'disclaimer-modal', 'accept-disclaimer-btn', 'close-disclaimer'];
    ids.forEach(id => UI[id.replace(/-([a-z])/g, g => g[1].toUpperCase())] = document.getElementById(id));

    const notificationsSupported = 'Notification' in window;
    if (localStorage.getItem('vanguard_mx_alerts') === 'true' && notificationsSupported && Notification.permission === 'granted') {
        UI.notifyBtn.style.color = "#00ff00";
    }

    window.addEventListener('click', (e) => {
        if (e.target === UI.alertModal) UI.alertModal.classList.add('hidden');
        if (e.target === UI.disclaimerModal) abortScan();
        if (!e.target.closest('.search-container')) UI.autocompleteResults.classList.add('hidden');
    });

    UI.closeModal.onclick = () => UI.alertModal.classList.add('hidden');
    UI.closeDisclaimer.onclick = abortScan;

    UI.locationSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processManualInput();
        }
    });

    UI.updateBtn.onclick = () => {
        const val = UI.locationSearch.value.trim();
        if (val.length >= 3 && !val.includes(",")) {
            processManualInput();
        } else if (SESSION.sector) {
            setTimeout(() => executeSweep(), 500); 
        }
    };

    UI.locationSearch.oninput = (e) => {
        clearTimeout(searchThrottleTimeout);
        const val = e.target.value.trim();
        if (val.length < 3) return UI.autocompleteResults.classList.add('hidden');
        
        searchThrottleTimeout = setTimeout(() => {
            /^\d{5}$/.test(val) ? fetchZip(val) : fetchCity(val);
        }, 500); 
    };

    UI.geoBtn.onclick = requestGeolocation;
    UI.notifyBtn.onclick = toggleAlerts;
    UI.resetLocBtn.onclick = resetSystem;

    UI.acceptDisclaimerBtn.onclick = () => {
        UI.disclaimerModal.classList.add('hidden');
        UI.isCurrentLoc.checked = false;
        setTimeout(() => {
            if (SESSION.pendingScan) {
                commitSearch(SESSION.pendingScan.state, SESSION.pendingScan.text);
                SESSION.pendingScan = null;
            }
        }, 500);
    };

    setInterval(() => SESSION.sector && executeSweep(true), CONFIG.POLL_RATE);
});

function abortScan() {
    UI.disclaimerModal.classList.add('hidden');
    SESSION.pendingScan = null;
}

async function processManualInput() {
    const val = UI.locationSearch.value.trim();
    UI.autocompleteResults.classList.add('hidden'); 
    if (val.length < 3) return;

    if (/^\d{5}$/.test(val)) {
        try {
            const res = await fetch(`https://api.zippopotam.us/us/${val}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            const stateCode = data.places[0]["state abbreviation"];
            handleLocationSelection(stateCode, `${data.places[0]["place name"]}, ${stateCode}`);
        } catch(e) { alert(UI_LABELS.err_zip); }
    } else {
        try {
            const encodedVal = encodeURIComponent(val);
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedVal}&count=1&format=json`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const p = data.results.find(x => x.country_code === "US");
                if (p && CONFIG.STATE_MAP[p.admin1]) {
                    handleLocationSelection(CONFIG.STATE_MAP[p.admin1], `${p.name}, ${CONFIG.STATE_MAP[p.admin1]}`);
                } else {
                    alert(UI_LABELS.err_jurisdiction);
                }
            } else {
                alert(UI_LABELS.err_not_found);
            }
        } catch(e) { alert(UI_LABELS.err_db); }
    }
}

function handleLocationSelection(stateCode, text) {
    setTimeout(() => {
        if (UI.isCurrentLoc.checked) {
            SESSION.pendingScan = { state: stateCode, text: text };
            UI.disclaimerModal.classList.remove('hidden');
        } else {
            commitSearch(stateCode, text);
        }
    }, 500);
}

function commitSearch(state, text) {
    SESSION.sector = { state };
    UI.locationSearch.value = text;
    UI.autocompleteResults.classList.add('hidden');
    executeSweep();
}

async function executeSweep() {
    const url = `https://api.weather.gov/alerts/active?area=${SESSION.sector.state}&cb=${Date.now()}`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': CONFIG.USER_AGENT }, cache: 'no-store' });
        const data = await res.json();
        updateTimestamp();
        processAlerts(data.features);
    } catch (e) {
        updateTimestamp();
        renderUI('status-offline', UI_LABELS.offline_banner, UI_LABELS.offline_action, UI_LABELS.offline_bulletin);
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
        list = `<p>Sector ${SESSION.sector.state}${UI_LABELS.clear_bulletin}`;
    } else {
        SESSION.alerts.forEach((a, i) => {
            if (a.event === 'Tornado Warning') tornado = a;
            else if (a.event.includes('Thunderstorm') || a.event.includes('Flood')) severe = a;
            
            list += `<div class="alert-item ${a.event === 'Tornado Warning' ? 'tornado-alert' : ''}">
                        <strong>${UI_LABELS.threat_label}</strong> ${a.event}<br>
                        <span class="nws-popup-link" onclick="openModal(${i})">${UI_LABELS.open_alert}</span>
                     </div>`;
        });
    }

    if (tornado) renderUI('status-red', `${UI_LABELS.warn_red_banner}${tornado.areaDesc}`, UI_LABELS.warn_red_action, list);
    else if (severe) renderUI('status-orange', `${severe.event.toUpperCase()} ACTIVE`, UI_LABELS.warn_orange_action, list);
    else renderUI('status-green', `${UI_LABELS.clear_banner}${SESSION.sector.state}`, UI_LABELS.clear_action, list);
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
            
            UI.isCurrentLoc.checked = false; 
            setTimeout(() => executeSweep(), 500);
        } catch(e) { alert(UI_LABELS.err_gps_fail); }
    }, () => alert(UI_LABELS.err_gps_denied));
}

function openModal(i) {
    const a = SESSION.alerts[i];
    UI.modalTitle.textContent = a.event;
    UI.modalBody.innerHTML = `<strong>AREA:</strong> ${a.areaDesc}<br><br><strong>TELEMETRY:</strong><br>${a.description}<br><br><strong>PROTOCOL:</strong><br>${a.instruction}`;
    UI.alertModal.classList.remove('hidden');
}

function resetSystem() { location.reload(); }

function toggleAlerts() {
    if (!('Notification' in window)) {
        alert(UI_LABELS.err_notify);
        return;
    }
    Notification.requestPermission().then(p => {
        if (p === 'granted') {
            localStorage.setItem('vanguard_mx_alerts', 'true');
            UI.notifyBtn.style.color = "#00ff00";
        }
    });
}

async function fetchZip(zip) {
    try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (!res.ok) return;
        const data = await res.json();
        const stateCode = data.places[0]["state abbreviation"];
        const text = `${data.places[0]["place name"]}, ${stateCode}`;
        
        UI.autocompleteResults.innerHTML = '';
        const li = document.createElement('li');
        li.textContent = text;
        li.onclick = () => {
            UI.autocompleteResults.classList.add('hidden');
            handleLocationSelection(stateCode, text);
        };
        UI.autocompleteResults.appendChild(li);
        UI.autocompleteResults.classList.remove('hidden');
    } catch(e) {}
}

async function fetchCity(city) {
    try {
        const encodedVal = encodeURIComponent(city);
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedVal}&count=5&format=json`);
        const data = await res.json();
        
        if (!data.results) return; 

        const results = data.results.filter(x => x.country_code === "US");
        UI.autocompleteResults.innerHTML = '';
        
        results.forEach(p => {
            const state = CONFIG.STATE_MAP[p.admin1];
            if(!state) return;
            const li = document.createElement('li');
            li.textContent = `${p.name}, ${state}`;
            li.onclick = () => {
                UI.autocompleteResults.classList.add('hidden');
                handleLocationSelection(state, li.textContent);
            };
            UI.autocompleteResults.appendChild(li);
        });
        UI.autocompleteResults.classList.remove('hidden');
    } catch(e) {}
}
