// ==========================================
// VANGUARD COMMAND LOGIC v3.3
// ==========================================

// 1. SUPABASE INITIALIZATION
const supabaseUrl = 'https://dvyjupytbwbrcoyouxpf.supabase.co';
const supabaseKey = 'sb_publishable_wjgbPekKmodd5mSDXIeUeg_Wq73GzOk';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. THE RESOURCE DIRECTORY (Renamed System Settings -> System)
const directoryDataRaw = {
    "Vanguard Tech Lab": [
        { 
            title: "Tech Consulting", 
            desc: "Expert strategy and support sessions for seniors, parents, and high-performance individuals.", 
            url: "vsr/techhelp.html" 
        }
    ],
    "System": [ // Renamed for a sleeker interface
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

// 3. RENDER & OMNI-SEARCH LOGIC
let currentCategory = Object.keys(directoryDataRaw)[0];

function renderHub(category = currentCategory, filterText = "") {
    const nav = document.getElementById('category-bar');
    const list = document.getElementById('directory-list');
    if (!nav || !list) return;

    if (filterText.trim() === "") {
        currentCategory = category; 
        nav.style.display = 'flex'; 
        
        nav.innerHTML = Object.keys(directoryDataRaw).map(cat => `
            <button class="cat-btn ${cat === currentCategory ? 'active' : ''}" 
                    onclick="renderHub('${cat}')">${cat}</button>
        `).join('');

        const items = directoryDataRaw[currentCategory];
        list.innerHTML = items.map(item => `
            <div class="link-card">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.desc}</p>
                <a href="${item.url}" class="card-btn">Go</a>
            </div>
        `).join('');

    } else {
        nav.style.display = 'none'; 
        
        let allItems = [];
        for (let cat in directoryDataRaw) {
            allItems = allItems.concat(directoryDataRaw[cat]);
        }

        const matched = allItems.filter(item => 
            item.title.toLowerCase().includes(filterText.toLowerCase()) || 
            item.desc.toLowerCase().includes(filterText.toLowerCase())
        );

        if (matched.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; margin-top: 60px; opacity: 0.6;">
                    <p style="color: var(--gold); font-weight: 800; letter-spacing: 3px;">NO SYSTEMS FOUND</p>
                    <p style="font-size: 0.8rem; color: #fff;">Adjust your search parameters.</p>
                </div>
            `;
        } else {
            list.innerHTML = matched.map(item => `
                <div class="link-card">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-desc">${item.desc}</p>
                    <a href="${item.url}" class="card-btn">Go</a>
                </div>
            `).join('');
        }
    }
}

// 4. SEARCH BAR EVENT LISTENER
const searchInput = document.getElementById('hub-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderHub(currentCategory, e.target.value);
    });
}

// 5. AUTH & IDENTITY GREETING
async function updateUI() {
    const greeting = document.getElementById('user-greeting');
    const toast = document.getElementById('login-toast');
    if (!greeting) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    const cached = JSON.parse(localStorage.getItem('vanguard_profile'));

    if (user) {
        const displayName = (cached && cached.name) ? cached.name : "Citizen";
        greeting.innerText = `Welcome, ${displayName}`;

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
    }
}

// 6. SYSTEM BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash.includes('access_token')) {
        sessionStorage.setItem('just_logged_in', 'true');
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    updateUI();
    renderHub(); 
});
