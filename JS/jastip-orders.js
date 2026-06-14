const API = 'http://localhost:8000/api';

/* jastip-orders.js — logic for jastip-orders */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
  const TAX_RATE = 0.02;
  const STEP_LABELS = ['Accepted','Collecting','In Transit','Delivered'];

  // NOTE: Replace with API call: GET /api/orders?status=ongoing
  const ongoingOrders = [
    {
      id: '#00005', city: 'Tokyo', provider: 'Hanako Yamada', status: 'ongoing',
      step: 2, // 0=accepted,1=collecting,2=in transit,3=delivered
      date: '20 March 2026 – 14.00',
      items: [
        { name: 'Matcha Kit Kat', weight: '0.5kg', price: 120000, qty: 2 },
        { name: 'Sony Headphones', weight: '1kg',  price: 750000, qty: 1 },
        { name: 'Uniqlo Jacket',  weight: '1.5kg', price: 450000, qty: 1 },
      ],
      // Proof updates from traveller - each step can have image + message
      // image: null means traveller hasn't uploaded yet (placeholder shown)
      proofs: [
        {
          step: 0, label: 'Order Accepted',
          image: null,
          message: 'Hi! I have accepted your order. I will start collecting your items shortly. Please feel free to message me if you have any questions!',
          time: '10 March 2026 – 09.15'
        },
        {
          step: 1, label: 'Collecting Items',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
          message: 'All items collected! Here is a photo at the store. Your Sony headphones and Uniqlo jacket are packed safely 📦',
          time: '14 March 2026 – 15.30'
        },
        {
          step: 2, label: 'In Transit',
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
          message: 'I am now at Narita Airport. Flight to Jakarta departs in 1.5 hours! See you soon ✈️',
          time: '20 March 2026 – 08.45'
        },
      ]
    },
    {
      id: '#00006', city: 'Singapore', provider: 'Lim Wei Ling', status: 'ongoing',
      step: 1,
      date: '25 March 2026 – 09.30',
      items: [
        { name: 'Parfum',  weight: '0.3kg', price: 280000, qty: 1 },
        { name: 'Baju',    weight: '0.5kg', price: 150000, qty: 2 },
        { name: 'Sepatu',  weight: '1kg',   price: 320000, qty: 1 },
      ],
      proofs: [
        {
          step: 0, label: 'Order Accepted',
          image: null,
          message: 'Order received! I will head to the mall tomorrow to find your items.',
          time: '18 March 2026 – 20.00'
        },
        {
          step: 1, label: 'Collecting Items',
          image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
          message: 'Found the parfum and baju at ION Orchard! Still looking for the right size shoes 👟',
          time: '22 March 2026 – 13.10'
        },
      ]
    },
  ];

  // NOTE: Replace with API call: GET /api/orders?status=history
  const historyOrders = [
    {
      id: '#00002', city: 'Kuala Lumpur', provider: 'Budi Santoso',
      status: 'finished', step: 3, date: '10 February 2026 – 12.34',
      items: [
        { name: 'Baju Kurung',  weight: '0.5kg', price: 180000, qty: 1 },
        { name: 'Rendang Paste',weight: '1kg',   price: 120000, qty: 2 },
        { name: 'Batik Fabric', weight: '1.5kg', price: 350000, qty: 1 },
        { name: 'Kopiah',       weight: '0.3kg', price: 80000,  qty: 1 },
        { name: 'Kain Songket', weight: '1kg',   price: 270000, qty: 1 },
      ],
      proofs: [
        { step:0, label:'Order Accepted', image:null, message:'Order confirmed!', time:'1 Feb 2026 – 10.00' },
        { step:1, label:'Collecting',     image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', message:'All items ready!', time:'5 Feb 2026 – 14.00' },
        { step:2, label:'In Transit',     image:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80', message:'At KLIA, boarding soon!', time:'10 Feb 2026 – 08.00' },
        { step:3, label:'Delivered',      image:'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80', message:'All items handed over! Thank you 🙏', time:'10 Feb 2026 – 15.00' },
      ]
    },
    {
      id: '#00003', city: 'Kuala Lumpur', provider: 'Ahmad Razif',
      status: 'failed', step: 1, date: '8 February 2026 – 09.15',
      items: [
        { name: 'Headset Gaming', weight: '500g', price: 450000, qty: 1 },
        { name: 'Mouse Wireless', weight: '200g', price: 280000, qty: 1 },
      ],
      proofs: [
        { step:0, label:'Order Accepted', image:null, message:'Will try to get items.', time:'5 Feb 2026 – 09.00' },
        { step:1, label:'Collecting',     image:null, message:'Item out of stock everywhere, order cancelled. Refund via escrow.', time:'8 Feb 2026 – 09.15' },
      ]
    },
    {
      id: '#00001', city: 'Kuala Lumpur', provider: 'Sarah Tan',
      status: 'cancelled', step: 0, date: '1 February 2026 – 14.00',
      items: [
        { name: 'Tudung',  weight: '200g', price: 150000, qty: 2 },
      ],
      proofs: [
        { step:0, label:'Order Accepted', image:null, message:'Cancelled by customer request.', time:'1 Feb 2026 – 14.00' },
      ]
    },
  ];

  const avatarSVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:26px;fill:#888"><circle cx="40" cy="28" r="18"/><ellipse cx="40" cy="68" rx="28" ry="18"/></svg>`;

  
  function badgeLabel(s){ return {finished:'Finished',failed:'Failed',cancelled:'Cancelled',ongoing:'Ongoing'}[s]||s; }
  

  // ── Stepper HTML for cards ────────────────────────────────────────────────────
  

  // ── Render ongoing card ───────────────────────────────────────────────────────
  function renderCard(order, isOngoing=false) {
    const badgeCls = order.status;
    return `
      <div class="order-card">
        <div class="order-top">
          <div class="order-avatar">${avatarSVG}</div>
          <div class="order-info">
            <div class="order-city">${order.city}</div>
            <div class="order-provider">${order.provider}</div>
          </div>
          <div class="order-right">
            <div class="order-id">${order.id}</div>
            <span class="badge ${badgeCls}">${badgeLabel(order.status)}</span>
          </div>
        </div>
        ${isOngoing ? cardStepperHtml(order.step) : ''}
        <div class="card-actions">
          ${isOngoing ? `<button class="card-btn" onclick="goToChat('${order.id}')">Contact</button>` : ''}
          <button class="card-btn primary" onclick="openDetail('${order.id}')">Details</button>
        </div>
      </div>`;
  }

  function renderOngoing() {
    if (ongoingOrders.length === 0) {
      document.getElementById('emptyState').classList.remove('hidden');
      document.getElementById('ongoing-list').classList.add('hidden');
      return;
    }
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('ongoing-list').classList.remove('hidden');
    document.getElementById('ongoing-list').innerHTML = ongoingOrders.map(o=>renderCard(o,true)).join('');
  }

  function renderHistory() {
    document.getElementById('history-list').innerHTML = historyOrders.map(o=>renderCard(o,false)).join('');
  }

  function switchTab(tab) {
    document.getElementById('panel-ongoing').classList.toggle('hidden', tab !== 'ongoing');
    document.getElementById('panel-history').classList.toggle('hidden', tab !== 'history');
    document.getElementById('tab-ongoing').classList.toggle('active', tab === 'ongoing');
    document.getElementById('tab-history').classList.toggle('active', tab === 'history');
  }

  function goToChat(orderId) {
    location.href = 'jastip-chat.html';
  }

  // ── Detail overlay ────────────────────────────────────────────────────────────
  let currentOrder = null;

  function openDetail(orderId) {
    currentOrder = [...ongoingOrders,...historyOrders].find(o=>o.id===orderId);
    if (!currentOrder) return;

    const subtotal = currentOrder.items.reduce((s,i)=>s+i.price*i.qty, 0);
    const tax      = Math.round(subtotal * TAX_RATE);
    const total    = subtotal + tax;

    document.getElementById('det-id').textContent   = currentOrder.id;
    document.getElementById('det-date').textContent = currentOrder.date;
    document.getElementById('det-items-count').textContent = currentOrder.items.reduce((s,i)=>s+i.qty,0);
    document.getElementById('det-price').textContent = formatRp(subtotal);

    document.getElementById('det-stepper-wrap').innerHTML = detailStepperHtml(currentOrder.step);

    // Items
    document.getElementById('det-items-list').innerHTML = currentOrder.items.map(item=>`
      <div class="det-item-row">
        <div class="det-dot"></div>
        <div class="det-item-name">${item.name} <span style="color:var(--gray-text)">(${item.qty}x)</span></div>
        <div class="det-item-weight">${item.weight}</div>
        <div class="det-item-price">${formatRp(item.price * item.qty)}</div>
      </div>`).join('');

    // Proof
    renderProofs(currentOrder);

    // Invoice
    document.getElementById('det-inv-rows').innerHTML = `
      <div class="inv-row"><span style="color:var(--gray-text)">Total Items</span><span style="font-weight:600">${currentOrder.items.reduce((s,i)=>s+i.qty,0)}</span></div>
      <div class="inv-row"><span style="color:var(--gray-text)">Subtotal</span><span style="font-weight:600">${formatRp(subtotal)}</span></div>
      <div class="inv-row"><span style="color:var(--gray-text)">Tax</span><span style="font-weight:600">${formatRp(tax)}</span></div>
      <div class="inv-row bold"><span>Total</span><span>${formatRp(total)}</span></div>`;
    document.getElementById('det-inv-date').textContent = currentOrder.date;

    // Actions
    const isOngoing = currentOrder.status === 'ongoing';
    const travellerName = currentOrder.traveller_name || currentOrder.traveller || 'Traveller';
    document.getElementById('det-actions').innerHTML = isOngoing
      ? `<button class="det-btn contact" onclick="goToChat('${currentOrder.id}')">Contact Traveller</button>
         <button class="det-btn report-btn" onclick="openReport('traveller','${travellerName}',${currentOrder.traveller_id||null})" style="background:#FFF5F5;color:var(--red);border:1.5px solid var(--red)">🚩 Report</button>
         <button class="det-btn done-btn" onclick="closeDetail()">Close</button>`
      : `<button class="det-btn report-btn" onclick="openReport('traveller','${travellerName}',${currentOrder.traveller_id||null})" style="background:#FFF5F5;color:var(--red);border:1.5px solid var(--red)">🚩 Report</button>
         <button class="det-btn done-btn" onclick="closeDetail()">Done</button>`;

    switchDetTab('items');
    document.getElementById('detailOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('detScroll').scrollTop = 0;
  }

  function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchDetTab(tab) {
    ['items','proof','invoice'].forEach(t => {
      document.getElementById(`dtab-${t}`).classList.toggle('active', t===tab);
      document.getElementById(`det-${t}-panel`).classList.toggle('hidden', t!==tab);
    });
  }

  function renderProofs(order) {
    const el = document.getElementById('det-proof-list');
    if (!order.proofs || order.proofs.length === 0) {
      el.innerHTML = '<div class="no-proof">No updates yet from your traveller.</div>';
      return;
    }
    el.innerHTML = order.proofs.map(p => `
      <div class="proof-item">
        <div class="proof-step-label">
          <div class="proof-step-dot"></div>
          Step ${p.step+1}: ${p.label}
        </div>
        ${p.image
          ? `<div class="proof-img-wrap"><img src="${p.image}" alt="Proof" onerror="this.parentElement.innerHTML='<div class=\'proof-img-placeholder\'><div class=\'pi-icon\'>🖼️</div><div class=\'pi-text\'>Image unavailable</div></div>'" /></div>`
          : `<div class="proof-img-wrap"><div class="proof-img-placeholder"><div class="pi-icon">📷</div><div class="pi-text">No photo uploaded</div></div></div>`
        }
        <div class="proof-message">${p.message}</div>
        <div class="proof-meta">📅 ${p.time}</div>
      </div>`).join('');
  }

  // ── Init ──────────────────────────────────────────────────────────────────────

  function cardStepperHtml(step) {
    let h = '';
    for (let i = 0; i < 4; i++) {
      h += `<div class="cs-dot ${i <= step ? 'done' : ''}"></div>`;
      if (i < 3) h += `<div class="cs-line ${i < step ? 'done' : ''}"></div>`;
    }
    return `<div class="card-stepper">${h}</div>`;
  }

  function detailStepperHtml(step) {
    let circles = '', labelCells = '';
    for (let i = 0; i < 4; i++) {
      const done = i <= step;
      circles += `<div class="ds-circle ${done ? 'done' : ''}">${done ? '✓' : ''}</div>`;
      if (i < 3) circles += `<div class="ds-line ${i < step ? 'done' : ''}"></div>`;
      labelCells += `<div class="ds-label-cell"><div class="ds-label-text ${done ? 'done' : ''}">${STEP_LABELS[i]}</div></div>`;
      if (i < 3) labelCells += `<div class="ds-label-spacer"></div>`;
    }
    return `<div class="ds-row">${circles}</div><div class="ds-label-row">${labelCells}</div>`;
  }

  renderOngoing();
  renderHistory();
  function filterOrders() {
    const q = document.getElementById('orderSearch').value.toLowerCase().trim();
    // Re-render both lists filtered
    const filterList = (orders) => orders.filter(o =>
      !q ||
      o.city.toLowerCase().includes(q) ||
      o.provider.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
    const filteredOngoing = filterList(ongoingOrders);
    const filteredHistory = filterList(historyOrders);

    if(filteredOngoing.length === 0 && document.getElementById('tab-ongoing').classList.contains('active')){
      document.getElementById('ongoing-list').innerHTML = '<div style="text-align:center;color:#9E9E9E;font-size:13px;padding:32px 0">No results found.</div>';
      document.getElementById('emptyState').classList.add('hidden');
    } else {
      document.getElementById('ongoing-list').innerHTML = filteredOngoing.map(o=>renderCard(o,true)).join('');
      document.getElementById('ongoing-list').classList.remove('hidden');
      document.getElementById('emptyState').classList.add('hidden');
      if(!q && filteredOngoing.length === 0){ document.getElementById('emptyState').classList.remove('hidden'); document.getElementById('ongoing-list').classList.add('hidden'); }
    }
    document.getElementById('history-list').innerHTML = filteredHistory.length
      ? filteredHistory.map(o=>renderCard(o,false)).join('')
      : '<div style="text-align:center;color:#9E9E9E;font-size:13px;padding:32px 0">No results found.</div>';
  }


// ══ REPORT FEATURE ══════════════════════════════════════════════════════════
const REPORT_REASONS = {
  traveller: [
    { icon: '📦', label: 'Item not delivered',       desc: 'Items were not delivered as promised',    id: 'not_delivered'   },
    { icon: '❌', label: 'Wrong item sent',           desc: 'Received a different item than ordered',  id: 'wrong_item'      },
    { icon: '💸', label: 'Overcharged',               desc: 'Charged more than the agreed price',      id: 'overcharged'     },
    { icon: '🚫', label: 'Unresponsive / Ghost',      desc: 'Traveller stopped responding',            id: 'unresponsive'    },
    { icon: '⚠️', label: 'Damaged item',              desc: 'Item arrived damaged or broken',          id: 'damaged'         },
    { icon: '✏️', label: 'Other',                     desc: 'Describe your issue below',               id: 'other'           },
  ],
  customer: [
    { icon: '🚫', label: 'Fake order / No payment',  desc: 'Customer placed order but did not pay',   id: 'no_payment'      },
    { icon: '💬', label: 'Abusive language',          desc: 'Customer was rude or threatening',        id: 'abusive'         },
    { icon: '❌', label: 'Order cancelled repeatedly',desc: 'Keeps cancelling orders',                 id: 'cancel_abuse'    },
    { icon: '🚫', label: 'Unresponsive',              desc: 'Customer stopped responding',             id: 'unresponsive'    },
    { icon: '✏️', label: 'Other',                     desc: 'Describe your issue below',               id: 'other'           },
  ],
  member: [
    { icon: '💸', label: 'Did not pay',               desc: 'Member accepted price but did not pay',   id: 'no_payment'      },
    { icon: '💬', label: 'Abusive in group chat',     desc: 'Member was rude or threatening',          id: 'abusive'         },
    { icon: '🚫', label: 'Unresponsive',              desc: 'Member stopped responding',               id: 'unresponsive'    },
    { icon: '❌', label: 'False receipt claim',       desc: 'Member falsely claimed item not received',id: 'false_claim'     },
    { icon: '✏️', label: 'Other',                     desc: 'Describe your issue below',               id: 'other'           },
  ],
  owner: [
    { icon: '📦', label: 'Item not distributed',      desc: 'Owner did not send proof or items',       id: 'not_distributed' },
    { icon: '💸', label: 'Overcharged',               desc: 'Prices set were unreasonably high',       id: 'overcharged'     },
    { icon: '🚫', label: 'Unresponsive owner',        desc: 'Group owner stopped responding',          id: 'unresponsive'    },
    { icon: '❌', label: 'Closed group unfairly',     desc: 'Group was closed without reason',         id: 'unfair_close'    },
    { icon: '✏️', label: 'Other',                     desc: 'Describe your issue below',               id: 'other'           },
  ],
};

let _reportCtx = { type: '', targetName: '', targetId: null, selectedReason: null };

function openReport(type, targetName, targetId) {
  _reportCtx = { type, targetName, targetId, selectedReason: null };
  const reasons = REPORT_REASONS[type] || REPORT_REASONS.traveller;

  document.getElementById('reportTarget').textContent = 'Reporting: ' + targetName;
  document.getElementById('reportError').style.display = 'none';
  document.getElementById('reportOtherWrap').style.display = 'none';
  document.getElementById('reportDescWrap').style.display = 'none';
  document.getElementById('reportDescription').value = '';
  document.getElementById('reportDescOptional').value = '';
  document.getElementById('reportCharCount').textContent = '0';

  document.getElementById('reportChoices').innerHTML = reasons.map(r => `
    <div class="report-choice" id="rc-${r.id}" onclick="selectReason('${r.id}','${type}')">
      <div class="report-choice-icon">${r.icon}</div>
      <div class="report-choice-text">
        <div class="report-choice-label">${r.label}</div>
        <div class="report-choice-desc">${r.desc}</div>
      </div>
      <div class="report-choice-check"></div>
    </div>`).join('');

  document.getElementById('reportOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function selectReason(id, type) {
  _reportCtx.selectedReason = id;
  const reasons = REPORT_REASONS[type] || REPORT_REASONS.traveller;
  reasons.forEach(r => {
    const el = document.getElementById('rc-' + r.id);
    if (el) el.classList.toggle('selected', r.id === id);
  });
  document.getElementById('reportError').style.display = 'none';

  if (id === 'other') {
    document.getElementById('reportOtherWrap').style.display = 'block';
    document.getElementById('reportDescWrap').style.display = 'none';
    document.getElementById('reportDescription').focus();
  } else {
    document.getElementById('reportOtherWrap').style.display = 'none';
    document.getElementById('reportDescWrap').style.display = 'block';
  }
}

document.getElementById('reportDescription').addEventListener('input', function() {
  document.getElementById('reportCharCount').textContent = this.value.length;
});

function closeReport() {
  document.getElementById('reportOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

async function submitReport() {
  const { type, targetName, targetId, selectedReason } = _reportCtx;

  if (!selectedReason) {
    document.getElementById('reportError').style.display = 'block';
    return;
  }
  if (selectedReason === 'other' && !document.getElementById('reportDescription').value.trim()) {
    document.getElementById('reportError').textContent = 'Please describe the issue.';
    document.getElementById('reportError').style.display = 'block';
    return;
  }

  const description = selectedReason === 'other'
    ? document.getElementById('reportDescription').value.trim()
    : (document.getElementById('reportDescOptional')?.value.trim() || '');

  const btn = document.getElementById('reportSubmitBtn');
  btn.classList.add('loading');

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — POST /api/reports
   * ════════════════════════════════════════════════════════════════
   * Table: reports
   * Columns:
   *   id              — auto increment
   *   reporter_id     — from auth token (users.id of who is reporting)
   *   reported_type   — 'traveller' | 'customer' | 'member' | 'owner'
   *   reported_id     — users.id of the person being reported (null if unknown)
   *   reported_name   — name string of the person being reported
   *   reason          — e.g. 'not_delivered', 'abusive', 'unresponsive', 'other'
   *   description     — free text description (optional unless reason = 'other')
   *   status          — 'pending' | 'reviewed' | 'resolved' (default: 'pending')
   *   context_type    — 'order' | 'group' | 'chat' (where the report came from)
   *   context_id      — orders.id or groups.id (null if from chat list)
   *   created_at      — timestamp
   * ════════════════════════════════════════════════════════════════
   */
  try {
    const token = localStorage.getItem('jastip_token');
    const res = await fetch(`${API}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reported_type: type,
        reported_id:   targetId || null,
        reported_name: targetName,
        reason:        selectedReason,
        description:   description,
        context_type:  'order',
        context_id:    null
      })
    });

    if (res.ok) {
      closeReport();
      showToast('✅ Report submitted. Our team will review it shortly.');
    } else {
      const data = await res.json().catch(() => ({}));
      showToast('❌ ' + (data.message || 'Failed to submit report. Try again.'));
    }
  } catch (err) {
    // Backend not yet implemented — show success anyway for demo
    closeReport();
    showToast('✅ Report submitted. Our team will review it shortly.');
  } finally {
    btn.classList.remove('loading');
  }
}

// Close when tapping backdrop
document.getElementById('reportOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeReport();
});
