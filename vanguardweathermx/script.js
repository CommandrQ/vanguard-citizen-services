// --- SYSTEM CONFIGURATION ---
const STATE_MAP = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
    "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
    "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

const USER_AGENT = '(Vanguard Weather Mx, commandrq@gmail.com)';

// --- TEMPORARY SESSION MEMORY ---
let activeMonitoringSector = null; 
let currentAlertsData = [];
let lastSeenAlertId = null;

// --- SYSTEM BOOT & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('update-btn');
    const resetBtn = document.getElementById('reset-loc-btn');
    const geoBtn = document.getElementById('geo-btn');
    const searchInput = document.getElementById('location-search');
    const resultsList = document.getElementById('autocomplete-results');
    const notifyBtn = document.getElementById('notify-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('alert-modal');

    // Event Listeners
    updateBtn.addEventListener('click', () => {
        if (activeMonitoringSector) executeWeatherSweep(activeMonitoringSector);
    });

    geoBtn.addEventListener('click', () => {
        searchInput.placeholder = "Acquiring coordinates...";
        requestGeolocation();
    });

    resetBtn.addEventListener('click', () => {
        activeMonitoringSector = null; // Purge temporary memory
        searchInput.value = '';
        searchInput.placeholder = 'Enter City or Zip';
        updateUI('status-green', 'AWAITING LOCATION DATA.', 'Enter your sector to begin monitoring.', '<p>System standing by...</p>');
    });

    notifyBtn.addEventListener('click', requestNotificationPermission);
    
    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking outside the box
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Background Polling (3 Minutes)
    setInterval(() => {
        if (activeMonitoringSector) executeWeatherSweep(activeMonitoringSector, true);
    }, 180000);

    // Autocomplete Input Logic
    let timeoutId;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            resultsList.classList.add('hidden');
            return;
        }

        timeoutId = setTimeout(() => {
            if (/^\d{5}$/.test(query)) {
                fetchZipCode(query);
            } else if (!/^\d/.test(query)) {
                fetchCityData(query);
            }
        }, 500);
    });

    // Hide autocomplete menu if clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            resultsList.classList.add('hidden');
        }
    });
});

// --- LOCATION LOGIC ---

function requestGeolocation() {
    const searchInput = document.getElementById('location-search');
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
                        headers: { 'User-Agent': USER_AGENT }
                    });
                    if (!response.ok) throw new Error('NWS Point API Failed');
                    const data = await response.json();
                    const stateCode = data.properties.relativeLocation.properties.state;
                    commitLocation(stateCode, stateCode);
                } catch (error) {
                    alert("VANGUARD COMMAND: Unable to verify state from coordinates. Please enter manually.");
                    enableManualSearch();
                }
            },
            (error) => {
                console.warn("Geolocation Error:", error.message);
                alert("VANGUARD COMMAND: Location access blocked by your browser. You must allow location access or type your sector manually.");
                enableManualSearch();
            }
        );
    } else {
        alert("VANGUARD COMMAND: Geolocation is not supported by this device.");
        enableManualSearch();
    }
}

function enableManualSearch() {
    const searchInput = document.getElementById('location-search');
    searchInput.placeholder = "Enter City or Zip";
    searchInput.value = "";
}

function commitLocation(stateCode, displayText) {
    const searchInput = document.getElementById('location-search');
    const resultsList = document.getElementById('autocomplete-results');
    
    activeMonitoringSector = stateCode; // Lock into session memory
    
    searchInput.value = displayText;
    resultsList.classList.add('hidden');
    executeWeatherSweep(stateCode);
}

// --- FALLBACK SEARCH APIs ---

async function fetchZipCode(zip) {
    try {
        const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (!response.ok) return;
        const data = await response.json();
        const stateCode = data.places[0]["state abbreviation"];
        const city = data.places[0]["place name"];
        renderSuggestions([{ display: `${city}, ${stateCode} (${zip})`, stateCode: stateCode }]);
    } catch (error) { console.error("Zip Fetch Error"); }
}

async function fetchCityData(city) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&format=json`);
        const data = await response.json();
        if (!data.results) return;

        const suggestions = data.results
            .filter(place => place.country_code === "US")
            .map(place => {
                const stateCode = STATE_MAP[place.admin1];
                return { display: `${place.name}, ${stateCode || place.admin1}`, stateCode: stateCode };
            })
            .filter(item => item.stateCode);
        renderSuggestions(suggestions);
    } catch (error) { console.error("City Fetch Error"); }
}

function renderSuggestions(suggestions) {
    const resultsList = document.getElementById('autocomplete-results');
    resultsList.innerHTML = '';
    if (suggestions.length === 0) {
        resultsList.classList.add('hidden');
        return;
    }
    suggestions.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.display;
        li.addEventListener('click', () => commitLocation(item.stateCode, item.display));
        resultsList.appendChild(li);
    });
    resultsList.classList.remove('hidden');
}

// --- NWS DATA BRIDGE ---

async function executeWeatherSweep(stateCode, isBackground = false) {
    const state = stateCode.toUpperCase().trim();
    const cacheBuster = Date.now();
    const apiUrl = `https://api.weather.gov/alerts/active?area=${state}&cb=${cacheBuster}`;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'User-Agent': USER_AGENT },
            cache: 'no-store'
        });
        if (!response.ok) throw new Error('API Bridge Failed.');
        const data = await response.json();
        processTelemetry(data.features, state);
    } catch (error) {
        console.error("Telemetry Error:", error);
        updateUI('status-offline', 'DATA FEED OFFLINE.', 'Check your internet connection. NWS feed unreachable.', '<p>SYSTEM ERROR.</p>');
    }
}

