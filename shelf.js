// ---- BetterPick / Your Picks (smart categories + reliable delete) ----
const SHELF_KEY = "betterpick_shelf";
const grid = document.getElementById("shelfGrid");

// ---------- utils ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function esc(s){
  return String(s).replace(/[&<>"']/g,c=>(
    {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]
  ));
}
function loadRaw() {
  try { return JSON.parse(localStorage.getItem(SHELF_KEY) || "null"); }
  catch { return null; }
}
function saveShelf(groupedObj){
  localStorage.setItem(SHELF_KEY, JSON.stringify(groupedObj));
}

// ---------- smart category detector ----------
function detectCategory(title = "") {
  const t = title.toLowerCase();
  if (/(iphone|samsung|pixel|xiaomi|huawei|oneplus|smartphone|phone)\b/.test(t)) return "Smartphones";
  if (/(laptop|notebook|macbook|asus|dell|lenovo|thinkpad|msi|acer)\b/.test(t)) return "Laptops";
  if (/(ipad|tablet|surface)\b/.test(t)) return "Tablets";
  if (/(tv|display|monitor|oled|qled|ips)\b/.test(t)) return "Displays";
  if (/(watch|rolex|omega|cartier|garmin|fitbit|iwatch|apple watch)\b/.test(t)) return "Watches";
  if (/(headphone|earbuds|airpods|sony wf|xm5|buds)\b/.test(t)) return "Audio";
  if (/(camera|canon|nikon|sony a|fuji|leica)\b/.test(t)) return "Cameras";
  if (/(tesla|bmw|mercedes|toyota|honda|audi|porsche|car)\b/.test(t)) return "Cars";
  return "Others";
}

// ---------- normalize & migrate ----------
function normalizeShelf(raw) {
  const grouped = {};
  const push = (it, catHint=null) => {
    if (!it) return;
    let title = String(it.title || it.name || it.item || "").trim();
    if (!title) title = "(untitled)"; // ✅兜底

    const sub   = String(it.sub || it.subtitle || it.summary || "").trim();
    const image = String(it.image || it.img || "").trim();
    const id = String(it.id ?? uid());
    const category = String(it.category || catHint || detectCategory(title));

    const norm = { id, title, sub, image, category };
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(norm);
  };

  if (!raw) return {};

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const keys = Object.keys(raw);
    const likelyGrouped = keys.every(k => Array.isArray(raw[k]));
    if (likelyGrouped) {
      keys.forEach(cat => {
        const arr = Array.isArray(raw[cat]) ? raw[cat] : [raw[cat]];
        arr.forEach(it => push(it, cat));
      });
      return grouped;
    }
    keys.forEach(k => {
      const v = raw[k];
      if (Array.isArray(v)) v.forEach(it => push(it));
      else push(v);
    });
    return grouped;
  }

  if (Array.isArray(raw)) {
    raw.forEach(it => push(it));
    return grouped;
  }

  return {};
}

function loadShelf() {
  const raw = loadRaw();
  const grouped = normalizeShelf(raw);
  saveShelf(grouped);
  return grouped;
}

// ---------- render ----------
function renderShelf(){
  const shelf = loadShelf();
  grid.innerHTML = "";

  const categories = Object.keys(shelf).sort((a,b)=> a.localeCompare(b));
  if (!categories.length){
    grid.innerHTML = `<p style="text-align:center;color:var(--muted)">No saved items yet.</p>`;
    return;
  }

  categories.forEach(catKey => {
    const items = (shelf[catKey] || []).slice().sort((a,b)=> a.title.localeCompare(b.title));
    if (!items.length) return;

    const block = document.createElement("div");
    block.className = "cat-block";
    const catName = catKey.replace(/_/g," ");
    block.innerHTML = `<h2>${esc(catName)}</h2><div class="items"></div>`;
    const itemsWrap = block.querySelector(".items");

    items.forEach((it, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.opacity = 0;
      card.innerHTML = `
        <div class="info">
          ${it.image ? `<img src="${esc(it.image)}" alt="">` : `<div style="width:60px;height:60px;background:#eee;border-radius:10px"></div>`}
          <div>
            <h4>${esc(it.title)}</h4>
            <div class="sub">${esc(it.sub || "")}</div>
          </div>
        </div>
        <button class="delete-btn" title="Remove" data-cat="${esc(catKey)}" data-id="${esc(it.id)}">🗑️</button>
      `;
      itemsWrap.appendChild(card);

      setTimeout(() => {
        card.style.transition="opacity 0.5s";
        card.style.opacity=1;
      }, idx * 120);
    });

    grid.appendChild(block);
  });

  wireDelete();
}

function wireDelete(){
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const cat = btn.getAttribute("data-cat");
      const id  = btn.getAttribute("data-id");
      removeItem(cat, id);
    });
  });
}

// ---------- delete ----------
function removeItem(catKey, id){
  const shelf = loadShelf();
  const idStr = String(id);
  if (!shelf[catKey] || !Array.isArray(shelf[catKey])) return;

  let arr = shelf[catKey];
  let next = arr.filter(it => String(it.id) !== idStr);

  if (next.length === arr.length) {
    const victim = arr.find(it => String(it.id) === idStr) || arr[0];
    if (victim && victim.title) {
      next = arr.filter(it => it.title !== victim.title);
    }
  }

  shelf[catKey] = next;
  if (shelf[catKey].length === 0) delete shelf[catKey];

  saveShelf(shelf);
  renderShelf();
}

// ---------- clear all ----------
const clearBtn = document.getElementById("clearAll");
if (clearBtn) {
  clearBtn.addEventListener("click", ()=>{
    if (confirm("Are you sure you want to clear all saved items?")) {
      localStorage.removeItem(SHELF_KEY);
      renderShelf();
    }
  });
}

renderShelf();
