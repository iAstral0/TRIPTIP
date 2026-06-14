const API = 'http://localhost:8000/api';

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('jastip_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('jastip_user') || 'null'); }
async function authFetch(url, options = {}) {
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });
}

// ── On load ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) { location.href = 'jastip-login.html'; return; }

  // Load traveller dashboard from API
  try {
    const res  = await authFetch('/traveller/dashboard');
    const data = await res.json();
    if (res.status === 401) { location.href = 'jastip-login.html'; return; }
    if (res.status === 403) { location.href = 'jastip-home.html'; return; }

    // Update stats if elements exist
    const totalTrips   = document.getElementById('statTotalTrips');
    const activeTrips  = document.getElementById('statActiveTrips');
    const totalOrders  = document.getElementById('statTotalOrders');
    const completed    = document.getElementById('statCompleted');
    if (totalTrips)  totalTrips.textContent  = data.stats?.total_trips    ?? 0;
    if (activeTrips) activeTrips.textContent = data.stats?.active_trips   ?? 0;
    if (totalOrders) totalOrders.textContent = data.stats?.total_orders   ?? 0;
    if (completed)   completed.textContent   = data.stats?.completed      ?? 0;
  } catch { /* keep dummy stats */ }
});


/* jastip-traveller-home.js — logic for jastip-traveller-home */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
  const avatarSVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="28" r="18"/><ellipse cx="40" cy="68" rx="28" ry="18"/></svg>`;

  // ── Order detail data (same as traveller-orders.html) ────────────────────────
  const STEP_LABELS = ['Order Accepted','Collecting Items','Travelling / Handover','Payment Ready'];
  const STEP_MESSAGES = [
    { title:'Close Order & Start Collecting?', sub:'The order will be closed. You cannot go back.' },
    { title:'Start Travelling?',               sub:'Mark this when you have collected all items. You cannot go back.' },
    { title:'Begin Handover?',                 sub:'Mark this when you are handing items out. You cannot go back.' },
    { title:'Ready to Receive Payment?',       sub:'All items handed out. You cannot go back.' },
  ];
/* DUMMY DATA — replace with API fetch()
  const orders = [
    { id:'#00003', city:'Kuala Lumpur', provider:'Nama Penerima Jastip', date:'10 February 2026 – 12.34', step:0, customers:[] },
    { id:'#00004', city:'Singapore', provider:'Nama Penerima Jastip', date:'17 February 2026 – 09.00', step:0,
      customers:[
        { id:'c1', name:'Michael', phone:'+62 1231 1233', accepted:false, items:[{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000}] },
        { id:'c2', name:'Sarah',   phone:'+62 812 9988',  accepted:true,  items:[{name:'Lorem ipsum',weight:'500g',price:150000},{name:'Lorem ipsum',weight:'1kg',price:250000}] },
        { id:'c3', name:'Budi',    phone:'+62 877 4455',  accepted:true,  items:[{name:'Lorem ipsum',weight:'2kg',price:300000}] },
        { id:'c4', name:'Rina',    phone:'+62 821 3344',  accepted:false, items:[{name:'Lorem ipsum',weight:'1kg',price:180000},{name:'Lorem ipsum',weight:'1kg',price:220000}] },
        { id:'c5', name:'Dani',    phone:'+62 813 6677',  accepted:true,  items:[{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000},{name:'Lorem ipsum',weight:'1kg',price:200000}] },
      ]
    }
  ];
*/
  let currentOrderId=null, pendingRemoveCid=null;

  
  function totalWeight(customers){ return customers.filter(c=>c.accepted).reduce((s,c)=>s+c.items.reduce((ss,i)=>ss+parseFloat(i.weight),0),0); }
  function totalPrice(customers){ return customers.filter(c=>c.accepted).reduce((s,c)=>s+c.items.reduce((ss,i)=>ss+i.price,0),0); }

  function detailStepperHtml(step){
    let circles='',labelCells='';
    for(let i=0;i<4;i++){
      const done=i<=step;
      circles+=`<div class="ds-circle ${done?'done':''}">${done?'✓':''}</div>`;
      if(i<3)circles+=`<div class="ds-line ${i<step?'done':''}"></div>`;
      labelCells+=`<div class="ds-label-cell"><div class="ds-label-text ${done?'done':''}">${STEP_LABELS[i]}</div></div>`;
      if(i<3)labelCells+=`<div class="ds-label-spacer"></div>`;
    }
    return `<div class="ds-row">${circles}</div><div class="ds-label-row">${labelCells}</div>`;
  }

  function openDetail(orderId){
    currentOrderId=orderId;
    renderDetail();
    document.getElementById('detailOverlay').classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeDetail(){
    document.getElementById('detailOverlay').classList.remove('open');
    document.body.style.overflow='';
  }
  function renderDetail(){
    const order=orders.find(o=>o.id===currentOrderId);
    document.getElementById('det-id').textContent=order.id;
    document.getElementById('det-date').textContent=order.date;
    document.getElementById('det-weight').innerHTML=`${totalWeight(order.customers)}<span>kg</span>`;
    document.getElementById('det-price').textContent=formatRp(totalPrice(order.customers));
    document.getElementById('det-stepper-wrap').innerHTML=detailStepperHtml(order.step);
    const nextBtn=document.getElementById('nextStepBtn');
    const hasAccepted=order.customers.some(c=>c.accepted);
    if(order.step>=3){nextBtn.textContent='Complete';nextBtn.disabled=false;}
    else{nextBtn.textContent='Next Step';nextBtn.disabled=order.customers.length>0&&!hasAccepted;}
    const custDiv=document.getElementById('det-customers');
    if(order.customers.length===0){custDiv.innerHTML=`<div style="text-align:center;color:var(--gray-text);font-size:13px;padding:32px 0">No customers yet.</div>`;return;}
    custDiv.innerHTML=order.customers.map(c=>{
      const itemsHtml=c.items.map(item=>`<div class="item-row"><div class="item-name"><div class="item-dot"></div>${item.name} <span style="color:var(--gray-text);margin-left:2px">(1x)</span></div><div class="item-weight">${item.weight}</div><div class="item-price">${formatRp(item.price)}</div></div>`).join('');
      const actionsHtml=c.accepted?`<div class="cc-actions"><button class="cc-btn remove" onclick="askRemove('${c.id}','${c.name}')">Remove</button></div>`:`<div class="cc-actions"><button class="cc-btn accept" onclick="acceptCustomer('${c.id}')">Accept</button><button class="cc-btn deny" onclick="denyCustomer('${c.id}')">Deny</button></div>`;
      const statusIcon=c.accepted?`<div class="cc-status-icon accepted">✓</div>`:'';
      return `<div class="customer-card" id="cc-${c.id}"><div class="cc-top"><div class="cc-avatar">${avatarSVG}</div><div><div class="cc-name">${c.name}</div><div class="cc-phone">${c.phone}</div></div>${statusIcon}</div><div class="items-hdr"><span>Items</span><span>Kg</span><span>Price</span></div>${itemsHtml}${actionsHtml}</div>`;
    }).join('');
  }
  function acceptCustomer(cid){const order=orders.find(o=>o.id===currentOrderId);const c=order.customers.find(x=>x.id===cid);c.accepted=true;renderDetail();showToast(`✅ ${c.name} accepted!`);}
  function denyCustomer(cid){const order=orders.find(o=>o.id===currentOrderId);order.customers=order.customers.filter(x=>x.id!==cid);renderDetail();showToast('❌ Customer removed.');}
  function askRemove(cid,name){pendingRemoveCid=cid;document.getElementById('removeCustomerName').textContent=name;document.getElementById('removeOverlay').classList.add('show');}
  function doRemove(){closeSheet('removeOverlay');const order=orders.find(o=>o.id===currentOrderId);const c=order.customers.find(x=>x.id===pendingRemoveCid);order.customers=order.customers.filter(x=>x.id!==pendingRemoveCid);renderDetail();showToast(`🗑️ ${c.name} removed.`);pendingRemoveCid=null;}
  function confirmNextStep(){
    const order=orders.find(o=>o.id===currentOrderId);if(order.step>=4)return;
    document.getElementById('proofStepLabel').textContent=STEP_MESSAGES[order.step].title;
    document.getElementById('proofPreview').innerHTML='';document.getElementById('proofPreview').style.display='none';
    document.getElementById('proofMsgInput').value='';document.getElementById('proofFileInput').value='';
    document.getElementById('proofUploadHint').style.display='';
    document.getElementById('proofOverlay').classList.add('show');
  }
  function handleProofFile(input){if(!input.files||!input.files[0])return;const reader=new FileReader();reader.onload=e=>{const prev=document.getElementById('proofPreview');prev.innerHTML=`<img src="${e.target.result}" style="width:100%;height:160px;object-fit:cover;border-radius:10px"/>`;prev.style.display='block';};reader.readAsDataURL(input.files[0]);}
  function submitProofAndAdvance(){
    const hasFile=document.getElementById('proofFileInput').files&&document.getElementById('proofFileInput').files[0];
    const msg=document.getElementById('proofMsgInput').value.trim();
    if(!hasFile){showToast('⚠️ Please upload a photo.');return;}
    if(!msg){showToast('⚠️ Please write a message.');return;}
    closeSheet('proofOverlay');
    const order=orders.find(o=>o.id===currentOrderId);
    const m=STEP_MESSAGES[order.step]||{title:'Proceed?',sub:'You cannot go back.'};
    document.getElementById('nextSheetTitle').textContent=m.title;
    document.getElementById('nextSheetSub').textContent=m.sub;
    document.getElementById('nextStepOverlay').classList.add('show');
  }
  function doNextStep(){closeSheet('nextStepOverlay');const order=orders.find(o=>o.id===currentOrderId);if(order.step<4)order.step++;renderDetail();showToast('✅ Step advanced! Proof sent to customers.');if(order.step===4){document.getElementById('nextStepBtn').textContent='Done';document.getElementById('nextStepBtn').disabled=false;}}

  // ── Current Orders — same data as jastip-traveller-orders.html ───────────────
  // NOTE: Replace with API call: GET /api/traveller/orders
/* DUMMY DATA — replace with API fetch()
  const currentOrders = [
    { id: '#00003', city: 'Kuala Lumpur', provider: 'Nama Penerima Jastip', date: '10 February 2026', step: 0, customerCount: 0 },
    { id: '#00004', city: 'Singapore',    provider: 'Nama Penerima Jastip', date: '17 February 2026', step: 0, customerCount: 5 },
  ];
*/

  function cardStepperHtml(step) {
    let h = '';
    for (let i = 0; i < 4; i++) {
      h += `<div class="cs-dot ${i <= step ? 'done' : ''}"></div>`;
      if (i < 3) h += `<div class="cs-line ${i < step ? 'done' : ''}"></div>`;
    }
    return `<div class="card-stepper">${h}</div>`;
  }

  function renderCurrentOrders() {
    const el = document.getElementById('currentOrdersList');
    if (!currentOrders.length) {
      el.innerHTML = `<div style="text-align:center;color:var(--gray-text);font-size:13px;padding:16px 0">No active orders. Create a trip above!</div>`;
      return;
    }
    el.innerHTML = currentOrders.map(o => `
      <div class="order-card">
        <div class="oc-top">
          <div class="oc-avatar">${avatarSVG}</div>
          <div class="oc-info">
            <div class="oc-city">${o.city}</div>
            <div class="oc-provider">${o.customerCount} customer${o.customerCount !== 1 ? 's' : ''}</div>
          </div>
          <div class="oc-right">
            <div class="oc-id">${o.id}</div>
            <div class="oc-date">${o.date.split(' ').slice(0,3).join(' ')}</div>
          </div>
        </div>
        ${cardStepperHtml(o.step)}
        <div class="oc-actions">
          <button class="oc-btn contact" onclick="event.stopPropagation();location.href='jastip-traveller-chat.html'">Contact</button>
          <button class="oc-btn details" onclick="event.stopPropagation();location.href='jastip-traveller-orders.html?order='+encodeURIComponent(o.id)">Details</button>
        </div>
      </div>`).join('');
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────
  function showToast(msg, dur = 2400) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  // ── Create Trip 3-Step Flow ───────────────────────────────────────────────────
  let ctRules = ['No prohibited goods', 'No liquids over 100ml', 'Items must be labelled clearly'];

  let currentTripType = 'International';

  function openCreateTrip(type) {
    currentTripType = type;
    // Show/hide form sections based on type
    const intlSections = document.querySelectorAll('.form-intl-only');
    const domSections  = document.querySelectorAll('.form-dom-only');
    intlSections.forEach(el => el.style.display = type==='International' ? '' : 'none');
    domSections.forEach(el  => el.style.display = type==='Domestic'      ? '' : 'none');
    // Reset all fields
    ['ct-booking','ct-flight','ct-from','ct-to','ct-city','ct-maxkg','ct-price','ct-nik','ct-idname','ct-address','ct-workid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // NOTE: When backend ready, check GET /api/user/id-card
    // For now, simulate: if sessionStorage has id card data, pre-fill and skip step 2
    const savedId = sessionStorage.getItem('jastip_id_card');
    if (savedId) {
      try {
        const id = JSON.parse(savedId);
        if (document.getElementById('ct-nik'))    document.getElementById('ct-nik').value    = id.nik    || '';
        if (document.getElementById('ct-idname')) document.getElementById('ct-idname').value = id.name   || '';
        if (document.getElementById('ct-dob'))    document.getElementById('ct-dob').value    = id.dob    || '';
        if (document.getElementById('ct-address'))document.getElementById('ct-address').value= id.address|| '';
      } catch(e) {}
    }
    document.getElementById('ct-country').value = '';
    document.getElementById('ct-from-country').value = '';
    document.getElementById('ct-from').innerHTML = '<option value="">Select Town / City</option>';
    document.getElementById('ct-to').value = '';
    document.getElementById('ct-city').value = '';
    document.getElementById('ct-return-airport').value = '';
    const domFrom = document.getElementById('ct-dom-from');
    const domTo   = document.getElementById('ct-dom-to');
    // Reset domestic transport toggle
    domTransportType = null;
    ['domAirportFields','domVehicleFields'].forEach(id => {const el=document.getElementById(id);if(el)el.style.display='none';});
    ['domTransAirport','domTransVehicle'].forEach(id => {const el=document.getElementById(id);if(el)el.style.cssText='flex:1;padding:11px;border:2px solid #ddd;border-radius:10px;background:var(--white);font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer';});
    const domTrans= document.getElementById('ct-transport');
    if(domFrom)  domFrom.value = '';
    if(domTo)    domTo.value   = '';
    if(domTrans) domTrans.value= '';
    document.getElementById('ct-gender').value  = '';
    document.getElementById('ct-dob').value     = '';
    document.getElementById('ct-depart').value  = '';
    document.getElementById('ct-arrive').value  = '';
    ctRules = ['No prohibited goods', 'No liquids over 100ml', 'Items must be labelled clearly'];
    renderCtRules();
  // Close search on main scroll
  document.querySelector('.main-scroll')?.addEventListener('scroll', closeTravSearch);
    // Reset photo boxes
    ['ct-ticket-box','ct-id-box','ct-selfie-box'].forEach(id => {
      const box = document.getElementById(id);
      if (!box) return;
      const img = box.querySelector('img');
      if (img) img.remove();
      const hint = box.querySelector('.ct-photo-hint');
      if (hint) hint.style.display = '';
    });
    goCtStep(1);
  }

  function closeCreateTrip() {
    [1,2,3].forEach(n => document.getElementById('ctStep'+n).classList.remove('open'));
  }

  function goCtStep(n) {
    [1,2,3].forEach(i => document.getElementById('ctStep'+i).classList.remove('open'));
    if (n === 3) {
      // Save ID card to sessionStorage so future trips skip step 2
      const idData = {
        nik:     (document.getElementById('ct-nik')    &&document.getElementById('ct-nik').value)    ||'',
        name:    (document.getElementById('ct-idname') &&document.getElementById('ct-idname').value)  ||'',
        dob:     (document.getElementById('ct-dob')    &&document.getElementById('ct-dob').value)     ||'',
        address: (document.getElementById('ct-address')&&document.getElementById('ct-address').value) ||'',
      };
      if (idData.nik) sessionStorage.setItem('jastip_id_card', JSON.stringify(idData));
      buildCtPreview();
    }
    document.getElementById('ctStep'+n).classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function handleCtPhoto(inputId, boxId, hintId) {
    const input = document.getElementById(inputId);
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      const box  = document.getElementById(boxId);
      const hint = document.getElementById(hintId);
      hint.style.display = 'none';
      let img = box.querySelector('img');
      if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:140px;object-fit:cover'; box.appendChild(img); }
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }

  // ── City map per country (matches international page) ──────────────────────
  const COUNTRY_CITIES = {
    'Singapore': ['Singapore City','Jurong','Woodlands','Orchard','Sentosa'],
    'Japan':     ['Tokyo','Osaka','Kyoto','Yokohama','Sapporo','Fukuoka','Nagoya'],
    'Korea':     ['Seoul','Busan','Incheon','Daegu','Jeju'],
    'Malaysia':  ['Kuala Lumpur','Penang','Johor Bahru','Kota Kinabalu','Kuching'],
    'Thailand':  ['Bangkok','Phuket','Chiang Mai','Pattaya','Hat Yai'],
    'USA':       ['New York','Los Angeles','Chicago','Houston','San Francisco','Las Vegas'],
    'UK':        ['London','Manchester','Edinburgh','Birmingham','Liverpool'],
    'Australia': ['Sydney','Melbourne','Brisbane','Perth','Adelaide'],
    'France':    ['Paris','Lyon','Nice','Marseille','Bordeaux'],
    'Germany':   ['Berlin','Munich','Hamburg','Frankfurt','Cologne'],
    'China':     ['Beijing','Shanghai','Guangzhou','Shenzhen','Chengdu'],
    'Hong Kong': ['Central','Kowloon','Lantau','Mong Kok','Tsim Sha Tsui'],
    'Turkey':    ['Istanbul','Ankara','Izmir','Antalya','Bursa'],
    'India':     ['Mumbai','New Delhi','Bangalore','Chennai','Kolkata'],
    'Italy':     ['Rome','Milan','Florence','Venice','Naples'],
    'Spain':     ['Madrid','Barcelona','Seville','Valencia','Bilbao'],
    'Netherlands':['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven'],
    'Sweden':    ['Stockholm','Gothenburg','Malmö','Uppsala','Västerås'],
    'UAE':       ['Dubai','Abu Dhabi','Sharjah','Ajman','Al Ain'],
    'Saudi Arabia':['Riyadh','Jeddah','Mecca','Medina','Dammam'],
  };

  // ── Domestic transport type toggle ────────────────────────────────────────
  let domTransportType = null;
  function domSelectTransport(type) {
    domTransportType = type;
    const airBtn = document.getElementById('domTransAirport');
    const vehBtn = document.getElementById('domTransVehicle');
    const airF   = document.getElementById('domAirportFields');
    const vehF   = document.getElementById('domVehicleFields');
    if (!airBtn) return;
    if (type === 'airport') {
      airBtn.style.cssText = 'flex:1;padding:11px;border:2px solid var(--purple);border-radius:10px;background:var(--purple-bg);font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer;color:var(--purple)';
      vehBtn.style.cssText = 'flex:1;padding:11px;border:2px solid #ddd;border-radius:10px;background:var(--white);font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer';
      airF.style.display = 'block';
      vehF.style.display = 'none';
    } else {
      vehBtn.style.cssText = 'flex:1;padding:11px;border:2px solid var(--purple);border-radius:10px;background:var(--purple-bg);font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer;color:var(--purple)';
      airBtn.style.cssText = 'flex:1;padding:11px;border:2px solid #ddd;border-radius:10px;background:var(--white);font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer';
      vehF.style.display = 'block';
      airF.style.display = 'none';
    }
    // Show/hide the main proof box based on transport type
    const mainProofBox = document.getElementById('ct-ticket-box');
    const mainProofTitle = document.getElementById('ctProofSectionTitle');
    if (type === 'airport') {
      // Show main proof box for airport
      if (mainProofBox) mainProofBox.style.display = '';
      if (mainProofTitle) mainProofTitle.style.display = '';
    } else {
      // Hide main proof box for vehicle (optional one is above)
      if (mainProofBox) mainProofBox.style.display = 'none';
      if (mainProofTitle) mainProofTitle.style.display = 'none';
    }
    // Update hidden ct-transport field
    if (type === 'airport') {
      const airport = document.getElementById('ct-dom-airport')?.value || '';
      document.getElementById('ct-transport').value = '✈️ Airport – ' + airport;
    } else {
      document.getElementById('ct-transport').value = '🚌 Vehicle';
    }
  }

  // ── International "To" country → cities/airports ────────────────────────
  const toCitiesMap = {
    'Indonesia':     ['CGK – Soekarno-Hatta, Jakarta','DPS – Ngurah Rai, Bali','SUB – Juanda, Surabaya','UPG – Hasanuddin, Makassar','KNO – Kualanamu, Medan','BDO – Bandung','JOG – Yogyakarta','SRG – Semarang','SOC – Solo','MLG – Malang'],
    'Singapore':     ['SIN – Changi Airport','Orchard','Jurong East','Tampines','Woodlands'],
    'Japan':         ['NRT – Narita, Tokyo','HND – Haneda, Tokyo','KIX – Kansai, Osaka','CTS – Chitose, Sapporo','FUK – Fukuoka','OKA – Naha, Okinawa'],
    'Korea':         ['ICN – Incheon, Seoul','GMP – Gimpo, Seoul','PUS – Busan','CJU – Jeju'],
    'Malaysia':      ['KUL – KLIA, Kuala Lumpur','LGK – Langkawi','BKI – Kota Kinabalu','KCH – Kuching','PEN – Penang'],
    'Thailand':      ['BKK – Suvarnabhumi, Bangkok','DMK – Don Mueang, Bangkok','HKT – Phuket','CNX – Chiang Mai'],
    'USA':           ['JFK – New York','LAX – Los Angeles','SFO – San Francisco','ORD – Chicago','MIA – Miami','LAS – Las Vegas'],
    'UK':            ['LHR – Heathrow, London','LGW – Gatwick, London','MAN – Manchester','BHX – Birmingham'],
    'Australia':     ['SYD – Sydney','MEL – Melbourne','BNE – Brisbane','PER – Perth','ADL – Adelaide'],
    'France':        ['CDG – Charles de Gaulle, Paris','ORY – Orly, Paris','NCE – Nice','MRS – Marseille'],
    'Germany':       ['FRA – Frankfurt','MUC – Munich','TXL – Berlin','DUS – Düsseldorf'],
    'China':         ['PEK – Beijing Capital','PVG – Shanghai Pudong','CAN – Guangzhou','SZX – Shenzhen','CTU – Chengdu'],
    'Hong Kong':     ['HKG – Hong Kong International'],
    'Turkey':        ['IST – Istanbul Airport','SAW – Sabiha Gökçen, Istanbul','AYT – Antalya'],
    'India':         ['DEL – Indira Gandhi, Delhi','BOM – Mumbai','BLR – Bangalore','MAA – Chennai'],
    'Italy':         ['FCO – Fiumicino, Rome','MXP – Malpensa, Milan','VCE – Venice','FLR – Florence'],
    'Spain':         ['MAD – Barajas, Madrid','BCN – El Prat, Barcelona','AGP – Málaga'],
    'Netherlands':   ['AMS – Schiphol, Amsterdam'],
    'Sweden':        ['ARN – Arlanda, Stockholm','GOT – Gothenburg','MMX – Malmö'],
    'UAE':           ['DXB – Dubai International','AUH – Abu Dhabi'],
    'Saudi Arabia':  ['RUH – King Khalid, Riyadh','JED – King Abdulaziz, Jeddah','MED – Prince Mohammad, Madinah'],
  };

  function updateToCities() {
    const country = document.getElementById('ct-to-country')?.value || '';
    const sel = document.getElementById('ct-to');
    if (!sel) return;
    const cities = toCitiesMap[country] || [];
    sel.innerHTML = '<option value="">Select City / Airport</option>' +
      cities.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function updateFromCities() {
    const country = document.getElementById('ct-from-country').value;
    const citySelect = document.getElementById('ct-from');
    const cities = COUNTRY_CITIES[country] || [];
    citySelect.innerHTML = '<option value="">Select Town / City</option>'
      + cities.map(city => `<option value="${city}">${city}</option>`).join('');
    // Sync hidden fields for customer listing
    document.getElementById('ct-country').value = country;
    document.getElementById('ct-city').value    = '';
  }

  // When from city is selected, sync ct-city hidden field
  document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'ct-from') {
      document.getElementById('ct-city').value = e.target.value;
    }
    if (e.target && e.target.id === 'ct-to') {
      document.getElementById('ct-return-airport').value = e.target.value;
    }
  });

  function renderCtRules() {
    document.getElementById('ct-rules-list').innerHTML = ctRules.map((r, i) => `
      <div class="ct-rule-row">
        <span class="ct-rule-num">${i+1}.</span>
        <input class="ct-input" value="${r}" style="flex:1" oninput="ctRules[${i}]=this.value" placeholder="Rule ${i+1}" />
        <button class="ct-rule-del" onclick="removeCtRule(${i})">×</button>
      </div>`).join('');
  }

  function addCtRule() {
    ctRules.push('');
    renderCtRules();
  // Close search on main scroll
  document.querySelector('.main-scroll')?.addEventListener('scroll', closeTravSearch);
    // Focus last input
    setTimeout(() => {
      const inputs = document.querySelectorAll('#ct-rules-list .ct-input');
      if (inputs.length) inputs[inputs.length-1].focus();
    }, 50);
  }

  function removeCtRule(i) {
    if (ctRules.length <= 1) { showToast('At least one rule is required.'); return; }
    ctRules.splice(i, 1);
    renderCtRules();
  // Close search on main scroll
  document.querySelector('.main-scroll')?.addEventListener('scroll', closeTravSearch);
  }

  function buildCtPreview() {
    const isDom      = currentTripType === 'Domestic';
    const country    = isDom ? 'Indonesia 🇮🇩' : (document.getElementById('ct-country').value || '—');
    const city       = isDom ? (document.getElementById('ct-dom-from').value||'—') : (document.getElementById('ct-city').value.trim()||'—');
    const fromCountry= isDom ? 'Indonesia 🇮🇩' : (document.getElementById('ct-from-country').value || '—');
    const from       = isDom ? (document.getElementById('ct-dom-from').value||'—') : (document.getElementById('ct-from').value.trim()||'—');
    const to         = isDom ? (document.getElementById('ct-dom-to').value||'—') : (document.getElementById('ct-to').value.trim()||'—');
    const transport  = isDom ? (document.getElementById('ct-transport').value||'—') : null;
    const flight     = document.getElementById('ct-flight').value.trim() || '—';
    const booking    = document.getElementById('ct-booking').value.trim() || '—';
    const arrive     = document.getElementById('ct-arrive').value || '—';
    const depart     = document.getElementById('ct-depart').value || '—';
    const maxkg      = document.getElementById('ct-maxkg').value || '0';
    const price      = parseInt(document.getElementById('ct-price').value) || 0;
    const name       = document.getElementById('ct-idname').value.trim() || 'Nama Penyedia Jastip';
    const rulesHtml  = ctRules.filter(r=>r.trim()).map((r,i)=>`<li>${r}</li>`).join('');

    // Open green box SVG matching international page
    const boxSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:80px">
      <rect x="10" y="45" width="80" height="45" rx="4" fill="#4CAF50"/>
      <polygon points="10,45 50,30 90,45 50,60" fill="#4CAF50" opacity="0.85"/>
      <polygon points="10,45 30,20 50,30 50,60" fill="#4CAF50" opacity="0.7"/>
      <polygon points="90,45 70,20 50,30 50,60" fill="#4CAF50" opacity="0.7"/>
      <rect x="10" y="45" width="80" height="45" rx="4" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
    </svg>`;

    // Format arrive date nicely
    let arriveDisplay = arrive;
    if(arrive && arrive !== '—'){
      const d = new Date(arrive);
      arriveDisplay = d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    }

    document.getElementById('ct-preview-content').innerHTML = `
      <div style="text-align:center;padding:16px 0 8px">
        <div style="font-size:18px;font-weight:700">${name}</div>
        <div style="font-size:12px;color:var(--gray-text);margin-top:6px">
          Arrived at <span style="background:#E8F5E9;color:#4CAF50;font-weight:600;padding:3px 10px;border-radius:20px;font-size:11px">${arriveDisplay}</span>
        </div>
        <div style="font-size:12px;color:var(--gray-text);margin-top:4px">Issued Ticket</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;margin:10px 0 6px">
        ${boxSvg}
        <div style="font-size:18px;font-weight:700;margin-top:8px">0Kg / ${maxkg}Kg</div>
        <div style="font-size:15px;font-weight:700">Rp ${price.toLocaleString('id-ID')}/kg</div>
      </div>
      <div style="background:var(--gray-bg);border-radius:14px;padding:16px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;text-align:center;margin-bottom:12px">Jastiper's Rules</div>
        <ol style="list-style:decimal;padding-left:18px;margin:0">
          ${ctRules.filter(r=>r.trim()).map((r,i)=>`<li style="font-size:12px;margin-bottom:6px;line-height:1.6;word-break:break-word;overflow-wrap:break-word;white-space:normal;max-width:100%">${r}</li>`).join('')}
        </ol>
      </div>
      <div style="background:#FFF8E1;border-left:3px solid #FFB300;border-radius:8px;padding:10px 14px;font-size:12px;color:#795548;line-height:1.5;margin-bottom:8px">
        ⚠️ Once confirmed, this trip will be <strong>visible to customers</strong> in the ${city}, ${country} listing. You cannot change the price or weight after publishing.
      </div>`;
  }

  function validateStep1() {
    const fields = [
      { id:'ct-booking',      label:'Booking Code' },
      { id:'ct-flight',       label:'Flight Number' },
      { id:'ct-from-country', label:'Origin Country' },
      { id:'ct-from',         label:'Origin Town / City' },
      { id:'ct-to',           label:'Return Airport in Indonesia' },
      { id:'ct-depart',       label:'Order Close Date' },
      { id:'ct-arrive',       label:'Estimated Arrival Date' },
      { id:'ct-maxkg',        label:'Max Weight' },
      { id:'ct-price',        label:'Price per kg' },
    ];
    // Extra date validation: arrival must be after close date and year >= 2025
    const depart = document.getElementById('ct-depart').value;
    const arrive = document.getElementById('ct-arrive').value;
    if (depart && arrive && arrive < depart) {
      showToast('⚠️ Arrival date must be after order close date.');
      document.getElementById('ct-arrive').focus();
      return;
    }
    if (depart && new Date(depart).getFullYear() < 2025) {
      showToast('⚠️ Order close date must be 2025 or later.');
      return;
    }
    for (const f of fields) {
      const el = document.getElementById(f.id);
      if (!el || !el.value.trim()) {
        showToast('⚠️ Please fill in: ' + f.label);
        el && el.focus();
        return;
      }
    }
    const hasTicket = document.getElementById('ct-ticket-input').files && document.getElementById('ct-ticket-input').files[0];
    if (!hasTicket) { showToast('⚠️ Please upload your flight ticket photo.'); return; }
    goCtStep(2);
  }

  function validateStep2() {
    // Check if ID already saved from registration
    const savedId = sessionStorage.getItem('jastip_id_card');
    if (savedId) {
      // ID already on file — skip straight to preview
      showToast('✅ ID card already saved — skipping to preview.');
      goCtStep(3);
      return;
    }
    const fields = [
      { id:'ct-nik',     label:'NIK' },
      { id:'ct-idname',  label:'Name (as on ID)' },
      { id:'ct-dob',     label:'Date of Birth' },
      { id:'ct-gender',  label:'Gender' },
      { id:'ct-address', label:'Address' },
    ];
    for (const f of fields) {
      const el = document.getElementById(f.id);
      if (!el || !el.value.trim()) {
        showToast('⚠️ Please fill in: ' + f.label);
        el && el.focus();
        return;
      }
    }
    const hasId     = document.getElementById('ct-id-input').files && document.getElementById('ct-id-input').files[0];
    const hasSelfie = document.getElementById('ct-selfie-input').files && document.getElementById('ct-selfie-input').files[0];
    if (!hasId)     { showToast('⚠️ Please upload your ID card photo.'); return; }
    if (!hasSelfie) { showToast('⚠️ Please upload a selfie holding your ID card.'); return; }
    goCtStep(3);
  }

  async function confirmCreateTrip() {
    const btn = document.getElementById('ct-confirm-btn') || document.querySelector('.ct-next-btn.ready');
    if (btn) { btn.textContent = 'Publishing...'; btn.disabled = true; }
    await new Promise(r => setTimeout(r, 1000));

    const isDom     = currentTripType === 'Domestic';
    const city      = document.getElementById('ct-city')?.value || document.getElementById('ct-dom-to')?.value || '';
    const country   = document.getElementById('ct-country')?.value || (isDom ? 'Indonesia' : '');
    const fromCity  = isDom ? (document.getElementById('ct-dom-from')?.value || '') : (document.getElementById('ct-from')?.value || '');
    const priceKg   = parseFloat(document.getElementById('ct-price')?.value) || 0;
    const maxKg     = parseFloat(document.getElementById('ct-weight')?.value) || 0;
    const depart    = document.getElementById('ct-depart')?.value || '';
    const arrive    = document.getElementById('ct-arrive')?.value || '';

    // Add to current orders list
    const newOrder = {
      id: 'NEW' + Date.now(),
      type: isDom ? 'Domestic' : 'International',
      city: city || 'Unknown City',
      country: country || 'Indonesia',
      fromCity: fromCity,
      pricePerKg: priceKg,
      maxKg: maxKg,
      departDate: depart,
      arriveDate: arrive,
      status: 'Open',
      customers: [],
      step: 0,
    };
    orders.push(newOrder);
    renderCurrentOrders();

    closeCreateTrip();
    document.body.style.overflow = '';
    showToast('✅ Trip published! Customers can now find you.');
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  renderCurrentOrders();

  // ── Traveller home search ────────────────────────────────────────────────
  function travellerSearch(q) {
    q = q.trim();
    const panel   = document.getElementById('travSearchResults');
    const overlay = document.getElementById('travSrOverlay');
    if (!q) { closeTravSearch(); return; }

    const ql = q.toLowerCase();

    // Build search items from what's on this page
    const items = [
      // Create A New Trip options
      { name:'Create International Trip', sub:'New trip · From abroad to destination', icon:'✈️', type:'action', action:()=>openCreateTrip('International') },
      { name:'Create Domestic Trip',      sub:'New trip · Between Indonesian cities',  icon:'🏠', type:'action', action:()=>openCreateTrip('Domestic') },
      // Current orders
      ...currentOrders.map(o=>({
        name: o.city + ' — ' + o.country,
        sub:  o.status + ' · Order #' + o.id,
        icon: '📦',
        type: 'order',
        id: o.id,
      })),
      // Chat shortcut
      { name:'Chat', sub:'Open your conversations', icon:'💬', type:'link', url:'jastip-traveller-chat.html' },
    ];

    const matches = items.filter(item =>
      item.name.toLowerCase().includes(ql) || item.sub.toLowerCase().includes(ql)
    );

    if (!matches.length) {
      panel.innerHTML = `<div class="sr-empty">No results for "<strong>${q}</strong>"</div>`;
    } else {
      const grouped = {};
      matches.forEach(item => {
        const sec = item.type==='action' ? 'Create Trip' : item.type==='order' ? 'Your Orders' : 'Navigation';
        if (!grouped[sec]) grouped[sec] = [];
        grouped[sec].push(item);
      });
      let html = '';
      Object.entries(grouped).forEach(([section, grpItems]) => {
        html += `<div class="sr-section">${section}</div>`;
        html += grpItems.map(item => `
          <div class="sr-item" onclick="travSrSelect(${JSON.stringify(item).replace(/"/g,'&quot;')})">
            <div class="sr-icon">${item.icon}</div>
            <div class="sr-info">
              <div class="sr-name">${highlightTravMatch(item.name, ql)}</div>
              <div class="sr-sub">${item.sub}</div>
            </div>
            <span class="sr-arrow">›</span>
          </div>`).join('');
      });
      panel.innerHTML = html;
    }
    panel.classList.add('show');
    overlay.classList.add('show');
  }

  function travSrSelect(item) {
    closeTravSearch();
    if (item.type === 'action') {
      openCreateTrip(item.name.includes('International') ? 'International' : 'Domestic');
    } else if (item.type === 'order') {
      const order = currentOrders.find(o => o.id == item.id);
      if (order) openOrderDetail(order);
    } else if (item.type === 'link') {
      location.href = item.url;
    }
  }

  function highlightTravMatch(text, q) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return text.substring(0,idx) +
      `<span style="color:var(--purple);font-weight:700">${text.substring(idx,idx+q.length)}</span>` +
      text.substring(idx+q.length);
  }

  function travSrNavigate(type, id) {
    closeTravSearch();
    if (type === 'order' && id) {
      const order = currentOrders.find(o => o.id == id);
      if (order) openOrderDetail(order);
    }
  }

  function closeTravSearch() {
    const panel   = document.getElementById('travSearchResults');
    const overlay = document.getElementById('travSrOverlay');
    if (panel)   panel.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    const input = document.getElementById('travSearchInput');
    if (input) input.value = '';
  }

  renderCtRules();
  // Close search on main scroll
  document.querySelector('.main-scroll')?.addEventListener('scroll', closeTravSearch);
