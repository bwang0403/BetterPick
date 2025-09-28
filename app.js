const API_BASE = "https://server-1iim43haq-alyssas-projects-85017d69.vercel.app";


async function main(){
  const raw = sessionStorage.getItem('bp_items');
  const items = raw ? JSON.parse(raw) : [];
  if(!items.length){
    document.getElementById('table').innerHTML = '<p>没有传入要比较的对象。</p>';
    return;
  }

  try{
    const res = await fetch(`${API_BASE}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ items })
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    render(data);
  }catch(err){
    document.getElementById('table').innerHTML = `<pre>请求失败：${String(err)}</pre>`;
  }
}

function render(data){
  const { criteria = [], table = [], recommendation } = data;

  // criteria
  document.getElementById('criteria').innerHTML =
    criteria.length ? `<h2>评价标准</h2><ul>${criteria.map(c=>`<li>${c}</li>`).join('')}</ul>` : '';

  // table
  const header = `<tr><th>对象</th><th>优点</th><th>缺点</th><th>总结</th></tr>`;
  const rows = table.map(r => `
    <tr>
      <td>${escapeHtml(r.item)} 
          <button onclick="selectItem('${escapeHtml(r.item)}')">选择</button>
      </td>
      <td>${(r.pros||[]).map(escapeHtml).join('<br>')}</td>
      <td>${(r.cons||[]).map(escapeHtml).join('<br>')}</td>
      <td>${escapeHtml(r.summary||'')}</td>
    </tr>`).join('');
  document.getElementById('table').innerHTML = `<table>${header}${rows}</table>`;

  // recommendation
  if(recommendation?.winner){
    document.getElementById('recommendation').innerHTML =
      `<h2>推荐</h2><div class="callout">✅ ${escapeHtml(recommendation.winner)} —— ${escapeHtml(recommendation.reason||'')}</div>`;
  }
}

function selectItem(item){
  let records = JSON.parse(localStorage.getItem("bp_records") || "[]");
  const category = classify(item);
  records.push({ item, category });
  localStorage.setItem("bp_records", JSON.stringify(records));
  alert(`已记录: ${item} → ${category}`);
}

function classify(name){
  name = name.toLowerCase();
  if(name.includes("house")) return "Property > Houses";
  if(name.includes("car")) return "Property > Cars";
  if(name.includes("bed")||name.includes("sofa")) return "Property > Furniture";
  if(name.includes("computer")||name.includes("macbook")||name.includes("laptop")) return "Digital Life > Computer";
  if(name.includes("phone")||name.includes("iphone")||name.includes("samsung")) return "Digital Life > Phone";
  if(name.includes("watch")) return "Clothes & Jewelry > Watches";
  if(name.includes("bag")) return "Clothes & Jewelry > Bags";
  return "Uncategorized";
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

main();
