const API = 'http://localhost:8000/api';

/* jastip-international.js — logic for jastip-international */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

// ── DATA ─────────────────────────────────────────────────────────────────────
const TAX_RATE = 0.02;

const featured = [
  { name:'Singapore', flag:'🇸🇬', region:'Asia' },
  { name:'Japan',     flag:'🇯🇵', region:'Asia' },
  { name:'Korea',     flag:'🇰🇷', region:'Asia' },
  { name:'Thailand',  flag:'🇹🇭', region:'Asia' },
  { name:'Malaysia',  flag:'🇲🇾', region:'Asia' },
];
const all = [
  { name:'USA',       flag:'🇺🇸', region:'America' },
  { name:'UK',        flag:'🇬🇧', region:'Europe' },
  { name:'Australia', flag:'🇦🇺', region:'Oceania' },
  { name:'France',    flag:'🇫🇷', region:'Europe' },
  { name:'Germany',   flag:'🇩🇪', region:'Europe' },
  { name:'China',     flag:'🇨🇳', region:'Asia' },
  { name:'Hong Kong', flag:'🇭🇰', region:'Asia' },
  { name:'Turkey',    flag:'🇹🇷', region:'Europe/Asia' },
];

const citiesMap = {
  Singapore: [{ name:'Singapore City', flag:'🏙️' }, { name:'Jurong',flag:'🏢' }, { name:'Woodlands',flag:'🌳' }],
  Japan:     [{ name:'Tokyo',flag:'🗼' }, { name:'Osaka',flag:'🏯' }, { name:'Kyoto',flag:'⛩️' }],
  Korea:     [{ name:'Seoul',flag:'🏙️' }, { name:'Busan',flag:'🌊' }, { name:'Incheon',flag:'✈️' }],
  Thailand:  [{ name:'Bangkok',flag:'🛕' }, { name:'Phuket',flag:'🏖️' }, { name:'Chiang Mai',flag:'🌿' }],
  Malaysia:  [{ name:'Kuala Lumpur',flag:'🏙️' }, { name:'Penang',flag:'🌴' }, { name:'Johor Bahru',flag:'🏘️' }],
  USA:       [{ name:'New York',flag:'🗽' }, { name:'Los Angeles',flag:'🎬' }, { name:'Chicago',flag:'🌆' }],
  UK:        [{ name:'London',flag:'🎡' }, { name:'Manchester',flag:'⚽' }, { name:'Edinburgh',flag:'🏰' }],
  Australia: [{ name:'Sydney',flag:'🦘' }, { name:'Melbourne',flag:'☕' }, { name:'Brisbane',flag:'☀️' }],
  France:    [{ name:'Paris',flag:'🗼' }, { name:'Lyon',flag:'🍷' }, { name:'Nice',flag:'🌅' }],
  Germany:   [{ name:'Berlin',flag:'🐻' }, { name:'Munich',flag:'🍺' }, { name:'Hamburg',flag:'⚓' }],
  China:     [{ name:'Beijing',flag:'🏯' }, { name:'Shanghai',flag:'🌆' }, { name:'Guangzhou',flag:'🏭' }],
  'Hong Kong':[{ name:'Central',flag:'🏙️' }, { name:'Kowloon',flag:'🌉' }, { name:'Lantau',flag:'🚡' }],
  Turkey:    [{ name:'Istanbul',flag:'🕌' }, { name:'Ankara',flag:'🏛️' }, { name:'Izmir',flag:'🌊' }],
};

