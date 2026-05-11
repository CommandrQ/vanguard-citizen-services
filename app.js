// Global State
let globalDirectoryData = {};
let uiElements = {};

document.addEventListener('DOMContentLoaded', () => {
    
    // --- GATE LOGIC (index.html) ---
    const enterBtn = document.getElementById('enter-btn');
    const fadeOverlay = document.getElementById('fade-overlay');

    if (enterBtn && fadeOverlay) {
        enterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = enterBtn.getAttribute('href');
            fadeOverlay.classList.add('active');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1000); 
        });
    }

    // --- SHARED LOGIC ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    // --- APP LOGIC (hub.html) ---
    if (document.getElementById('directory-core')) {
        initHub();
    }
});

function initHub() {
    const SB_URL = 'https://dvyjupytbwbrcoyouxpf.supabase.co';
    const SB_KEY = 'sb_publishable_wjgbPekKmodd5mSDXIeUeg_Wq73GzOk';
    const supabaseClient = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

    const directoryDataRaw = {
        "Vanguard Tech Lab": [
            { title: "Tech Consulting", desc: "Digital or in-person help understanding and connecting with technology.", url: "vsr/techhelp.html" }
        ],
        "System Settings": [
            { title: "Citizen Profile", desc: "Manage your connection and digital sanctuary preferences here.", url: "settings.html" },
            { title: "Legal Documents", desc: "Review the current Terms of Use and Privacy Policy.", url: "legal.html" }
        ]
    };

    globalDirectoryData = sortVanguardData(directoryDataRaw);

    uiElements = {
        greeting: document.getElementById('user-greeting'),
        pop: document.getElementById('population-count'),
        catBar: document.getElementById('category-bar'),
        dirList: document.getElementById('directory-list'),
        searchInput: document.getElementById('hub-search')
    };

    const cached = JSON.parse(localStorage.getItem('vanguard_profile'));
    if (cached && cached.name && uiElements.greeting) {
        uiElements.greeting.innerText = `Welcome, ${cached.name}`;
    }

    if (supabaseClient) {
        checkUser(supabaseClient, uiElements);
        fetchPop(supabaseClient, uiElements);
    }
    
    renderHub(globalDirectoryData, uiElements);
    startFooterCycle();

    uiElements.searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderHub(globalDirectoryData, uiElements);
            return;
        }

        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        const matches = [];
        Object.values(globalDirectoryData).forEach(categoryArray => {
            categoryArray.forEach(card => {
                if (card.title.toLowerCase().includes(term) || card.desc.toLowerCase().includes(term)) {
                    matches.push(card);
                }
            });
        });

        matches.sort((a, b) => a.title.localeCompare(b.title));
        if (matches.length > 0) { renderCards(matches, uiElements); }
        else { uiElements.dirList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">No matching tech resources found.</div>'; }
    });
}

function sortVanguardData(data) {
    const sortedData = {};
    const categories = Object.keys(data).sort();
    categories.forEach(category => {
        sortedData[category] = data[category].sort((a, b) => a.title.localeCompare(b.title));
    });
    return sortedData;
}

async function checkUser(client, ui) {
    const { data: { user } } = await client.auth.getUser();
    if (user && ui.greeting) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        ui.greeting.innerText = `Welcome, ${name}`;
        localStorage.setItem('vanguard_profile', JSON.stringify({ name: name, email: user.email }));
    }
}

async function fetchPop(client, ui) {
    const { count, error } = await client.from('citizens').select('*', { count: 'exact', head: true });
    if (ui.pop) { ui.pop.innerText = error ? "Online" : count.toLocaleString(); }
}

function renderHub(data, ui) {
    const categories = Object.keys(data);
    ui.catBar.innerHTML = categories.map((cat, i) => `
        <button class="cat-btn ${i === 0 ? 'active' : ''}" onclick="showCat('${cat}', this)">${cat}</button>
    `).join('');
    if(categories.length > 0) { window.showCat(categories[0], ui.catBar.querySelector('.cat-btn')); }
}

window.showCat = (name, btn) => {
    if(uiElements.searchInput) uiElements.searchInput.value = '';
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    if(btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    if(globalDirectoryData[name]) { renderCards(globalDirectoryData[name], uiElements); }
}

function renderCards(cardsArray, ui) {
    if(ui.dirList) {
        ui.dirList.innerHTML = cardsArray.map((card, index) => `
            <div class="link-card" style="animation-delay: ${index * 0.05}s">
                <h3 class="card-title">${card.title}</h3>
                <p class="card-desc">${card.desc}</p>
                <a href="${card.url}" class="card-btn">Open</a>
            </div>
        `).join('');
    }
}

function startFooterCycle() {
    const msg1 = document.getElementById('footer-msg-1');
    const msg2 = document.getElementById('footer-msg-2');
    setInterval(() => {
        if (msg1 && msg1.classList.contains('active')) {
            msg1.classList.remove('active');
            setTimeout(() => { if(msg2) msg2.classList.add('active'); }, 800); 
        } else {
            if(msg2) msg2.classList.remove('active');
            setTimeout(() => { if(msg1) msg1.classList.add('active'); }, 800);
        }
    }, 4000);
}
