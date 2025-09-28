const API_BASE = "http://localhost:8787"; // 部署时改成 vercel/render 地址

// URL 搜索
document.getElementById("urlSearch").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value.trim();
  if (!url) return alert("请输入网址");
  const res = await fetch(`${API_BASE}/api/compare-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  sessionStorage.setItem("bp_items", JSON.stringify(data.items));
  location.href = "./compare.html";
});

// 名称搜索
document.getElementById("nameSearch").addEventListener("click", async () => {
  const query = document.getElementById("nameInput").value.trim();
  if (!query) return alert("请输入产品名称");
  const res = await fetch(`${API_BASE}/api/compare-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  sessionStorage.setItem("bp_items", JSON.stringify(data.items));
  location.href = "./compare.html";
});

// 分类展示
function renderCategories() {
  const records = JSON.parse(localStorage.getItem("bp_records") || "[]");
  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r.item);
  });

  let html = "<ul>";
  for (const [cat, items] of Object.entries(grouped)) {
    html += `<li><b>${cat}</b><ul>${items.map(i=>`<li>${i}</li>`).join("")}</ul></li>`;
  }
  html += "</ul>";
  document.getElementById("categories").innerHTML = html || "<p>暂无记录</p>";
}

renderCategories();
