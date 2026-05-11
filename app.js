// ==========================================
// VANGUARD MASTER LOGIC ENGINE
// ==========================================

// 1. INITIALIZE SUPABASE (Ensure your keys are here!)
const supabaseUrl = 'https://dvyjupytbwbrcoyouxpf.supabase.co';
const supabaseKey = 'sb_publishable_wjgbPekKmodd5mSDXIeUeg_Wq73GzOk';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. THE DIRECTORY DATA
const directoryDataRaw = {
    "Vanguard Tech Lab": [
        { 
            title: "Tech Consulting", 
            desc: "Personalized strategy for seniors, parents, and high-performance individuals.", 
            url: "vsr/techhelp.html" 
        }
    ],
    "System Settings": [
        { 
            title: "Support Terminal", 
            desc: "Establish a direct uplink for technical help or general inquiries.", 
            url: "support.html" 
        },
        { 
            title: "Legal Documents", 
            desc: "Review the Citizen Agreement and Privacy Protocols.", 
            url: "legal.html" 
        }
    ]
};

// 3. RENDER THE HUB
function renderHub(category = Object.keys(directoryDataRaw)[0]) {
    const nav = document.getElementById('category-bar');
    const list = document.getElementById('directory-list');

    // Safety check: if these don't exist (like on the settings page), stop.
    if (!nav || !list) return;

    // Render Category Buttons
    nav.innerHTML = Object.keys(directoryDataRaw).map(cat => `
        <button class="cat-btn ${cat === category ? 'active' : ''}" 
                onclick="renderHub('${cat}')">${cat}</button>
    `).join('');

    // Render Cards
    const items = directoryDataRaw[category];
    list.innerHTML = items.map(item => `
        <div class="link-card">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.desc}</p>
            <a href="${item.url}" class="card-btn">Open Link</a>
        </div>
    `).join('');
}

// 4. AUTH & GREETING LOGIC
async function updateUI() {
    const greeting = document.getElementById('user-greeting');
    if (!greeting) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    const cached = JSON.parse(localStorage.getItem('vanguard_profile'));

    if (user && cached && cached.name) {
        greeting.innerText = `Welcome, ${cached.name}`;
    } else if (user) {
        greeting.innerText = "Welcome, Citizen";
    } else {
        greeting.innerText = "Welcome";
    }
}

// 5. BOOTSTRAP SYSTEM
document.addEventListener('DOMContentLoaded', () => {
    // Fill in current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    // Start UI
    updateUI();
    renderHub();
});
