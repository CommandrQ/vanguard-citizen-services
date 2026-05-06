let vCats = [], vRes = [], vServ = [], vAll = [];

window.onload = async () => {
    try {
        // Fetch all 4 files simultaneously
        const [cData, rData, sData, aData] = await Promise.all([
            fetch('categories.json').then(r => r.json()),
            fetch('resources.json').then(r => r.json()),
            fetch('services.json').then(r => r.json()),
            fetch('alliance.json').then(r => r.json()) // Updated filename here
        ]);

        vCats = cData; vRes = rData; vServ = sData; vAll = aData;

        buildTuner();
        renderWindows("All");
    } catch (e) {
        console.error("Data Sync Failure:", e);
    }
};

function buildTuner() {
    const bar = document.getElementById('cat-bar');
    vCats.forEach((cat, idx) => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${idx === 0 ? 'active' : ''}`;
        btn.innerText = cat.toUpperCase();
        btn.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWindows(cat);
        };
        bar.appendChild(btn);
    });
}

function renderWindows(filter) {
    const showAll = filter === "All";
    
    // Fill Window 1 (Resources)
    const resList = document.getElementById('res-list');
    resList.innerHTML = "";
    vRes.filter(r => showAll || r.cat === filter).forEach(item => {
        resList.innerHTML += `
            <div class="item-card">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <a href="${item.url}" class="item-action">ACCESS RESOURCE ></a>
            </div>`;
    });

    // Fill Window 2 (Internal Services)
    const servList = document.getElementById('internal-list');
    servList.innerHTML = "";
    vServ.filter(s => showAll || s.cat === filter).forEach(item => {
        servList.innerHTML += `
            <div class="item-card" style="border-left-color: #555;">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <span class="item-action" onclick="showRequestModal()">REQUEST VANGUARD ></span>
            </div>`;
    });

    // Fill Window 2 (External Alliance)
    const allList = document.getElementById('alliance-list');
    allList.innerHTML = "";
    vAll.filter(a => showAll || a.cat === filter).forEach(item => {
        allList.innerHTML += `
            <div class="item-card" style="border-left-color: #007ACC;">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
                <span class="item-action" onclick="showRequestModal()">REQUEST ALLIANCE ></span>
            </div>`;
    });
}

function showRequestModal() { document.getElementById('request-modal').classList.remove('hidden'); }