const travellersData = [
  { id:'t1', name:'Nama Penyedia Jastip', date:'31 February 2026', ticket:'Issued Ticket', price:32500, priceKg:32500, maxKg:30, usedKg:0,
    rules:['No liquid items over 100ml','No prohibited goods','Items must be properly packaged with clear labels and dimensions provided','No fragile items without proper packing','No food items','No branded replicas','No medications without prescription'] },
  { id:'t2', name:'Nama Penyedia Jastip', date:'31 February 2026', ticket:'Issued Ticket', price:32500, priceKg:32500, maxKg:30, usedKg:7,
    rules:['Electronics allowed with receipt','Must declare all items','Cosmetics under 100ml each','No sharp objects','No batteries','No alcohol'] },
  { id:'t3', name:'Nama Penyedia Jastip', date:'31 February 2026', ticket:'Issued Ticket', price:32500, priceKg:32500, maxKg:30, usedKg:15,
    rules:['Fashion items only','Tag must be attached','Max 5 items per order','No used items','No perfume bottles > 100ml'] },
  { id:'t4', name:'Nama Penyedia Jastip', date:'31 February 2026', ticket:'Issued Ticket', price:32500, priceKg:32500, maxKg:30, usedKg:15,
    rules:['All items welcome','Must be under 2kg each','Declare all contents','Fragile items at own risk','No prohibited goods'] },
  { id:'t5', name:'Nama Penyedia Jastip', date:'31 February 2026', ticket:'Issued Ticket', price:32500, priceKg:32500, maxKg:30, usedKg:26,
    rules:['Bags and accessories only','Must have original packaging','Max 3 items','No imitation goods','Photos required before pickup'] },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let selectedCountry = null;
let selectedCity    = null;
let selectedTraveller = null;
let orderItems = [];
let currentNoteItemId = null;
let orderIdCounter = 4;
let currentOrderId = null;

// ── PAGE NAVIGATION ───────────────────────────────────────────────────────────
function showPage(id) {
  ['pageCountries','pageCities','pageTravellers','pageOrder','pagePayment','pageSuccess'].forEach(p => {
    document.getElementById(p).classList.toggle('hidden', p !== id);
  });
  window.scrollTo(0,0);
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg, dur=2200) {
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),dur);
}

