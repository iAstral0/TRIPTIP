const API = 'http://localhost:8000/api';

/* jastip-domestic.js — logic for jastip-domestic */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
const TAX_RATE = 0.02;

// ── DATA ─────────────────────────────────────────────────────────────────────
// NOTE: Replace with API: GET /api/domestic/cities
const featuredCities = [
  { name:'Bandung',    icon:'🌺', region:'Jawa Barat' },
  { name:'Yogyakarta', icon:'🏛️', region:'DI Yogyakarta' },
  { name:'Bali',       icon:'🌴', region:'Bali' },
  { name:'Malang',     icon:'🍎', region:'Jawa Timur' },
  { name:'Solo',       icon:'🎭', region:'Jawa Tengah' },
];
const allCities = [
  { name:'Jakarta',    icon:'🏙️', region:'DKI Jakarta' },
  { name:'Surabaya',   icon:'⚓', region:'Jawa Timur' },
  { name:'Medan',      icon:'🌿', region:'Sumatera Utara' },
  { name:'Makassar',   icon:'🌊', region:'Sulawesi Selatan' },
  { name:'Semarang',   icon:'🏯', region:'Jawa Tengah' },
  { name:'Palembang',  icon:'🌉', region:'Sumatera Selatan' },
  { name:'Manado',     icon:'🐟', region:'Sulawesi Utara' },
  { name:'Pontianak',  icon:'🌴', region:'Kalimantan Barat' },
];

// NOTE: Replace with API: GET /api/domestic/souvenirs?city=X
const souvenirsByCity = {
  'Bandung': [
    { id:'b1', name:'Surabi Bandung', desc:'Traditional fluffy Sundanese pancake', weight:'0.3kg', price:25000, icon:'🥞', qty:0 },
    { id:'b2', name:'Batagor',        desc:'Fried fish dumpling with peanut sauce', weight:'0.4kg', price:35000, icon:'🍡', qty:0 },
    { id:'b3', name:'Peuyeum Bandung',desc:'Fermented cassava traditional snack',   weight:'0.5kg', price:20000, icon:'🍠', qty:0 },
    { id:'b4', name:'Keripik Pedas',  desc:'Spicy chips, various flavors available', weight:'0.2kg', price:30000, icon:'🌶️', qty:0 },
    { id:'b5', name:'Dodol Garut',    desc:'Sweet sticky traditional candy from Garut', weight:'0.4kg', price:40000, icon:'🍬', qty:0 },
  ],
  'Yogyakarta': [
    { id:'y1', name:'Gudeg Kaleng',   desc:'Canned young jackfruit in coconut milk', weight:'0.5kg', price:45000, icon:'🫙', qty:0 },
    { id:'y2', name:'Bakpia Pathok',  desc:'Sweet mung bean pastry, classic snack',  weight:'0.3kg', price:35000, icon:'🥮', qty:0 },
    { id:'y3', name:'Batik Jogja',    desc:'Hand-drawn traditional batik cloth',      weight:'0.3kg', price:150000, icon:'🧣', qty:0 },
    { id:'y4', name:'Yangko',         desc:'Chewy sticky rice cake with filling',     weight:'0.2kg', price:25000, icon:'🍡', qty:0 },
  ],
  'Bali': [
    { id:'ba1', name:'Pie Susu Bali',  desc:'Creamy milk pie, Bali signature pastry', weight:'0.3kg', price:40000, icon:'🥧', qty:0 },
    { id:'ba2', name:'Salted Fish',    desc:'Sun-dried traditional Balinese salted fish', weight:'0.5kg', price:55000, icon:'🐟', qty:0 },
    { id:'ba3', name:'Kopi Bali',      desc:'Aromatic Balinese ground coffee',         weight:'0.25kg', price:60000, icon:'☕', qty:0 },
    { id:'ba4', name:'Arak Bali',      desc:'Traditional Balinese palm wine spirit',   weight:'0.7kg', price:80000, icon:'🍶', qty:0 },
  ],
  'Malang': [
    { id:'m1', name:'Apel Malang',     desc:'Fresh crispy apples from Malang highlands', weight:'1kg',  price:35000, icon:'🍎', qty:0 },
    { id:'m2', name:'Keripik Tempe',   desc:'Crispy tempeh chips, Malang specialty',     weight:'0.3kg', price:25000, icon:'🟫', qty:0 },
    { id:'m3', name:'Strudel Malang',  desc:'European-style pastry adapted locally',     weight:'0.5kg', price:60000, icon:'🥐', qty:0 },
  ],
  'Solo': [
    { id:'s1', name:'Serabi Solo',     desc:'Traditional coconut-flavored pancake',    weight:'0.3kg', price:20000, icon:'🥞', qty:0 },
    { id:'s2', name:'Abon Sapi Solo',  desc:'Shredded beef floss, great for rice',     weight:'0.3kg', price:45000, icon:'🥩', qty:0 },
    { id:'s3', name:'Batik Solo',      desc:'Authentic batik fabric from Solo artisans',weight:'0.3kg', price:200000, icon:'🧶', qty:0 },
    { id:'s4', name:'Rambak Solo',     desc:'Crispy beef skin crackers',               weight:'0.2kg', price:30000, icon:'🍪', qty:0 },
  ],
};
// Default for cities not in map
function getSouvenirs(city) {
  if(souvenirsByCity[city]) return souvenirsByCity[city].map(s=>({...s,qty:0}));
  return [
    { id:'d1', name:`${city} Keripik`,  desc:'Local crispy chips specialty',           weight:'0.3kg', price:25000, icon:'🍟', qty:0 },
    { id:'d2', name:`${city} Batik`,    desc:'Local batik cloth with unique pattern',  weight:'0.3kg', price:120000, icon:'🧣', qty:0 },
    { id:'d3', name:`${city} Kopi`,     desc:'Local ground coffee special blend',      weight:'0.25kg', price:50000, icon:'☕', qty:0 },
    { id:'d4', name:`${city} Dodol`,    desc:'Traditional sweet glutinous candy',      weight:'0.4kg', price:35000, icon:'🍬', qty:0 },
    { id:'d5', name:`${city} Kerajinan`,desc:'Handmade local craft souvenir',          weight:'0.5kg', price:75000, icon:'🎁', qty:0 },
  ];
}

