const DATA_URL = "data/products.json";
const CATEGORY_LABELS = {speaker:"喇叭", amplifier:"擴大機", turntable:"黑膠唱盤", dac:"DAC", "cd-player":"CD 播放器"};
let products = [];

const $ = (selector) => document.querySelector(selector);
const money = (value) => value == null ? "未提供" : `NT$ ${Number(value).toLocaleString("zh-TW")}`;
const getProduct = (id) => products.find((item) => item.id === id);

async function loadProducts() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    products = await response.json();
  } catch (error) {
    console.error("無法載入產品資料：", error);
    $("#productGrid").innerHTML = '<p class="no-results">設備資料載入失敗，請確認以本機伺服器或 GitHub Pages 開啟網站。</p>';
    return;
  }
  renderProducts();
  populateCompareSelects();
  renderComparison();
}

function renderProducts() {
  const query = $("#productSearch").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const filtered = products.filter((p) => {
    const haystack = [p.brand,p.model,p.description,CATEGORY_LABELS[p.category]].join(" ").toLowerCase();
    return (category === "all" || p.category === category) && haystack.includes(query);
  });
  $("#productGrid").innerHTML = filtered.length ? filtered.map((p) => `
    <article class="product-card">
      <div class="product-visual ${p.category}" aria-hidden="true"></div>
      <span class="product-category">${CATEGORY_LABELS[p.category] || "其他"} / ${escapeHtml(p.brand)}</span>
      <h3>${escapeHtml(p.model)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div class="product-meta"><strong>${p.priceTwd == null ? "價格未提供" : money(p.priceTwd)}</strong><span>${p.sensitivityDb == null ? "規格待補" : `${p.sensitivityDb} dB`}</span></div>
      <div class="product-actions">
        <button class="small-action" data-compare="${p.id}">加入比較 A</button>
        ${p.source ? `<a class="small-action" href="${escapeAttribute(p.source)}" target="_blank" rel="noopener">原廠資料 ↗</a>` : '<span class="small-action">來源待補</span>'}
      </div>
    </article>`).join("") : '<p class="no-results">找不到符合條件的設備，請調整搜尋文字或分類。</p>';
  document.querySelectorAll("[data-compare]").forEach((button) => button.addEventListener("click", () => {
    $("#compareA").value = button.dataset.compare;
    renderComparison();
    location.hash = "#compare";
  }));
}

function populateCompareSelects() {
  const options = products.map((p) => `<option value="${p.id}">${escapeHtml(p.brand)} ${escapeHtml(p.model)}</option>`).join("");
  $("#compareA").innerHTML = options;
  $("#compareB").innerHTML = options;
  const dali = products.find((p) => p.id === "dali-sonik-1");
  const wharfedale = products.find((p) => p.id === "wharfedale-diamond-12-1");
  $("#compareA").value = dali ? dali.id : products[0]?.id;
  $("#compareB").value = wharfedale ? wharfedale.id : products[1]?.id;
}

