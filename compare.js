// ---- CONFIG ----
const API_BASE = "https://betterpick1.onrender.com";
const SHELF_KEY = "betterpick_shelf";

const startPayload = JSON.parse(sessionStorage.getItem("bp_start_payload") || "null");
if (!startPayload || !startPayload.items || startPayload.items.length < 1) {
  location.href = "compare-start.html";
}

async function init(){
  try {
    let data;
    if (startPayload.mode === "names") {
      data = await fetchJSON("/api/compare", { items: startPayload.items });
    } else if (startPayload.mode === "urls") {
      data = await fetchJSON("/api/compare-url", { url: startPayload.items[0] });
    } else if (startPayload.mode === "search") {
      data = await fetchJSON("/api/compare-search", { query: startPayload.items[0] });
    }

    window._lastData = data;
    renderAll(data);
  } catch (err) {
    console.error("Compare failed:", err);
    alert("Comparison failed. Please try again.");
  }
}

async function fetchJSON(url, body) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Bad response");
  return res.json();
}

function renderAll(data) {
  const tbody = document.querySelector("#resultsTable tbody");
  const thead = document.querySelector("#resultsHead");
  tbody.innerHTML = "";
  thead.innerHTML = "";

  // 当前用户选择的列
  let activeCols = [...document.querySelectorAll("#criteriaControls input:checked")]
    .map(cb => cb.value);

  // 过滤掉全空列（除了 pros/cons/summary）
  activeCols = activeCols.filter(col => {
    if (["pros","cons","summary"].includes(col)) return true;
    return data.table.some(row => row[col] && String(row[col]).trim() !== "");
  });

  // 表头
  let headHTML = "<th>Item</th>";
  activeCols.forEach(col => {
    headHTML += `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`;
  });
  thead.innerHTML = headHTML;

  // 表格内容
  data.table.forEach((row, i) => {
    const tr = document.createElement("tr");
    let rowHTML = `<td><b>${esc(row.item)}</b></td>`;
    activeCols.forEach(col => {
      if (Array.isArray(row[col])) {
        rowHTML += `<td>${row[col].map(esc).join("<br>")}</td>`;
      } else {
        rowHTML += `<td>${esc(row[col] || "-")}</td>`;
      }
    });
    tr.innerHTML = rowHTML;
    tr.style.opacity = 0;
    tbody.appendChild(tr);

    // 小动画：逐行淡入
    setTimeout(() => { 
      tr.style.transition="opacity 0.5s"; 
      tr.style.opacity=1; 
    }, 100 * i);
  });

  // Winner 信息
  const winnerDiv = document.getElementById("winnerBlock");
  winnerDiv.textContent = `🏆 Winner: ${data.recommendation.winner} — ${data.recommendation.reason}`;

  // Pick 按钮
  renderPickButtons(data.table);
}

// 监听复选框变化 → 重新渲染
document.querySelectorAll("#criteriaControls input").forEach(cb => {
  cb.addEventListener("change", () => {
    if (window._lastData) renderAll(window._lastData);
  });
});

// ---- 新增功能：Pick 按钮 & 保存 ----
function renderPickButtons(items){
  const container = document.querySelector("#pickButtons");
  if (!container) return;

  container.innerHTML = startPayload.items.map((name,i) => `
    <button onclick='savePick(${JSON.stringify({ 
      id: name, 
      title: name, 
      summary: items[i]?.summary || "", 
      image: items[i]?.image || "", 
      url: items[i]?.url || "" 
    })})'>${esc(name)}</button>
  `).join("");
}

function savePick(item){
  let shelf = {};
  try { shelf = JSON.parse(localStorage.getItem(SHELF_KEY) || "{}"); } catch {}

  const key = "my_picks"; 
  if (!shelf[key]) shelf[key] = [];

  // ✅ 确保有 title
  const pickData = {
    id: item.id || item.item,
    title: item.title || item.item, 
    item: item.item,
    pros: item.pros || [],
    cons: item.cons || [],
    summary: item.summary || "",
    price: item.price || "",
    size: item.size || "",
    weight: item.weight || "",
    popularity: item.popularity || "",
    rating: item.rating || "",
    image: item.image || ""
  };

  if (!shelf[key].find(x => x.id === pickData.id)) {
    shelf[key].push(pickData);
    localStorage.setItem(SHELF_KEY, JSON.stringify(shelf));
    showToast(`✔️ Added ${pickData.title} to Your Pick`);
    showModal(pickData.title);  // ✅ 弹窗反馈在这里
  }
}

// ---- Toast ----
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 2000);
}

// ---- Modal ----
function showModal(title){
  let modal = document.getElementById("pickModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "pickModal";
    modal.style.cssText = `
      display:none;position:fixed;z-index:2000;left:0;top:0;width:100%;height:100%;
      background:rgba(0,0,0,0.4);justify-content:center;align-items:center;
    `;
    modal.innerHTML = `
      <div style="
        background:#fff;padding:20px 30px;border-radius:14px;text-align:center;
        box-shadow:0 10px 30px rgba(0,0,0,.2);max-width:320px;">
        <h2 style="margin:0 0 10px;font-size:20px;">✅ Your Pick Saved!</h2>
        <p style="margin:0 0 16px;color:#708090;font-size:14px;">
          ${title ? esc(title) : "Item"} has been added.<br>
          You can view it in <b>Your Pick</b>.
        </p>
        <button id="closeModal" style="
          padding:8px 16px;border:none;border-radius:10px;background:#ff8e72;color:#fff;
          font-weight:700;cursor:pointer;">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  const closeBtn = document.getElementById("closeModal");
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

function esc(s){
  return String(s).replace(/[&<>"']/g,c=>(
    {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]
  ));
}

init();