// Travellers for domestic import
const travellersData = [
  { id:'t1', name:'Nama Penyedia Jastip', date:'31 February 2026', priceKg:32500, maxKg:30, usedKg:0,
    rules:['No liquid items over 100ml','No prohibited goods','Items must be properly packaged','No fragile items without proper packing','No food items','No branded replicas','No medications without prescription'] },
  { id:'t2', name:'Nama Penyedia Jastip', date:'31 February 2026', priceKg:32500, maxKg:30, usedKg:7,  rules:['Electronics allowed with receipt','Must declare all items','No sharp objects'] },
  { id:'t3', name:'Nama Penyedia Jastip', date:'31 February 2026', priceKg:32500, maxKg:30, usedKg:15, rules:['Fashion items only','Tag must be attached','Max 5 items'] },
  { id:'t4', name:'Nama Penyedia Jastip', date:'31 February 2026', priceKg:32500, maxKg:30, usedKg:15, rules:['All items welcome','Must be under 2kg each','No prohibited goods'] },
  { id:'t5', name:'Nama Penyedia Jastip', date:'31 February 2026', priceKg:32500, maxKg:30, usedKg:26, rules:['Bags and accessories only','No imitation goods'] },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let selectedCity = null;
let currentSouvenirs = [];
let importChoice = null;
let selectedTraveller = null;
let orderItems = [];
let currentNoteItemId = null;
let orderIdCounter = 10;
let currentOrderId = null;
let itemIdCounter = 0;

// ── HELPERS ───────────────────────────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ── TOWN GRID ─────────────────────────────────────────────────────────────────
function renderGrid(containerId, items, showMore=true) {
  const el = document.getElementById(containerId);
  let html = items.map(c=>`
    <div class="town-card" onclick="openCity('${c.name}')">
      <div class="town-img">${c.icon}</div>
      <div class="town-name">${c.name}</div>
      <div class="town-region">${c.region}</div>
    </div>`).join('');
  if(showMore) html+=`<div class="town-card more" onclick="showToast('More cities coming soon!')"><div class="town-img">···</div><div class="town-name">More</div><div class="town-region">&nbsp;</div></div>`;
  el.innerHTML = html;
}

// ── SOUVENIRS ─────────────────────────────────────────────────────────────────
function openCity(city) {
  selectedCity = city;
  document.getElementById('souvenirPageTitle').textContent = city;
  currentSouvenirs = getSouvenirs(city);
  renderSouvenirs(currentSouvenirs);
  showPage('pageSouvenirs');
}

function renderSouvenirs(list) {
  const el = document.getElementById('souvenirList');
  el.innerHTML = list.map(s=>`
    <div class="souvenir-item">
      <div class="souvenir-img">${s.icon}</div>
      <div class="souvenir-info">
        <div class="souvenir-name">${s.name}</div>
        <div class="souvenir-desc">${s.desc}</div>
        <div class="souvenir-weight">⚖️ ${s.weight}</div>
        <div class="souvenir-price">${formatRp(s.price)}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${s.id}',1)">+</button>
        <span class="qty-display" id="sqty-${s.id}">${s.qty}</span>
        <button class="qty-btn" onclick="changeQty('${s.id}',-1)">−</button>
      </div>
    </div>`).join('');
  updateCartBar();
}

function filterSouvenirs() {
  const q = document.getElementById('souvenirSearch').value.toLowerCase();
  renderSouvenirs(currentSouvenirs.filter(s=>s.name.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q)));
}

