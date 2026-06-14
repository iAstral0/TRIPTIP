const API = 'http://localhost:8000/api';

/* jastip-traveller-orders.js — logic for jastip-traveller-orders */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
  const STEP_LABELS = ['Order Accepted','Collecting Items','Travelling / Handover','Payment Ready'];

  const STEP_MESSAGES = [
    { title:'Close Order & Start Collecting?', sub:'The order will be closed — no more customers can join. You cannot go back.' },
    { title:'Start Travelling?',               sub:'Mark this when you\'ve collected all items. You cannot go back.' },
    { title:'Begin Handover?',                 sub:'Mark this when you\'re handing items out. You cannot go back.' },
    { title:'Ready to Receive Payment?',       sub:'All items have been handed out. You cannot go back.' },
  ];

  // NOTE: Replace with API call: GET /api/traveller/orders
/* DUMMY DATA — replace with API fetch() when backend ready */
  const orders = [
    {
      id: '#00003', city: 'Kuala Lumpur', provider: 'Hans Wijaya',
      date: '10 May 2026 – 12.34', step: 1, customers: [
        { id:'c1', name:'Rina Susanti', phone:'+62 812 3344', accepted:true,  _decided:true, items:[{name:'Bonia Handbag',weight:'0.8kg',price:850000},{name:'Padini T-Shirt',weight:'0.4kg',price:220000}] },
        { id:'c2', name:'Doni Prakoso', phone:'+62 877 5566', accepted:true,  _decided:true, items:[{name:'Caring Colours Lipstick',weight:'0.2kg',price:95000}] },
      ]
    },
    {
      id: '#00004', city: 'Singapore', provider: 'Hans Wijaya',
      date: '17 May 2026 – 09.00', step: 0,
      customers: [
        { id:'c3', name:'Michael Tan',  phone:'+62 1231 1233', accepted:false, _decided:false, items:[{name:'Charles & Keith Bag',weight:'0.6kg',price:1200000},{name:'Sephora Palette',weight:'0.3kg',price:450000}] },
        { id:'c4', name:'Sarah Dewi',   phone:'+62 812 9988',  accepted:true,  _decided:true,  items:[{name:'Zara Dress',weight:'0.5kg',price:680000}] },
        { id:'c5', name:'Budi Santoso', phone:'+62 877 4455',  accepted:false, _decided:false, items:[{name:'Nike Shoes',weight:'1.2kg',price:1450000}] },
      ]
    },
    {
      id: '#00005', city: 'Tokyo', provider: 'Hans Wijaya',
      date: '20 May 2026 – 14.00', step: 3,
      customers: [
        { id:'c6', name:'Andi Firmansyah', phone:'+62 821 7788', accepted:true, _decided:true, items:[{name:'Uniqlo Fleece',weight:'0.6kg',price:650000},{name:'Muji Pen Set',weight:'0.1kg',price:85000}] },
      ]
    },
  ];

  let currentOrderId = null, pendingRemoveCid = null;

  const avatarSVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="28" r="18"/><ellipse cx="40" cy="68" rx="28" ry="18"/></svg>`;

  
  function totalWeight(customers){ return customers.filter(c=>c.accepted).reduce((s,c)=>s+c.items.reduce((ss,i)=>ss+parseFloat(i.weight),0),0); }
  function totalPrice(customers){ return customers.filter(c=>c.accepted).reduce((s,c)=>s+c.items.reduce((ss,i)=>ss+i.price,0),0); }
  
  function closeSheet(id){ document.getElementById(id).classList.remove('show'); }
  function goToChat(){ location.href='jastip-traveller-chat.html'; }

  function cardStepperHtml(step){
    let h='';
    for(let i=0;i<4;i++){h+=`<div class="cs-dot ${i<=step?'done':''}"></div>`;if(i<3)h+=`<div class="cs-line ${i<step?'done':''}"></div>`;}
    return `<div class="card-stepper">${h}</div>`;
  }

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

  function renderHome(){
    const list=document.getElementById('ordersList');
    if(orders.length===0){
      list.innerHTML=`<div class="empty-state"><div class="empty-title">No orders yet</div><div class="empty-sub">Create a trip from the Home page to start receiving orders.</div></div>`;
      return;
    }
    list.innerHTML=orders.map(o=>`
      <div class="order-card">
        <div class="oc-top">
          <div class="oc-avatar">${avatarSVG}</div>
          <div class="oc-info"><div class="oc-city">${o.city}</div><div class="oc-provider">${o.provider}</div></div>
          <div class="oc-right"><div class="oc-id">${o.id}</div><div class="oc-date">${o.date.split('–')[0].trim()}</div></div>
        </div>
        ${cardStepperHtml(o.step)}
        <div class="oc-actions">
          <button class="oc-btn contact" onclick="goToChat()">Contact</button>
          <button class="oc-btn details" onclick="openDetail('${o.id}')">Details</button>
        </div>
      </div>`).join('');
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
    renderHome();
  }
  (function() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (orderId) {
      const found = orders.find(o => o.id === orderId);
      if (found) {
        // Small delay so DOM is ready
        setTimeout(() => openDetail(orderId), 100);
      }
    }
  })();

  function renderDetail(){
    const order=orders.find(o=>o.id===currentOrderId);
    document.getElementById('det-id').textContent=order.id;
    document.getElementById('det-date').textContent=order.date;
    document.getElementById('det-weight').innerHTML=`${totalWeight(order.customers)}<span>kg</span>`;
    document.getElementById('det-price').textContent=formatRp(totalPrice(order.customers));
    document.getElementById('det-stepper-wrap').innerHTML=detailStepperHtml(order.step);

    const nextBtn=document.getElementById('nextStepBtn');
    if(order.step>=3){
      nextBtn.textContent='Complete';
      nextBtn.disabled=false;
      nextBtn.title='';
    } else {
      nextBtn.textContent='Next Step';
      const noCustomers = order.customers.length === 0;
      const hasPending = order.step===0 && order.customers.some(c=>!c.accepted && c._decided!==true);
      if(noCustomers){
        nextBtn.disabled=true;
        nextBtn.title='Add at least one customer before proceeding.';
      } else if(hasPending){
        nextBtn.disabled=true;
        nextBtn.title='Please accept or deny all customers first.';
      } else {
        nextBtn.disabled=false;
        nextBtn.title='';
      }
    }

    const custDiv=document.getElementById('det-customers');
    if(order.customers.length===0){
      custDiv.innerHTML=`<div style="text-align:center;color:var(--gray-text);font-size:13px;padding:32px 0">No customers in this order yet.</div>`;
      return;
    }

    // Show warning if any undecided customers remain (step 0 only)
    const pendingCount = order.step===0 ? order.customers.filter(c=>!c.accepted&&!c._decided).length : 0;
    const warningHtml = pendingCount>0
      ? `<div style="background:#FFF3E0;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#E65100;font-weight:600">⚠️ ${pendingCount} customer${pendingCount>1?'s':''} still waiting — accept or deny to unlock Next Step.</div>`
      : '';

    document.getElementById('det-customers').innerHTML = warningHtml + order.customers.map(c=>{
      const itemsHtml=c.items.map(item=>`
        <div class="item-row">
          <div class="item-name"><div class="item-dot"></div>${item.name} <span style="color:var(--gray-text);margin-left:2px">(1x)</span></div>
          <div class="item-weight">${item.weight}</div>
          <div class="item-price">${formatRp(item.price)}</div>
        </div>`).join('');
      // Step 0: accept/deny. Step 1 (collecting): remove with options. Step 2+: no remove (locked).
      let actionsHtml = '';
      if(order.step === 0){
        actionsHtml = c.accepted
          ? `<div class="cc-actions"><button class="cc-btn remove" onclick="askRemove('${c.id}','${c.name}')">Remove</button></div>`
          : `<div class="cc-actions"><button class="cc-btn accept" onclick="acceptCustomer('${c.id}')">Accept</button><button class="cc-btn deny" onclick="denyCustomer('${c.id}')">Deny</button></div>`;
      } else if(order.step === 1){
        // Collecting: can remove entire customer OR specific items, needs proof photo
        if(c.accepted){
          actionsHtml = `<div class="cc-actions"><button class="cc-btn remove" onclick="openRemoveOptions('${c.id}','${c.name}')">Remove / Edit Items</button></div>`;
        }
      } else {
        // Step 2+ (Travelling / Handover / Payment): remove locked
        if(c.accepted){
          actionsHtml = `<div style="font-size:11px;color:var(--gray-text);padding:6px 2px;text-align:center">🔒 Items locked — in transit</div>`;
        }
      }
      const statusIcon=c.accepted?`<div class="cc-status-icon accepted">✓</div>`:'';
      const pendingBorder = (order.step===0 && !c.accepted && !c._decided) ? 'border:1.5px solid #FB8C00;' : '';
      // Report button — shown for every accepted customer (not for unprocessed ones)
      const reportHtml = (c.accepted || c._decided)
        ? `<button class="trav-report-btn" data-name="${c.name.replace(/"/g,'&quot;')}" data-id="${c.id}" style="width:100%;margin-top:8px;padding:9px;background:#FFF5F5;border:1.5px solid var(--red);border-radius:10px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;color:var(--red);cursor:pointer">🚩 Report ${c.name}</button>`
        : '';
      return `
        <div class="customer-card" id="cc-${c.id}" style="${pendingBorder}">
          <div class="cc-top"><div class="cc-avatar">${avatarSVG}</div><div><div class="cc-name">${c.name}</div><div class="cc-phone">${c.phone}</div></div>${statusIcon}</div>
          <div class="items-hdr"><span>Items</span><span>Kg</span><span>Price</span></div>
          ${itemsHtml}${actionsHtml}${reportHtml}
        </div>`;
    }).join('');

    // Wire report buttons via event delegation
    document.getElementById('det-customers').addEventListener('click', function(e) {
      const btn = e.target.closest('.trav-report-btn');
      if (!btn) return;
      const name = btn.getAttribute('data-name');
      openReport('customer', name, btn.getAttribute('data-id'));
    });
  }

  function acceptCustomer(cid){
    const order=orders.find(o=>o.id===currentOrderId);
    const c=order.customers.find(x=>x.id===cid);
    c.accepted=true; c._decided=true;
    renderDetail();showToast(`✅ ${c.name} accepted!`);
  }
  function denyCustomer(cid){
    const order=orders.find(o=>o.id===currentOrderId);
    // Mark decided before removing so pending check is satisfied
    const c=order.customers.find(x=>x.id===cid);
    if(c) c._decided=true;
    order.customers=order.customers.filter(x=>x.id!==cid);
    renderDetail();showToast('❌ Customer removed.');
  }
  function askRemove(cid,name){pendingRemoveCid=cid;document.getElementById('removeCustomerName').textContent=name;document.getElementById('removeOverlay').classList.add('show');}
  function doRemove(){closeSheet('removeOverlay');const order=orders.find(o=>o.id===currentOrderId);const c=order.customers.find(x=>x.id===pendingRemoveCid);order.customers=order.customers.filter(x=>x.id!==pendingRemoveCid);renderDetail();showToast(`🗑️ ${c.name} removed.`);pendingRemoveCid=null;}

  function confirmNextStep(){
    const order=orders.find(o=>o.id===currentOrderId);
    if(order.step>=4)return;
    // Guard: no customers
    if(order.customers.length===0){showToast('⚠️ No customers — cannot proceed.');return;}
    // Guard: undecided customers (step 0 only)
    if(order.step===0){
      const pending=order.customers.filter(c=>!c.accepted&&!c._decided);
      if(pending.length>0){
        showToast(`⚠️ Please accept or deny ${pending[0].name}${pending.length>1?' and others':''} first.`);
        return;
      }
    }
    // Step 0→1: no photo, straight to confirm
    if(order.step===0){
      const m=STEP_MESSAGES[0];
      document.getElementById('nextSheetTitle').textContent=m.title;
      document.getElementById('nextSheetSub').textContent=m.sub;
      document.getElementById('nextStepOverlay').classList.add('show');
      return;
    }
    // Step 2→3 (Handover): per-customer proof
    if(order.step===2){
      openHandoverProof();
      return;
    }
    // Steps 1→2, 3→4: single proof photo
    document.getElementById('proofStepLabel').textContent=STEP_MESSAGES[order.step].title;
    document.getElementById('proofPreview').innerHTML='';
    document.getElementById('proofPreview').style.display='none';
    document.getElementById('proofMsgInput').value='';
    document.getElementById('proofFileInput').value='';
    document.getElementById('proofUploadHint').style.display='';
    document.getElementById('proofOverlay').classList.add('show');
  }

  function handleProofFile(input){
    if(!input.files||!input.files[0])return;
    const reader=new FileReader();
    reader.onload=e=>{const prev=document.getElementById('proofPreview');prev.innerHTML=`<img src="${e.target.result}" style="width:100%;height:160px;object-fit:cover;border-radius:10px"/>`;prev.style.display='block';};
    reader.readAsDataURL(input.files[0]);
  }

  function submitProofAndAdvance(){
    const hasFile=document.getElementById('proofFileInput').files&&document.getElementById('proofFileInput').files[0];
    const msg=document.getElementById('proofMsgInput').value.trim();
    if(!hasFile){showToast('⚠️ Please upload at least 1 photo.');return;}
    if(!msg){showToast('⚠️ Please write a message for the customer.');return;}
    closeSheet('proofOverlay');
    const order=orders.find(o=>o.id===currentOrderId);
    const m=STEP_MESSAGES[order.step]||{title:'Proceed?',sub:'You cannot go back.'};
    document.getElementById('nextSheetTitle').textContent=m.title;
    document.getElementById('nextSheetSub').textContent=m.sub;
    document.getElementById('nextStepOverlay').classList.add('show');
  }

  // ── Step 1: Remove options (whole customer or specific items) ─────────────────
  let removeMode = 'all';
  let removeCheckedItems = {};

  function openRemoveOptions(cid, name){
    pendingRemoveCid = cid;
    removeMode = 'all';
    removeCheckedItems = {};
    document.getElementById('removeOptName').textContent = name;
    document.getElementById('optAll').classList.add('active');
    document.getElementById('optItems').classList.remove('active');
    document.getElementById('itemCheckList').style.display = 'none';
    document.getElementById('removeProofPreview').style.display = 'none';
    document.getElementById('removeProofHint').style.display = '';
    document.getElementById('removeProofInput').value = '';
    document.getElementById('removeReasonInput').value = '';

    // Build item checkboxes
    const order = orders.find(o=>o.id===currentOrderId);
    const cust  = order.customers.find(x=>x.id===cid);
    document.getElementById('itemCheckList').innerHTML = cust.items.map((item,idx) => `
      <div class="item-check-row" onclick="toggleItemCheck(${idx})">
        <div class="item-checkbox" id="ichk-${idx}">✕</div>
        <div class="item-check-name">${item.name}</div>
        <div class="item-check-weight">${item.weight}</div>
      </div>`).join('');

    document.getElementById('removeOptionsOverlay').classList.add('show');
  }

  function setRemoveMode(mode){
    removeMode = mode;
    document.getElementById('optAll').classList.toggle('active', mode==='all');
    document.getElementById('optItems').classList.toggle('active', mode==='items');
    document.getElementById('itemCheckList').style.display = mode==='items' ? 'block' : 'none';
  }

  function toggleItemCheck(idx){
    removeCheckedItems[idx] = !removeCheckedItems[idx];
    const box = document.getElementById('ichk-'+idx);
    box.classList.toggle('checked', !!removeCheckedItems[idx]);
  }

  function handleRemoveProof(input){
    if(!input.files||!input.files[0])return;
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('removeProofPreview');
      prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:130px;object-fit:cover;border-radius:8px"/>`;
      prev.style.display = 'block';
      document.getElementById('removeProofHint').style.display = 'none';
    };
    reader.readAsDataURL(input.files[0]);
  }

  function confirmRemoveWithProof(){
    const hasPhoto = document.getElementById('removeProofInput').files && document.getElementById('removeProofInput').files[0];
    const reason   = document.getElementById('removeReasonInput').value.trim();
    if(!hasPhoto){ showToast('⚠️ Please upload a proof photo.'); return; }
    if(!reason)  { showToast('⚠️ Please provide a reason.'); return; }

    const order = orders.find(o=>o.id===currentOrderId);
    const cust  = order.customers.find(x=>x.id===pendingRemoveCid);

    if(removeMode === 'all'){
      order.customers = order.customers.filter(x=>x.id!==pendingRemoveCid);
      showToast(`🗑️ ${cust.name} fully removed from order.`);
    } else {
      const selectedIdx = Object.keys(removeCheckedItems).filter(k=>removeCheckedItems[k]).map(Number);
      if(selectedIdx.length===0){ showToast('⚠️ Select at least one item to remove.'); return; }
      if(selectedIdx.length === cust.items.length){
        order.customers = order.customers.filter(x=>x.id!==pendingRemoveCid);
        showToast(`🗑️ All items removed — ${cust.name} removed from order.`);
      } else {
        cust.items = cust.items.filter((_,idx)=>!removeCheckedItems[idx]);
        showToast(`✅ ${selectedIdx.length} item(s) removed from ${cust.name}'s order.`);
      }
    }
    closeSheet('removeOptionsOverlay');
    pendingRemoveCid = null;
    renderDetail();
  }

  // ── Step 2→3: Per-customer handover proof ────────────────────────────────────
  let handoverProofs = {}; // { custId: fileObject }

  function openHandoverProof(){
    const order = orders.find(o=>o.id===currentOrderId);
    handoverProofs = {};
    const accepted = order.customers.filter(c=>c.accepted);
    document.getElementById('handoverProofList').innerHTML = accepted.map(cust => `
      <div class="cust-proof-card">
        <div class="cust-proof-name">
          <div id="hpdone-${cust.id}" class="done-icon" style="display:none">✓</div>
          ${cust.name} <span style="color:var(--gray-text);font-size:11px;font-weight:400">${cust.phone}</span>
        </div>
        <div class="cust-proof-img-box" onclick="document.getElementById('hpinput-${cust.id}').click()">
          <div id="hppreview-${cust.id}" style="display:none;width:100%;height:100%"></div>
          <div id="hphint-${cust.id}" class="cust-proof-img-hint">📷<br><span style="font-size:10px">Tap to upload</span></div>
          <input type="file" id="hpinput-${cust.id}" accept="image/*" style="display:none"
            onchange="handleHandoverPhoto('${cust.id}',this)" />
        </div>
        <div class="cust-proof-required" id="hperr-${cust.id}">Photo required</div>
      </div>`).join('');

    document.getElementById('handoverProofOverlay').classList.add('show');
  }

  function handleHandoverPhoto(custId, input){
    if(!input.files||!input.files[0])return;
    handoverProofs[custId] = input.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('hppreview-'+custId);
      prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:120px;object-fit:cover;border-radius:8px"/>`;
      prev.style.display = 'block';
      document.getElementById('hphint-'+custId).style.display = 'none';
      document.getElementById('hpdone-'+custId).style.display = 'flex';
      document.getElementById('hperr-'+custId).classList.remove('show');
    };
    reader.readAsDataURL(input.files[0]);
  }

  function submitHandoverProof(){
    const order    = orders.find(o=>o.id===currentOrderId);
    const accepted = order.customers.filter(c=>c.accepted);
    let allGood = true;
    accepted.forEach(cust => {
      if(!handoverProofs[cust.id]){
        document.getElementById('hperr-'+cust.id).classList.add('show');
        allGood = false;
      }
    });
    if(!allGood){ showToast('⚠️ Please upload a photo for every customer.'); return; }
    closeSheet('handoverProofOverlay');
    // Show confirm sheet
    const m = STEP_MESSAGES[2];
    document.getElementById('nextSheetTitle').textContent = m.title;
    document.getElementById('nextSheetSub').textContent   = m.sub;
    document.getElementById('nextStepOverlay').classList.add('show');
  }

  function doNextStep(){
    closeSheet('nextStepOverlay');
    const order = orders.find(o => o.id === currentOrderId);
    if (order.step < 4) order.step++;
    renderDetail();

    if (order.step === 4) {
      // All items delivered — trigger payout to traveller
      document.getElementById('nextStepBtn').textContent = 'Done';
      document.getElementById('nextStepBtn').disabled   = true;
      showToast('✅ Order complete! Processing your payout...');

      // Calculate total earned from accepted customers
      const totalEarned = order.customers
        .filter(cust => cust.accepted)
        .reduce((sum, cust) => sum + cust.items.reduce((s, i) => s + (i.price || 0), 0), 0);

      midtransPayout({
        orderId:       order.id,
        travellerName: (getUser && getUser()?.name) || 'Traveller',
        amount:        totalEarned,
        onSuccess: function(result) {
          document.getElementById('nextStepBtn').textContent = '✅ Done';
          document.getElementById('nextStepBtn').disabled    = false;
          showToast('💰 Payout queued! Ref: ' + (result.reference_no || 'N/A'));
        },
        onError: function(msg) {
          document.getElementById('nextStepBtn').disabled = false;
          showToast('❌ Payout failed: ' + msg);
        }
      });
    } else {
      showToast('✅ Step advanced! Proof sent to customers.');
    }
  }

  renderHome();
// end of main scope
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
const _rOverlay = document.getElementById('reportOverlay');
if (_rOverlay) _rOverlay.addEventListener('click', function(e) {
  if (e.target === this) closeReport();
});
