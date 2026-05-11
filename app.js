// --- INITIALIZE SUPABASE ---
const supabaseUrl = 'YOUR_URL_HERE';
const supabaseKey = 'YOUR_KEY_HERE';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- RESOURCE DATA ---
const directoryDataRaw = {
    "Vanguard Tech Lab": [
        { title: "Tech Consulting", desc: "Support for seniors, parents, and high-performance individuals.", url: "vsr/techhelp.html" }
    ],
    "System Settings": [
        { title: "Support Terminal", desc: "Open a direct uplink for technical inquiries.", url: "support.html" },
        { title: "Legal Documents", desc: "Agreement protocols and privacy standards.", url: "legal.html" }
    ]
};

// --- RENDER HUB ---
function renderHub(category = Object.keys(directoryDataRaw)[0]) {
    const nav = document.getElementById('category-bar');
    const list = document.getElementById('directory-list');
    if (!nav || !list) return;

    nav.innerHTML = Object.keys(directoryDataRaw).map(cat => `
        <button class="cat-btn ${cat === category ? 'active' : ''}" onclick="renderHub('${cat}')">${cat}</button>
    `).join('');

    list.innerHTML = directoryDataRaw[category].map(item => `
        <div class="link-card">
            <h3 style="color: var(--gold); margin: 0 0 10px;">${item.title}</h3>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 20px;">${item.desc}</p>
            <a href="${item.url}" class="card-btn">Initialize</a>
        </div>
    `).join('');
}

// --- AUTH & UI LOGIC ---
async function updateUI() {
    const greeting = document.getElementById('user-greeting');
    const toast = document.getElementById('login-toast');
    if (!greeting) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    const cached = JSON.parse(localStorage.getItem('vanguard_profile'));

    if (user) {
        const name = (cached && cached.name) ? cached.name : "Citizen";
        greeting.innerText = `Welcome, ${name}`;

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
        localStorage.removeItem('vanguard_profile');
    }
}

// --- SYSTEM BOOT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for Magic Link redirect
    if (window.location.hash.includes('access_token')) {
        sessionStorage.setItem('just_logged_in', 'true');
    }

    // 2. Set Year
    const year = document.getElementById('current-year');
    if (year) year.innerText = new Date().getFullYear();

    // 3. Start Interface
    updateUI();
    renderHub();
});