function changeQty(id, delta) {
  const s = currentSouvenirs.find(x=>x.id===id);
  if(!s) return;
  s.qty = Math.max(0, s.qty + delta);
  const el = document.getElementById('sqty-'+id);
  if(el) el.textContent = s.qty;
  updateCartBar();
}

function updateCartBar() {
  const cart = document.getElementById('cartBar');
  const selected = currentSouvenirs.filter(s=>s.qty>0);
  const total = selected.reduce((sum,s)=>sum+s.price*s.qty,0);
  const count = selected.reduce((sum,s)=>sum+s.qty,0);
  if(count > 0){
    document.getElementById('cartCount').textContent = count + ' item' + (count!==1?'s':'') + ' selected';
    document.getElementById('cartTotal').textContent = formatRp(total);
    cart.classList.add('show');
  } else {
    cart.classList.remove('show');
  }
}

// ── IMPORT CHOICE ─────────────────────────────────────────────────────────────
function selectImport(choice) {
  importChoice = choice;
  document.getElementById('choiceNo').classList.toggle('selected',  choice==='no');
  document.getElementById('choiceYes').classList.toggle('selected', choice==='yes');
}

function confirmImportChoice() {
  if(!importChoice){ showToast('Please select an option.'); return; }
  // Both choices go to traveller list — customer always picks a traveller
  // 'no' = souvenir delivery only (skip order form, go straight to payment)
  // 'yes' = souvenir + imported items (show order form after picking traveller)
  const subtitle = importChoice === 'no'
    ? 'Pick a traveller to deliver your souvenirs'
    : 'Pick a traveller to deliver + import items';
  document.getElementById('travellerPageTitle').textContent = 'Choose Traveller';
  document.getElementById('travellerSubtitle').textContent  = subtitle;
  showPage('pageTravellers');
  renderTravellers(travellersData);
}

