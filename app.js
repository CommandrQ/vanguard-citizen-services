// ==========================================
// VANGUARD COMMAND LOGIC v3.1
// ==========================================

// 1. SUPABASE INITIALIZATION
const supabaseUrl = 'https://dvyjupytbwbrcoyouxpf.supabase.co';
const supabaseKey = 'sb_publishable_wjgbPekKmodd5mSDXIeUeg_Wq73GzOk';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. THE RESOURCE DIRECTORY
const directoryDataRaw = {
    "Vanguard Tech Lab": [
        { 
            title: "Tech Consulting", 
            desc: "Easy tech support sessions and classes.", 
            url: "vsr/techhelp.html" 
        }
    ],
    "System": [
        { 
            title: "Support Terminal", 
            desc: "Connect directly with Vanguard support for technical help or general inquiries.", 
            url: "support.html" 
        },
        { 
            title: "Legal Documents", 
            desc: "Review our Citizen Agreements, Privacy Protocols, and Service Terms.", 
            url: "legal.html" 
        }
    ]
};

// 3. RENDER THE HUB
function renderHub(category = Object.keys(directoryDataRaw)[0], filterText = "") {
    const nav = document.getElementById('category-bar');
    const list = document.getElementById('directory-list');
    if (!nav || !list) return;

    // Render Navigation (Enlarged Buttons)
    nav.innerHTML = Object.keys(directoryDataRaw).map(cat => `
        <button class="cat-btn ${cat === category ? 'active' : ''}" 
                onclick="renderHub('${cat}')">${cat}</button>
    `).join('');

    // Filter and Render Cards
    const items = directoryDataRaw[category].filter(item => 
        item.title.toLowerCase().includes(filterText.toLowerCase()) || 
        item.desc.toLowerCase().includes(filterText.toLowerCase())
    );

    list.innerHTML = items.map(item => `
        <div class="link-card">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.desc}</p>
            <a href="${item.url}" class="card-btn">Go</a>
        </div>
    `).join('');
}

// 4. AUTH & IDENTITY GREETING
async function updateUI() {
    const greeting = document.getElementById('user-greeting');
    const toast = document.getElementById('login-toast');
    if (!greeting) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    const cached = JSON.parse(localStorage.getItem('vanguard_profile'));

    if (user) {
        // Use the name they registered with, otherwise default to Citizen
        const displayName = (cached && cached.name) ? cached.name : "Citizen";
        greeting.innerText = `Welcome, ${displayName}`;

        // Trigger Success Notification if just arriving from Magic Link
        if (sessionStorage.getItem('just_logged_in') === 'true') {
            if (toast) {
                toast.innerText = "Uplink Established: Signed In";
                toast.classList.add('active');
                setTimeout(() => toast.classList.remove('active'), 5000);
            }
            sessionStorage.removeItem('just_logged_in');
        }
    } else {
        greeting.innerText = "Welcome";
        // Do not clear cache if they are just guest browsing
    }
}

// 5. SEARCH SYSTEM
const searchInput = document.getElementById('hub-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        // Keep current active category and filter cards
        const activeBtn = document.querySelector('.cat-btn.active');
        const currentCat = activeBtn ? activeBtn.innerText : Object.keys(directoryDataRaw)[0];
        renderHub(currentCat, e.target.value);
    });
}

// 6. SYSTEM BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    // Check for Magic Link token in URL
    if (window.location.hash.includes('access_token')) {
        sessionStorage.setItem('just_logged_in', 'true');
    }

    // Set Footer Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    // Start UI
    updateUI();
    renderHub();
});