// ── BOX SVG by fill % ─────────────────────────────────────────────────────────
function boxSVG(used, max) {
  const pct = used / max;
  let color = '#4CAF50'; // green
  if (pct >= 0.8) color = '#E53935'; // red
  else if (pct >= 0.5) color = '#FFC107'; // yellow
  const isOpen = pct < 0.3;
  if (isOpen) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="45" width="80" height="45" rx="4" fill="${color}" stroke="${color}" stroke-width="2"/>
      <polygon points="10,45 50,30 90,45 50,60" fill="${color}" opacity="0.85"/>
      <polygon points="10,45 30,20 50,30 50,60" fill="${color}" opacity="0.7"/>
      <polygon points="90,45 70,20 50,30 50,60" fill="${color}" opacity="0.7"/>
      <rect x="10" y="45" width="80" height="45" rx="4" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="35" width="80" height="55" rx="4" fill="${color}"/>
    <rect x="10" y="35" width="80" height="55" rx="4" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
    <rect x="8" y="28" width="84" height="14" rx="3" fill="${color}" opacity="0.85"/>
    <rect x="8" y="28" width="84" height="14" rx="3" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5"/>
    <rect x="40" y="28" width="20" height="14" rx="2" fill="rgba(0,0,0,0.1)"/>
  </svg>`;
}

// ── GRID HELPERS ──────────────────────────────────────────────────────────────
function renderGrid(containerId, items, clickFn, showMore=true) {
  const el = document.getElementById(containerId);
  let html = items.map(c=>`
    <div class="grid-card" onclick="${clickFn}('${c.name}')">
      <div class="grid-img">${c.flag||c.icon||'📦'}</div>
      <div class="grid-name">${c.name}</div>
      ${c.region?`<div class="grid-sub">${c.region}</div>`:''}
    </div>`).join('');
  if(showMore) html+=`<div class="grid-card more" onclick="showToast('More coming soon!')"><div class="grid-img">···</div><div class="grid-name">More</div><div class="grid-sub">&nbsp;</div></div>`;
  el.innerHTML = html;
}

// ── COUNTRY → CITIES ──────────────────────────────────────────────────────────
function openCountry(name) {
  selectedCountry = name;
  // Reset city search
  const cs = document.getElementById('citySearch');
  if(cs) cs.value = '';
  const cd = document.getElementById('cityDropdown');
  if(cd) cd.classList.remove('show');
  document.getElementById('cityPageTitle').textContent = name;
  const cities = citiesMap[name] || [{name:'City Center',flag:'🏙️'},{name:'Suburbs',flag:'🏘️'},{name:'Airport',flag:'✈️'}];
  renderGrid('citiesGrid', cities, 'openCity', false);
  showPage('pageCities');
}

// ── CITY → TRAVELLERS ─────────────────────────────────────────────────────────
function openCity(name) {
  selectedCity = name;
  document.getElementById('travellerPageTitle').textContent = name;
  renderTravellers(travellersData);
  showPage('pageTravellers');
}

function renderTravellers(list) {
  const el = document.getElementById('travellerList');
  el.innerHTML = list.map(t => {
    const pct = t.usedKg / t.maxKg;
    return `<div class="traveller-card" onclick="openOrder('${t.id}')">
      <div class="traveller-left">
        <div class="t-name">${t.name}</div>
        <div class="t-arrived">Arrived at <span>${t.date}</span></div>
        <div class="t-ticket">${t.ticket}</div>
        <div class="t-price">Rp ${t.price.toLocaleString('id-ID')}/kg</div>
      </div>
      <div>
        <div class="t-box">${boxSVG(t.usedKg, t.maxKg)}</div>
        <div class="t-capacity" style="color:${pct>=0.8?'var(--red)':pct>=0.5?'var(--yellow)':'var(--green)'}">${t.usedKg}Kg / ${t.maxKg}Kg</div>
      </div>
    </div>`;
  }).join('');
}

function filterCities() {
  const q = document.getElementById('citySearch').value.toLowerCase().trim();
  const drop = document.getElementById('cityDropdown');
  if (!q) { drop.classList.remove('show'); return; }

  const cities = citiesMap[selectedCountry] || [];
  const matches = cities.filter(c =>
    c.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    drop.innerHTML = '<div class="sr-empty">No cities found</div>';
  } else {
    drop.innerHTML = matches.map(c => `
      <div class="sr-row" onmousedown="openCity('${c.name}')">
        <span class="sr-row-icon">${c.flag || '🏙️'}</span>
        <div><div class="sr-row-name">${c.name}</div><div class="sr-row-sub">${selectedCountry}</div></div>
      </div>`).join('');
  }
  drop.classList.add('show');
}

function filterTravellers() {
  const q = document.getElementById('travellerSearch').value.toLowerCase();
  renderTravellers(travellersData.filter(t => t.name.toLowerCase().includes(q) || t.date.toLowerCase().includes(q)));
}

// ── OPEN ORDER ────────────────────────────────────────────────────────────────
function openOrder(tId) {
  selectedTraveller = travellersData.find(t => t.id === tId);
  orderItems = [newItem()];
  document.getElementById('orderPageTitle').textContent = selectedCity;
  document.getElementById('ord-name').textContent = selectedTraveller.name;
  document.getElementById('ord-date').textContent = selectedTraveller.date;
  document.getElementById('ord-capacity').textContent = `${selectedTraveller.usedKg}Kg / ${selectedTraveller.maxKg}Kg`;
  document.getElementById('ord-price').textContent = `Rp ${selectedTraveller.priceKg.toLocaleString('id-ID')}/kg`;
  document.getElementById('ord-box-svg').innerHTML = `<div style="width:80px;height:80px">${boxSVG(selectedTraveller.usedKg, selectedTraveller.maxKg)}</div>`;
  document.getElementById('ord-rules').innerHTML = selectedTraveller.rules.map(r=>`<li>${r}</li>`).join('');
  renderOrderItems();
  showPage('pageOrder');
}

// ── ITEM MANAGEMENT ───────────────────────────────────────────────────────────
let itemIdCounter = 0;
function newItem() { return { id: ++itemIdCounter, name:'', qty:1, kg:'', note:'' }; }

function addItem() { orderItems.push(newItem()); renderOrderItems(); }

function removeItem(id) {
  if (orderItems.length <= 1) { showToast('At least one item is required.'); return; }
  orderItems = orderItems.filter(i=>i.id!==id);
  renderOrderItems();
}

function renderOrderItems() {
  const el = document.getElementById('itemsContainer');
  el.innerHTML = orderItems.map(item=>`
    <div class="item-entry" id="item-${item.id}">
      <div class="item-img-box">
        <span class="add-photo">📷</span>
        <input type="file" accept="image/*" onchange="previewImg(this, ${item.id})" />
      </div>
      <div class="item-fields">
        <div class="item-row1">
          <input class="item-name-input" type="text" placeholder="Item Name" value="${item.name}"
            onchange="updateItem(${item.id},'name',this.value)" />
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-display" id="qty-${item.id}">${item.qty}x</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        </div>
        <div class="item-row2">
          <input class="item-kg-input" type="number" placeholder="0" min="0" step="0.1" value="${item.kg}"
            onchange="updateItem(${item.id},'kg',this.value)" />
          <span class="kg-label">Kg</span>
          <button class="notes-btn ${item.note?'has-note':''}" onclick="openNotesSheet(${item.id})">
            📋 ${item.note ? item.note.substring(0,15)+(item.note.length>15?'…':'') : 'Notes'}
          </button>
        </div>
      </div>
      ${orderItems.length>1?`<button class="remove-item-btn" onclick="removeItem(${item.id})">×</button>`:''}
    </div>`).join('');
}

function previewImg(input, itemId) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const box = input.closest('.item-img-box');
    box.querySelector('.add-photo').style.display = 'none';
    let img = box.querySelector('img');
    if (!img) { img = document.createElement('img'); box.insertBefore(img, box.querySelector('input')); }
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function updateItem(id, field, val) {
  const item = orderItems.find(i=>i.id===id);
  if (item) item[field] = val;
}

function changeQty(id, delta) {
  const item = orderItems.find(i=>i.id===id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  document.getElementById(`qty-${id}`).textContent = item.qty + 'x';
}

// ── NOTES SHEET ───────────────────────────────────────────────────────────────
function openNotesSheet(itemId) {
  currentNoteItemId = itemId;
  const item = orderItems.find(i=>i.id===itemId);
  document.getElementById('notesInput').value = item ? item.note : '';
  document.getElementById('notesOverlay').classList.add('show');
}
function closeNotesSheet(e) {
  if (!e || e.target===document.getElementById('notesOverlay'))
    document.getElementById('notesOverlay').classList.remove('show');
}
function saveNote() {
  const item = orderItems.find(i=>i.id===currentNoteItemId);
  if (item) item.note = document.getElementById('notesInput').value;
  document.getElementById('notesOverlay').classList.remove('show');
  renderOrderItems();
}

// ── GO TO PAYMENT ─────────────────────────────────────────────────────────────
function goToPayment() {
  const filled = orderItems.filter(i=>i.name.trim() && i.kg);
  if (filled.length === 0) { showToast('Please fill in at least one item.'); return; }

  // Overweight check
  const totalOrderKg = filled.reduce((sum, item) => sum + (parseFloat(item.kg)||0) * item.qty, 0);
  const availableKg  = selectedTraveller.maxKg - selectedTraveller.usedKg;
  if (totalOrderKg > availableKg) {
    showToast('⚠️ Exceeds available space! Max ' + availableKg + 'kg remaining.', 3500);
    return;
  }

  currentOrderId = '#0000' + orderIdCounter++;
  const pricePerKg = selectedTraveller.priceKg;

  let subtotal = 0;
  let itemsHtml = '';
  filled.forEach(item => {
    const kg = parseFloat(item.kg) || 0;
    const price = Math.round(kg * pricePerKg * item.qty);
    subtotal += price;
    itemsHtml += '<div style="display:grid;grid-template-columns:1fr 52px 90px;align-items:center;gap:0;padding:6px 2px;border-bottom:1px solid #e8e8e8">'
      + '<span style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="font-size:10px;color:var(--gray-text)">○</span>' + item.name + ' (' + item.qty + 'x)</span>'
      + '<span style="color:var(--gray-text);font-size:12px;text-align:right;padding-right:8px">' + kg + 'kg</span>'
      + '<span style="text-align:right;font-size:13px">Rp ' + price.toLocaleString('id-ID') + '</span>'
      + '</div>';
  });
  const tax   = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  document.getElementById('pay-id').textContent    = currentOrderId;
  document.getElementById('pay-items').innerHTML   = itemsHtml;
  document.getElementById('pay-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('pay-tax').textContent      = `Rp ${tax.toLocaleString('id-ID')}`;
  document.getElementById('pay-total').textContent    = `Rp ${total.toLocaleString('id-ID')}`;
  document.getElementById('pay-date').textContent     = selectedTraveller.date;
  document.getElementById('pay-amount').textContent   = `Rp ${total.toLocaleString('id-ID')}`;

  // Store for success page
  window._paymentData = { subtotal, tax, total, filled, city: selectedCity, traveller: selectedTraveller, orderId: currentOrderId };
  showPage('pagePayment');
}

// ── CONFIRM PAYMENT ───────────────────────────────────────────────────────────
function confirmPayment() {
  const d   = window._paymentData;
  const btn = document.getElementById('payBtn');
  if (btn) btn.classList.add('loading');

  midtransPay({
    orderId:      d.orderId,
    amount:       d.total,
    itemDetails:  d.filled.map(i => ({
      id:       i.name,
      price:    Math.round(i.price / i.qty),
      quantity: i.qty,
      name:     i.name
    })),
    customerName: (getUser()?.name) || 'Customer',
    onSuccess: function(result) {
      if (btn) btn.classList.remove('loading');
      // Fill success page
      const now = new Date();
      const dateStr = `${now.getDate()} ${now.toLocaleString('en',{month:'long'})} ${now.getFullYear()} – ${String(now.getHours()).padStart(2,'0')}.${String(now.getMinutes()).padStart(2,'0')}`;
      document.getElementById('suc-id').textContent          = d.orderId;
      document.getElementById('suc-city').textContent        = d.city;
      document.getElementById('suc-provider').textContent    = d.traveller.name;
      document.getElementById('suc-total-items').textContent = d.filled.reduce((s,i)=>s+i.qty,0);
      document.getElementById('suc-subtotal').textContent    = `Rp ${d.subtotal.toLocaleString('id-ID')}`;
      document.getElementById('suc-tax').textContent         = `Rp ${d.tax.toLocaleString('id-ID')}`;
      document.getElementById('suc-total').textContent       = `Rp ${d.total.toLocaleString('id-ID')}`;
      document.getElementById('suc-date').textContent        = dateStr;
      showPage('pageSuccess');
    },
    onError: function(msg) {
      if (btn) btn.classList.remove('loading');
      showToast('❌ ' + msg);
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
renderGrid('featuredGrid', featured, 'openCountry', true);
renderGrid('allGrid', all, 'openCountry', true);

  const allCountriesFlat = [...featured, ...all];

  function filterCountries() {
    const q = document.getElementById('countrySearch').value.toLowerCase().trim();
    const drop = document.getElementById('countryDropdown');
    if (!q) { drop.classList.remove('show'); return; }

    const matches = allCountriesFlat.filter(c =>
      c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
    );

    if (!matches.length) {
      drop.innerHTML = '<div class="sr-empty">No countries found</div>';
    } else {
      drop.innerHTML = matches.map(c => `
        <div class="sr-row" onmousedown="openCountry('${c.name}')">
          <span class="sr-row-icon">${c.flag}</span>
          <div><div class="sr-row-name">${c.name}</div><div class="sr-row-sub">${c.region}</div></div>
        </div>`).join('');
    }
    drop.classList.add('show');
  }