// ── TRAVELLER LIST ────────────────────────────────────────────────────────────
function boxSVG(used,max){
  const pct=used/max;
  let color='#4CAF50';
  if(pct>=0.8)color='#E53935';
  else if(pct>=0.5)color='#FFC107';
  const isOpen=pct<0.3;
  if(isOpen) return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="45" width="80" height="45" rx="4" fill="${color}" stroke="${color}" stroke-width="2"/><polygon points="10,45 50,30 90,45 50,60" fill="${color}" opacity="0.85"/><polygon points="10,45 30,20 50,30 50,60" fill="${color}" opacity="0.7"/><polygon points="90,45 70,20 50,30 50,60" fill="${color}" opacity="0.7"/></svg>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="35" width="80" height="55" rx="4" fill="${color}"/><rect x="8" y="28" width="84" height="14" rx="3" fill="${color}" opacity="0.85"/><rect x="40" y="28" width="20" height="14" rx="2" fill="rgba(0,0,0,0.1)"/></svg>`;
}

function renderTravellers(list) {
  const el = document.getElementById('travellerList');
  el.innerHTML = list.map(t=>{
    const pct=t.usedKg/t.maxKg;
    const col=pct>=0.8?'var(--red)':pct>=0.5?'var(--yellow)':'var(--green)';
    return `<div class="traveller-card" onclick="openOrder('${t.id}')">
      <div class="traveller-left">
        <div class="t-name">${t.name}</div>
        <div class="t-arrived">Arrived at <span>${t.date}</span></div>
        <div class="t-ticket">Issued Ticket</div>
        <div class="t-price">${formatRp(t.priceKg)}/kg</div>
      </div>
      <div>
        <div class="t-box">${boxSVG(t.usedKg,t.maxKg)}</div>
        <div class="t-capacity" style="color:${col}">${t.usedKg}Kg / ${t.maxKg}Kg</div>
      </div>
    </div>`;
  }).join('');
}

function filterTravellers() {
  const q = document.getElementById('travellerSearch').value.toLowerCase();
  renderTravellers(travellersData.filter(t=>t.name.toLowerCase().includes(q)));
}

// ── ORDER FORM ────────────────────────────────────────────────────────────────
function newItem(){ return { id:++itemIdCounter, name:'', qty:1, kg:'', note:'' }; }

function openOrder(tId) {
  selectedTraveller = travellersData.find(t=>t.id===tId);

  // Souvenir-only: skip order form, go straight to payment
  if(importChoice === 'no') {
    buildPaymentSouvenirOnly();
    return;
  }

  // With imports: show order form
  orderItems = [newItem()];
  document.getElementById('ord-name').textContent = selectedTraveller.name;
  document.getElementById('ord-date').textContent = selectedTraveller.date;
  document.getElementById('ord-capacity').textContent = selectedTraveller.usedKg+'Kg / '+selectedTraveller.maxKg+'Kg';
  document.getElementById('ord-price').textContent = formatRp(selectedTraveller.priceKg)+'/kg';
  document.getElementById('ord-box-svg').innerHTML = `<div style="width:80px;height:80px">${boxSVG(selectedTraveller.usedKg,selectedTraveller.maxKg)}</div>`;
  document.getElementById('ord-rules').innerHTML = selectedTraveller.rules.map(r=>`<li>${r}</li>`).join('');
  renderOrderItems();
  showPage('pageOrder');
}

function addItem(){ orderItems.push(newItem()); renderOrderItems(); }

function renderOrderItems() {
  document.getElementById('itemsContainer').innerHTML = orderItems.map(item=>`
    <div class="item-entry" id="item-${item.id}">
      <div class="item-img-box">
        <span class="add-photo">📷</span>
        <input type="file" accept="image/*" onchange="previewImg(this,${item.id})" />
      </div>
      <div class="item-fields">
        <div class="item-row1">
          <input class="item-name-input" type="text" placeholder="Item Name" value="${item.name}"
            onchange="updateItem(${item.id},'name',this.value)" />
          <button class="qty-btn-sm" onclick="changeItemQty(${item.id},-1)">−</button>
          <span class="qty-display-sm" id="iqty-${item.id}">${item.qty}x</span>
          <button class="qty-btn-sm" onclick="changeItemQty(${item.id},1)">+</button>
        </div>
        <div class="item-row2">
          <input class="item-kg-input" type="number" placeholder="0" min="0" step="0.1" value="${item.kg}"
            onchange="updateItem(${item.id},'kg',this.value)" />
          <span class="kg-label">Kg</span>
          <button class="notes-btn ${item.note?'has-note':''}" onclick="openNotesSheet(${item.id})">
            📋 ${item.note?item.note.substring(0,15)+(item.note.length>15?'…':''):'Notes'}
          </button>
        </div>
      </div>
      ${orderItems.length>1?`<button style="width:24px;height:24px;background:#FFEBEE;border-radius:50%;border:none;color:var(--red);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px" onclick="removeItem(${item.id})">×</button>`:''}
    </div>`).join('');
}

function previewImg(input,id){
  if(!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{const box=input.closest('.item-img-box');box.querySelector('.add-photo').style.display='none';let img=box.querySelector('img');if(!img){img=document.createElement('img');box.insertBefore(img,box.querySelector('input'));}img.src=e.target.result;img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:10px';};
  reader.readAsDataURL(input.files[0]);
}
function updateItem(id,field,val){const item=orderItems.find(i=>i.id===id);if(item)item[field]=val;}
function changeItemQty(id,delta){const item=orderItems.find(i=>i.id===id);if(!item)return;item.qty=Math.max(1,item.qty+delta);document.getElementById('iqty-'+id).textContent=item.qty+'x';}
function removeItem(id){if(orderItems.length<=1){showToast('At least one item required.');return;}orderItems=orderItems.filter(i=>i.id!==id);renderOrderItems();}

function openNotesSheet(id){currentNoteItemId=id;const item=orderItems.find(i=>i.id===id);document.getElementById('notesInput').value=item?item.note:'';document.getElementById('notesOverlay').classList.add('show');}
function closeNotesSheet(e){if(!e||e.target===document.getElementById('notesOverlay'))document.getElementById('notesOverlay').classList.remove('show');}
function saveNote(){const item=orderItems.find(i=>i.id===currentNoteItemId);if(item)item.note=document.getElementById('notesInput').value;document.getElementById('notesOverlay').classList.remove('show');renderOrderItems();}

// ── PAYMENT ───────────────────────────────────────────────────────────────────
function goToPayment() {
  const filled = orderItems.filter(i=>i.name.trim()&&i.kg);
  if(!filled.length){showToast('Please fill in at least one item.');return;}
  const totalOrderKg = filled.reduce((s,i)=>s+(parseFloat(i.kg)||0)*i.qty,0);
  const available = selectedTraveller.maxKg - selectedTraveller.usedKg;
  if(totalOrderKg>available){showToast('⚠️ Exceeds available space! Max '+available+'kg remaining.',3500);return;}
  buildPaymentFull(filled);
}

function buildPaymentSouvenirOnly() {
  selectedTraveller = null;
  currentOrderId = '#00' + (orderIdCounter++).toString().padStart(3,'0');
  const souvenirItems = currentSouvenirs.filter(s=>s.qty>0);
  const souvenirTotal = souvenirItems.reduce((s,x)=>s+x.price*x.qty,0);
  const tax = Math.round(souvenirTotal * TAX_RATE);
  const total = souvenirTotal + tax;

  document.getElementById('pay-id').textContent = currentOrderId;
  document.getElementById('pay-souvenir-section').innerHTML =
    `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:4px"><span>🎁 Souvenirs</span><span>Price</span></div>`+
    souvenirItems.map(s=>`<div style="display:grid;grid-template-columns:1fr 52px 90px;align-items:center;gap:0;padding:6px 2px;border-bottom:1px solid #e8e8e8">
      <span style="display:flex;align-items:center;gap:4px;font-size:13px"><span style="font-size:10px;color:var(--gray-text)">○</span>${s.name} (${s.qty}x)</span>
      <span style="color:var(--gray-text);font-size:12px;text-align:right;padding-right:6px">${s.weight}</span>
      <span style="text-align:right;font-size:13px">${formatRp(s.price*s.qty)}</span></div>`).join('');
  document.getElementById('pay-import-section').innerHTML = '';
  document.getElementById('pay-subtotal').textContent = formatRp(souvenirTotal);
  document.getElementById('pay-tax').textContent = formatRp(tax);
  document.getElementById('pay-total').textContent = formatRp(total);
  document.getElementById('pay-date').textContent = selectedTraveller ? selectedTraveller.date : 'Today';
  document.getElementById('pay-amount').textContent = formatRp(total);
  window._paymentData = { souvenirTotal, importTotal:0, tax, total, souvenirItems, filled:[], orderId:currentOrderId };
  showPage('pagePayment');
}

