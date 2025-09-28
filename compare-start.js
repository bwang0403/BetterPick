/* BetterPick – compare-start.js */
const MAX_ITEMS = 5;

const vsRow = document.getElementById("vsRow");
const goBtn = document.getElementById("go");
const resetBtn = document.getElementById("reset");
const urlsBox = document.getElementById("urls");

const tabItems = document.getElementById("tabItems");
const tabUrls = document.getElementById("tabUrls");
const itemsMode = document.getElementById("itemsMode");
const urlsMode = document.getElementById("urlsMode");

/* ---- Tabs ---- */
tabItems.addEventListener("click", () => {
  tabItems.classList.add("active");
  tabUrls.classList.remove("active");
  itemsMode.style.display = "block";
  urlsMode.style.display = "none";
  validate();
});
tabUrls.addEventListener("click", () => {
  tabUrls.classList.add("active");
  tabItems.classList.remove("active");
  urlsMode.style.display = "block";
  itemsMode.style.display = "none";
  validate();
});

/* ---- Item Inputs ---- */
function makeSeg(idx, val = "") {
  const wrap = document.createElement("div");
  wrap.className = "vs-seg";
  wrap.innerHTML = `
    <input class="vs-input" placeholder="Item ${idx + 1} ${idx < 2 ? '(required)' : ''}"
           data-idx="${idx}" value="${val ? esc(val) : ""}">
    ${idx < MAX_ITEMS - 1 ? '<span class="vs-tag">vs</span>' : ""}
  `;
  return wrap;
}
function ensureInputs(n, values = []) {
  vsRow.innerHTML = "";
  const count = Math.min(Math.max(n, 2), MAX_ITEMS);
  for (let i = 0; i < count; i++) {
    vsRow.appendChild(makeSeg(i, values[i] || ""));
  }
  wireInputs();
  validate();
}
function valuesFromVs() {
  return [...document.querySelectorAll(".vs-input")]
    .map(i => i.value.trim())
    .filter(Boolean);
}
function wireInputs() {
  const inputs = [...document.querySelectorAll(".vs-input")];
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      const vals = valuesFromVs();
      if (inp.value.trim() && i === inputs.length - 1 && inputs.length < MAX_ITEMS) {
        ensureInputs(inputs.length + 1, vals);
      } else {
        validate();
      }
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!goBtn.disabled) go();
      }
    });
  });
}

/* ---- URL Inputs ---- */
function urlsList() {
  return urlsBox.value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}
urlsBox.addEventListener("input", validate);
urlsBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    if (!goBtn.disabled) go();
  }
});

/* ---- Validation ---- */
function validate() {
  const haveNames = valuesFromVs().length >= 2 && tabItems.classList.contains("active");
  const haveUrls = urlsList().length >= 2 && tabUrls.classList.contains("active");
  goBtn.disabled = !(haveNames || haveUrls);
}

/* ---- Actions ---- */
function go() {
  const names = valuesFromVs();
  const urls = urlsList();
  const payload = tabItems.classList.contains("active")
    ? { mode: "names", items: names }
    : { mode: "urls", items: urls };
  sessionStorage.setItem("bp_start_payload", JSON.stringify(payload));
  location.href = "compare.html";
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

goBtn.addEventListener("click", () => { if (!goBtn.disabled) go(); });
resetBtn.addEventListener("click", () => {
  urlsBox.value = "";
  ensureInputs(2);
  validate();
});

/* ---- Init ---- */
const prev = JSON.parse(sessionStorage.getItem("bp_start_payload") || "null");
if (prev?.mode === "names") {
  ensureInputs(Math.min(Math.max(prev.items.length, 2), MAX_ITEMS), prev.items);
  tabItems.click();
} else if (prev?.mode === "urls") {
  urlsBox.value = prev.items.join("\n");
  tabUrls.click();
} else {
  ensureInputs(2);
  tabItems.click();
}
validate();