function renderComparison() {
  const a = getProduct($("#compareA").value), b = getProduct($("#compareB").value);
  if (!a || !b) return;
  $("#compareTitleA").textContent = `${a.brand} ${a.model}`;
  $("#compareTitleB").textContent = `${b.brand} ${b.model}`;
  const rows = [
    ["類別", CATEGORY_LABELS[a.category], CATEGORY_LABELS[b.category]],
    ["價格", money(a.priceTwd), money(b.priceTwd)],
    ["頻率響應", a.frequencyHz || "未提供", b.frequencyHz || "未提供"],
    ["靈敏度", a.sensitivityDb == null ? "未提供" : `${a.sensitivityDb} dB`, b.sensitivityDb == null ? "未提供" : `${b.sensitivityDb} dB`],
    ["標稱阻抗", a.impedanceOhm == null ? "未提供" : `${a.impedanceOhm} Ω`, b.impedanceOhm == null ? "未提供" : `${b.impedanceOhm} Ω`],
    ["建議擴大機功率", a.ampPowerW || "未提供", b.ampPowerW || "未提供"],
    ["單體／結構", a.driver || "未提供", b.driver || "未提供"],
    ["尺寸", a.dimensionsMm || "未提供", b.dimensionsMm || "未提供"],
    ["重量", a.weightKg == null ? "未提供" : `${a.weightKg} kg`, b.weightKg == null ? "未提供" : `${b.weightKg} kg`],
    ["資料狀態", a.verified, b.verified]
  ];
  $("#compareBody").innerHTML = rows.map((r) => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(String(r[1]))}</td><td>${escapeHtml(String(r[2]))}</td></tr>`).join("");
}

function recommend(event) {
  event.preventDefault();
  const budget = Number($("#budget").value);
  const width = Number($("#roomWidth").value), depth = Number($("#roomDepth").value);
  const area = width * depth;
  if (!(budget > 0) || !(width > 0) || !(depth > 0)) {
    $("#recommendations").innerHTML = '<div class="empty-state"><h3>請檢查輸入資料</h3><p>總預算與房間尺寸必須大於零。</p></div>';
    return;
  }
  const speakers = products.filter((p) => p.category === "speaker" && p.sensitivityDb != null && p.impedanceOhm != null);
  const preference = $("#soundPreference").value;
  const source = $("#sourceType").value;
  const prefText = {natural:"自然、耐聽與音色平衡",warm:"溫暖厚實與人聲",detail:"細節與解析",dynamic:"動態與低頻"}[preference];
  const sourceText = {vinyl:"黑膠唱盤",streaming:"串流／電腦",cd:"CD 播放器",mixed:"多種訊源"}[source];
  const speakerBudget = Number($("#speakerBudget").value) || budget * .4;
  const ranked = [...speakers].sort((a,b) => {
    const roomFit = (p) => area < 8 && p.sensitivityDb < 87 ? -1 : 0;
    return roomFit(b)-roomFit(a) + (preference === "natural" ? (a.brand === "Wharfedale" ? .1 : 0) : 0);
  });
  const plans = [
    {tag:"01 / BALANCED",title:"均衡聆聽配置",speaker:ranked[0],desc:"優先把預算分配在喇叭與擴大機的匹配，再依訊源選擇需要的唱放、DAC 或 CD 播放器。"},
    {tag:"02 / ALTERNATIVE",title:"不同聲音取向",speaker:ranked[1] || ranked[0],desc:"以另一款有可核對規格的喇叭作為比較起點；建議安排同曲目、相近音量的實際試聽。"},
    {tag:"03 / FLEXIBLE",title:"保留升級彈性",speaker:ranked[0],desc:"先確定喇叭與擴大機，再保留預算給訊源或房間聲學改善，避免一次買齊但犧牲核心器材。"}
  ];
  const missingPrice = speakers.every((p) => p.priceTwd == null);
  $("#recommendations").innerHTML = plans.map((plan, index) => {
    const p = plan.speaker;
    if (!p) return "";
    const ampOk = p.ampPowerW ? `原廠建議擴大機功率：${p.ampPowerW}` : "擴大機功率資料不足，需再核對";
    const impedance = `${p.impedanceOhm} Ω 標稱阻抗`;
    const sensitivity = `${p.sensitivityDb} dB 靈敏度`;
    const roomNote = area < 8 ? "空間偏小，優先留意喇叭離後牆距離、聆聽距離與低頻駐波。" : area < 18 ? "此面積可先以書架喇叭作為規劃起點，仍需依擺位與音量試聽。" : "空間較寬裕，可將聆聽距離與低頻延伸納入下一輪篩選。";
    const budgetNote = missingPrice ? "資料庫尚無可核實的台灣售價，因此目前不能計算真實總價或宣稱符合預算。" : "請以當地實際報價重新核算總預算。";
    return `<article class="recommendation-card">
      <div class="rec-top"><span class="rec-tag">${plan.tag}</span><span class="status">初步建議</span></div>
      <h3>${plan.title}</h3><p>${plan.desc}</p>
      <div class="rec-speaker"><strong>${escapeHtml(p.brand)} ${escapeHtml(p.model)}</strong><span>${money(p.priceTwd)}</span></div>
      <p class="compatibility"><strong>相容性檢查：</strong>${ampOk}；${impedance}；${sensitivity}。${roomNote}</p>
      <p class="compatibility"><strong>你的條件：</strong>${area.toFixed(1)} m²、${prefText}、${sourceText}；喇叭分項預算參考 ${money(speakerBudget)}。${budgetNote}</p>
      <p class="compatibility"><strong>下一步：</strong>確認擴大機在該負載下的穩定性與實際輸出；${source === "vinyl" ? "確認唱盤唱放輸出與擴大機輸入。" : source === "streaming" ? "確認串流端的 DAC 與擴大機輸入介面。" : source === "cd" ? "確認 CD 播放器具備合適的類比或數位輸出。" : "逐一確認每種訊源的輸出介面與所需轉換設備。"}</p>
    </article>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function escapeAttribute(value) { return escapeHtml(value); }

$("#productSearch").addEventListener("input", renderProducts);
$("#categoryFilter").addEventListener("change", renderProducts);
$("#compareA").addEventListener("change", renderComparison);
$("#compareB").addEventListener("change", renderComparison);
$("#matchForm").addEventListener("submit", recommend);
$("#menuToggle").addEventListener("click", () => {
  const nav = $("#mainNav");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
});
$("#mainNav").querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}));
loadProducts();