function buildPaymentFull(filled) {
  currentOrderId = '#00' + (orderIdCounter++).toString().padStart(3,'0');
  const souvenirItems = currentSouvenirs.filter(s=>s.qty>0);
  const souvenirTotal = souvenirItems.reduce((s,x)=>s+x.price*x.qty,0);
  const priceKg = selectedTraveller.priceKg;
  let importTotal = 0;
  let importHtml = '';
  if(filled.length){
    importHtml = `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin:10px 0 4px"><span>✈️ Imported Items</span><span>Price</span></div>`;
    filled.forEach(item=>{
      const kg=parseFloat(item.kg)||0;
      const price=Math.round(kg*priceKg*item.qty);
      importTotal+=price;
      importHtml+=`<div style="display:grid;grid-template-columns:1fr 52px 90px;align-items:center;gap:0;padding:6px 2px;border-bottom:1px solid #e8e8e8">
        <span style="display:flex;align-items:center;gap:4px;font-size:13px"><span style="font-size:10px;color:var(--gray-text)">○</span>${item.name} (${item.qty}x)</span>
        <span style="color:var(--gray-text);font-size:12px;text-align:right;padding-right:6px">${kg}kg</span>
        <span style="text-align:right;font-size:13px">${formatRp(price)}</span></div>`;
    });
  }
  const subtotal = souvenirTotal + importTotal;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  document.getElementById('pay-id').textContent = currentOrderId;
  document.getElementById('pay-souvenir-section').innerHTML =
    `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:4px"><span>🎁 Souvenirs</span><span>Price</span></div>`+
    souvenirItems.map(s=>`<div style="display:grid;grid-template-columns:1fr 52px 90px;align-items:center;gap:0;padding:6px 2px;border-bottom:1px solid #e8e8e8">
      <span style="display:flex;align-items:center;gap:4px;font-size:13px"><span style="font-size:10px;color:var(--gray-text)">○</span>${s.name} (${s.qty}x)</span>
      <span style="color:var(--gray-text);font-size:12px;text-align:right;padding-right:6px">${s.weight}</span>
      <span style="text-align:right;font-size:13px">${formatRp(s.price*s.qty)}</span></div>`).join('');
  document.getElementById('pay-import-section').innerHTML = importHtml;
  document.getElementById('pay-subtotal').textContent = formatRp(subtotal);
  document.getElementById('pay-tax').textContent = formatRp(tax);
  document.getElementById('pay-total').textContent = formatRp(total);
  document.getElementById('pay-date').textContent = selectedTraveller ? selectedTraveller.date : 'Today';
  document.getElementById('pay-amount').textContent = formatRp(total);
  window._paymentData = { souvenirTotal, importTotal, tax, total, souvenirItems, filled, orderId:currentOrderId };
  showPage('pagePayment');
}

