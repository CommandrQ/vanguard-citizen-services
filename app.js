/* --- SUPABASE INITIALIZATION --- */
const supabaseUrl = 'https://dvyjupytbwbrcoyouxpf.supabase.co';
const supabaseKey = 'sb_publishable_wjgbPekKmodd5mSDXIeUeg_Wq73GzOk';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

/* --- DIRECTORY DATA --- */
const directoryDataRaw = {
    "Vanguard Tech Lab": [
        { 
            title: "Tech Consulting", 
            desc: "Expert technology support and and coaching for Hardin County.", 
            url: "vsr/techhelp.html" 
        }
    ],
    "System": [
        { 
            title: "About Vanguard", 
            desc: "Learn about our mission, our military roots, and our commitment to the Citizens of Hardin County.", 
            url: "about.html" 
        },
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

/* --- STATE MANAGEMENT --- */
let currentCategory = Object.keys(directoryDataRaw)[0];

/* --- RENDER LOGIC --- */
function renderHub(category = currentCategory, filterText = "") {
    const nav = document.getElementById('category-bar');
    const list = document.getElementById('directory-list');
    
    if (!list) return;

    if (filterText.trim() === "") {
        currentCategory = category; 
        
        if (nav) {
            nav.style.display = 'flex'; 
            nav.innerHTML = Object.keys(directoryDataRaw).map(cat => `
                <button class="cat-btn ${cat === currentCategory ? 'active' : ''}" 
                        onclick="renderHub('${cat}')">${cat}</button>
            `).join('');
        }

        const items = directoryDataRaw[currentCategory] || [];
        list.innerHTML = items.map(item => `
            <div class="link-card">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.desc}</p>
                <a href="${item.url}" class="card-btn">Go</a>
            </div>
        `).join('');

    } else {
        if (nav) nav.style.display = 'none'; 
        
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

/* --- SEARCH FUNCTIONALITY --- */
const searchInput = document.getElementById('hub-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderHub(currentCategory, e.target.value);
    });
}

/* --- USER INTERFACE & AUTH --- */
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

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash.includes('access_token')) {
        sessionStorage.setItem('just_logged_in', 'true');
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    updateUI();
    renderHub(); 
});