function processTelemetry(alerts, stateCode) {
    currentAlertsData = alerts.map(alert => alert.properties);
    const tornadoWarning = currentAlertsData.find(e => e.event === 'Tornado Warning');
    const severeWarning = currentAlertsData.find(e => e.event === 'Severe Thunderstorm Warning' || e.event === 'Flash Flood Warning');

    let bulletinHTML = '';

    if (currentAlertsData.length === 0) {
        bulletinHTML = `<p>There are currently no active alerts in ${stateCode}.</p>`;
    } else {
        currentAlertsData.forEach((e, index) => {
            const isTornado = e.event === 'Tornado Warning' ? 'tornado-alert' : '';
            bulletinHTML += `<div class="alert-item ${isTornado}" onclick="openAlertModal(${index})">
                [CLICK TO READ]: ${e.event}
            </div>`;
        });
    }

    // Trigger OS Notification if a new alert appears (using session memory)
    const latestAlertId = alerts.length > 0 ? alerts[0].properties.id : null;

    if (latestAlertId && latestAlertId !== lastSeenAlertId) {
        lastSeenAlertId = latestAlertId;
        if (tornadoWarning) triggerSystemAlert("TORNADO WARNING", `Active threat in ${stateCode}. Take immediate shelter.`);
        else if (severeWarning) triggerSystemAlert(`${severeWarning.event.toUpperCase()}`, `Active threat in ${stateCode}. Secure your location.`);
    }

    // Execute UI Updates with Calming/Simple Instructions
    if (tornadoWarning) {
        updateUI(
            'status-red', 
            `TORNADO WARNING: ${tornadoWarning.areaDesc}`, 
            'Please move calmly to a basement or an interior room on the lowest floor. Stay away from windows. You have time to get safe if you act now.', 
            bulletinHTML
        );
    } else if (severeWarning) {
        updateUI(
            'status-orange', 
            `${severeWarning.event.toUpperCase()} ACTIVE.`, 
            'Please stay indoors and away from windows until the storm passes. Take a moment to secure any loose items outside.', 
            bulletinHTML
        );
    } else {
        updateUI(
            'status-green', 
            `ALL CLEAR IN ${stateCode}.`, 
            'There are no forecasted threats at this time. Maintain standard readiness and enjoy your day.', 
            bulletinHTML
        );
    }
}

function updateUI(statusClass, bannerText, actionText, bulletinHTML) {
    const dashboard = document.getElementById('dashboard');
    const primaryAlert = document.getElementById('primary-alert');
    const beginnerAction = document.getElementById('beginner-action');
    const chaserBulletin = document.getElementById('chaser-bulletin');

    dashboard.className = '';
    dashboard.classList.add(statusClass);
    primaryAlert.textContent = bannerText;
    beginnerAction.innerHTML = `<p>${actionText}</p>`;
    chaserBulletin.innerHTML = bulletinHTML;
}

// --- MODAL & NOTIFICATION BRIDGE ---

function openAlertModal(index) {
    const alertData = currentAlertsData[index];
    if (!alertData) return;

    const modal = document.getElementById('alert-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = alertData.event;
    
    // Formatting the raw NWS text logically
    let bodyContent = `<strong>Area:</strong> ${alertData.areaDesc}<br><br>`;
    bodyContent += `<strong>Description:</strong><br>${alertData.description || 'No description provided by NWS.'}<br><br>`;
    if (alertData.instruction) {
        bodyContent += `<strong>Instructions:</strong><br>${alertData.instruction}<br><br>`;
    }
    
    modalBody.innerHTML = bodyContent;
    modal.classList.remove('hidden');
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support system notifications.");
        return;
    }
    Notification.requestPermission().then(permission => {
        const notifyBtn = document.getElementById('notify-btn');
        if (permission === "granted") {
            notifyBtn.textContent = "ALERTS ACTIVE";
            notifyBtn.style.background = "#005500";
            new Notification("Vanguard Weather MX", { body: "System communications established." });
        }
    });
}

function triggerSystemAlert(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: body, requireInteraction: true });
    }
}