function confirmPayment() {
  const d   = window._paymentData;
  const btn = document.getElementById('payBtn');
  if (btn) btn.classList.add('loading');

  midtransPay({
    orderId:      d.orderId,
    amount:       d.total,
    customerName: (getUser()?.name) || 'Customer',
    onSuccess: function(result) {
      if (btn) btn.classList.remove('loading');
      const now = new Date();
      const dateStr = `${now.getDate()} ${now.toLocaleString('en',{month:'long'})} ${now.getFullYear()} – ${String(now.getHours()).padStart(2,'0')}.${String(now.getMinutes()).padStart(2,'0')}`;
      const totalItems = d.souvenirItems.reduce((s,x)=>s+x.qty,0) + d.filled.reduce((s,x)=>s+x.qty,0);
      document.getElementById('suc-id').textContent          = d.orderId;
      document.getElementById('suc-total-items').textContent = totalItems;
      document.getElementById('suc-subtotal').textContent    = formatRp(d.souvenirTotal + d.importTotal);
      document.getElementById('suc-tax').textContent         = formatRp(d.tax);
      document.getElementById('suc-total').textContent       = formatRp(d.total);
      document.getElementById('suc-date').textContent        = dateStr;
      const travRow = document.getElementById('suc-traveller-row');
      if (selectedTraveller) {
        travRow.style.display='flex';
        document.getElementById('suc-city').textContent     = importChoice==='yes' ? selectedCity + ' + Import' : selectedCity + ' Souvenirs';
        document.getElementById('suc-provider').textContent = selectedTraveller.name;
      } else {
        travRow.style.display='none';
      }
      showPage('pageSuccess');
    },
    onError: function(msg) {
      if (btn) btn.classList.remove('loading');
      showToast('❌ ' + msg);
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderGrid('featuredGrid', featuredCities, true);
renderGrid('allGrid', allCities, true);

  const allCitiesFlat = [...featuredCities, ...allCities];

  function filterCities() {
    const q = document.getElementById('citySearch').value.toLowerCase().trim();
    const drop = document.getElementById('cityDropdown');
    if (!q) { drop.classList.remove('show'); return; }

    const matches = allCitiesFlat.filter(c =>
      c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    );

    if (!matches.length) {
      drop.innerHTML = '<div class="sr-empty">No cities found</div>';
    } else {
      drop.innerHTML = matches.map(c => `
        <div class="sr-row" onmousedown="openCity('${c.name}')">
          <span class="sr-row-icon">${c.icon}</span>
          <div><div class="sr-row-name">${c.name}</div><div class="sr-row-sub">${c.region}</div></div>
        </div>`).join('');
    }
    drop.classList.add('show');
  }
