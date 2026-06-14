const API = 'http://localhost:8000/api';

/* jastip-traveller-chat.js — logic for jastip-traveller-chat */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
// Traveller's conversations — with their customers
const chats = [
  {
    id: 'c1', name: 'Michael', emoji: '👤', online: true,
    orderId: '#00004', city: 'Singapore', unread: 2,
    messages: [
      { from:'system', text:'Order #00004 created — Payment secured via Escrow' },
      { from:'them', text:'Hi! Just confirmed my order. Can you get the Parfum from Ion Orchard?', time:'09.15' },
      { from:'me',   text:'Hello Michael! Yes I will be heading there tomorrow. Any specific brand?', time:'09.20' },
      { from:'them', text:'Chanel No. 5, 50ml please! Thank you so much 🙏', time:'09.22' },
      { from:'me',   text:'Got it! I will keep you updated with photos once I find it ✅', time:'09.25' },
      { from:'them', text:'Amazing, I trust you! Looking forward to it 😊', time:'09.30' },
    ]
  },
  {
    id: 'c2', name: 'Sarah', emoji: '👤', online: false,
    orderId: '#00004', city: 'Singapore', unread: 0,
    messages: [
      { from:'system', text:'Order #00004 — Sarah accepted' },
      { from:'them', text:'Hi! My order is the Baju and Sepatu. Size M for the shirt and size 38 for shoes.', time:'10.05' },
      { from:'me',   text:'Got it Sarah! I will look for both at the mall today 👟', time:'10.10' },
      { from:'them', text:'Thank you! Please make sure the shoes are the white Nike Air Force 1', time:'10.12' },
      { from:'me',   text:'Noted! Will send a photo once I find them 📸', time:'10.14' },
    ]
  },
  {
    id: 'c3', name: 'Budi', emoji: '👤', online: true,
    orderId: '#00004', city: 'Singapore', unread: 1,
    messages: [
      { from:'system', text:'Order #00004 — Budi accepted' },
      { from:'them', text:'Hello traveller! I ordered 3 items. Are you already in Singapore?', time:'11.00' },
      { from:'me',   text:'Yes I arrived yesterday! Currently collecting your items today 🇸🇬', time:'11.05' },
      { from:'them', text:'Great! Can you also check the price of the limited edition bag at Orchard?', time:'11.08' },
    ]
  },
  {
    id: 'c4', name: 'Hanako (KL Order)', emoji: '👤', online: false,
    orderId: '#00003', city: 'Kuala Lumpur', unread: 0,
    messages: [
      { from:'system', text:'Order #00003 created — awaiting customers' },
      { from:'them', text:'Hi! I saw your trip listing for KL. What items do you accept?', time:'08.00' },
      { from:'me',   text:'Hello! I accept fashion, cosmetics, snacks, and small electronics. No liquids over 100ml 😊', time:'08.05' },
      { from:'them', text:'Perfect! I will place an order soon.', time:'08.07' },
    ]
  },
];

let activeChatId = null;

function searchChats(q) {
    q = q.toLowerCase().trim();
    const filtered = !q ? chats : chats.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.orderId.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.messages.filter(m=>m.from!=='system').slice(-1)[0]?.text?.toLowerCase().includes(q)
    );
    const el = document.getElementById('chatList');
    if (!filtered.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--gray-text);font-size:13px;padding:40px 20px">No conversations found.</div>';
      return;
    }
    el.innerHTML = filtered.map(c => {
      const last = c.messages.filter(m=>m.from!=='system').slice(-1)[0];
      return `<div class="chat-item" onclick="openChat('${c.id}')">
        <div class="chat-avatar">
          ${c.emoji}
          ${c.online ? '<div class="online-dot"></div>' : ''}
        </div>
        <div class="chat-info">
          <div class="chat-name">${c.name}</div>
          <div class="chat-preview">${last ? (last.from==='me'?'You: ':'')+last.text : 'No messages yet'}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${last ? last.time||'' : ''}</div>
          ${c.unread > 0 ? `<div class="chat-badge">${c.unread}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

function renderChatList() {
  const el = document.getElementById('chatList');
  el.innerHTML = chats.map(c => {
    const last = c.messages.filter(m => m.from !== 'system').slice(-1)[0];
    return `<div class="chat-item" onclick="openChat('${c.id}')">
      <div class="chat-avatar">
        ${c.emoji}
        ${c.online ? '<div class="online-dot"></div>' : ''}
      </div>
      <div class="chat-info">
        <div class="chat-name">${c.name}</div>
        <div class="chat-preview">${last ? (last.from==='me'?'You: ':'')+last.text : 'No messages'}</div>
        <span class="order-tag">${c.orderId} · ${c.city}</span>
      </div>
      <div class="chat-meta">
        <div class="chat-time">${last ? last.time||'' : ''}</div>
        ${c.unread > 0 ? `<div class="chat-badge">${c.unread}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function openChat(id) {
  activeChatId = id;
  const chat = chats.find(c => c.id === id);
  chat.unread = 0;
  _currentChat = chat; // store for info panel
  renderChatList();

  document.getElementById('msgAvatar').textContent = chat.emoji;
  document.getElementById('msgName').textContent = chat.name;
  const statusEl = document.getElementById('msgStatus');
  statusEl.textContent = chat.online ? '● Online' : '● Last seen recently';
  statusEl.className = 'msg-status ' + (chat.online ? 'online' : 'offline');
  document.getElementById('msgOrderTag').textContent = chat.orderId;

  renderMessages(chat);
  document.getElementById('msgScreen').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const body = document.getElementById('msgBody');
    body.scrollTop = body.scrollHeight;
  }, 100);
}

function closeChat() {
  document.getElementById('msgScreen').classList.remove('open');
  document.body.style.overflow = '';
  activeChatId = null;
}

function renderMessages(chat) {
  const el = document.getElementById('msgBody');
  el.innerHTML = chat.messages.map(m => {
    if (m.from === 'system') return `<div class="msg-system">${m.text}</div>`;
    return `<div class="msg-group ${m.from}">
      ${m.from === 'them' ? `<div class="msg-sender">${chat.name}</div>` : ''}
      <div class="msg-bubble ${m.from}">${m.text}</div>
      <div class="msg-time">${m.time || ''}</div>
    </div>`;
  }).join('');
}

function sendMsg() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !activeChatId) return;
  const chat = chats.find(c => c.id === activeChatId);
  const now = new Date();
  const time = String(now.getHours()).padStart(2,'0') + '.' + String(now.getMinutes()).padStart(2,'0');
  chat.messages.push({ from:'me', text, time });
  input.value = '';
  renderMessages(chat);
  renderChatList();
  setTimeout(() => { document.getElementById('msgBody').scrollTop = document.getElementById('msgBody').scrollHeight; }, 50);

  // Auto-reply after 1.5s
  setTimeout(() => {
    const replies = ['Got it! 👍','Sure, no problem!','I will check on that 😊','Thank you for the update!','On it, will let you know soon.'];
    chat.messages.push({ from:'them', text: replies[Math.floor(Math.random()*replies.length)], time });
    renderMessages(chat);
    renderChatList();
    setTimeout(() => { document.getElementById('msgBody').scrollTop = document.getElementById('msgBody').scrollHeight; }, 50);
  }, 1500);
}

renderChatList();

// ── INFO PANEL ────────────────────────────────────────────────────────────────
var _currentChat = null;

function openChatInfo() {
  var ch = _currentChat;
  if (!ch) { showToast('Open a chat first.'); return; }
  document.getElementById('infoAvatar').textContent  = ch.emoji  || '👤';
  document.getElementById('infoName').textContent    = ch.name   || '-';
  document.getElementById('infoRole').textContent    = ch.role   || 'Customer';
  document.getElementById('infoPhone').textContent   = ch.phone  || 'Phone not available';
  document.getElementById('infoOrderCard').innerHTML =
    '<div style="font-size:12px;color:#9e9e9e;margin-bottom:6px">Order ID</div>'
    + '<div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:10px">' + (ch.orderId || '-') + '</div>'
    + '<div style="font-size:12px;color:#9e9e9e;margin-bottom:6px">Destination</div>'
    + '<div style="font-size:14px;font-weight:600;color:#1a1a1a;margin-bottom:10px">' + (ch.destination || ch.city || 'International') + '</div>'
    + '<div style="display:inline-block;background:#E8F5E9;color:#2E7D32;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600">' + (ch.status || ch.orderStatus || 'Ongoing') + '</div>';
  const infoPanel = document.getElementById('chatInfoPanel');
  infoPanel.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Retrigger slide animation
  const infoSheet = infoPanel.querySelector('.chat-sheet-anim');
  if (infoSheet) { infoSheet.style.animation='none'; void infoSheet.offsetWidth; infoSheet.style.animation=''; }
}

function closeChatInfo() {
  document.getElementById('chatInfoPanel').style.display = 'none';
  document.body.style.overflow = '';
}

document.getElementById('chatInfoPanel').addEventListener('click', function(e) {
  if (e.target === this) closeChatInfo();
});

// ── REPORT ────────────────────────────────────────────────────────────────────
var _chatRReasons = [
  {id:'abusive',      icon:'💬', label:'Abusive language',      desc:'Customer was rude or threatening'},
  {id:'unresponsive', icon:'🚫', label:'Unresponsive',          desc:'Customer stopped responding'},
  {id:'false_claim',  icon:'❌', label:'False receipt claim',   desc:'Customer falsely claimed item not received'},
  {id:'harassment',   icon:'⚠️', label:'Harassment',            desc:'Customer is harassing me'},
  {id:'other',        icon:'✏️', label:'Other',                 desc:'Describe the issue below'},
];
var _chatRSelected = null;

function openChatReport() {
  closeChatInfo();
  _chatRSelected = null;
  var ch = _currentChat;
  document.getElementById('chatRTarget').textContent = 'Reporting: ' + (ch ? ch.name : '');
  document.getElementById('chatRError').style.display  = 'none';
  document.getElementById('chatROtherWrap').style.display = 'none';
  document.getElementById('chatRChoices').innerHTML = _chatRReasons.map(function(r) {
    return '<div id="crc-' + r.id + '" onclick="chatRSelect(\'' + r.id + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #e8e8e8;border-radius:12px;cursor:pointer;background:#fff">'
      + '<span style="font-size:20px">' + r.icon + '</span>'
      + '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#1a1a1a">' + r.label + '</div>'
      + '<div style="font-size:11px;color:#9e9e9e;margin-top:1px">' + r.desc + '</div></div>'
      + '<div id="crc-chk-' + r.id + '" style="width:20px;height:20px;border-radius:50%;border:2px solid #e0e0e0;flex-shrink:0"></div>'
      + '</div>';
  }).join('');
  const reportModal = document.getElementById('chatReportModal');
  reportModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Retrigger slide animation
  const reportSheet = reportModal.querySelector('.chat-sheet-anim');
  if (reportSheet) { reportSheet.style.animation='none'; void reportSheet.offsetWidth; reportSheet.style.animation=''; }
}

function chatRSelect(id) {
  _chatRSelected = id;
  _chatRReasons.forEach(function(r) {
    var el  = document.getElementById('crc-' + r.id);
    var chk = document.getElementById('crc-chk-' + r.id);
    if (!el || !chk) return;
    var sel = r.id === id;
    el.style.borderColor  = sel ? '#e53935' : '#e8e8e8';
    el.style.background   = sel ? '#fff5f5' : '#fff';
    chk.style.background  = sel ? '#e53935' : '#fff';
    chk.style.borderColor = sel ? '#e53935' : '#e0e0e0';
  });
  document.getElementById('chatRError').style.display = 'none';
  document.getElementById('chatROtherWrap').style.display = id === 'other' ? 'block' : 'none';
}

function closeChatReport() {
  document.getElementById('chatReportModal').style.display = 'none';
  document.body.style.overflow = '';
}

function submitChatReport() {
  if (!_chatRSelected) {
    document.getElementById('chatRError').style.display = 'block';
    return;
  }
  if (_chatRSelected === 'other' && !document.getElementById('chatRDesc').value.trim()) {
    document.getElementById('chatRError').textContent = 'Please describe the issue.';
    document.getElementById('chatRError').style.display = 'block';
    return;
  }

  var description = _chatRSelected === 'other'
    ? document.getElementById('chatRDesc').value.trim()
    : '';

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — POST /api/reports
   * ════════════════════════════════════════════════════════════════
   * Table: reports
   * Columns:
   *   reporter_id     — from auth token
   *   reported_type   — 'traveller' (customer chat) | 'customer' (traveller chat)
   *   reported_name   — _currentChat.name
   *   reported_id     — _currentChat.userId (if available)
   *   reason          — _chatRSelected
   *   description     — free text if reason = 'other'
   *   context_type    — 'chat'
   *   context_id      — _currentChat.orderId
   *   status          — 'pending' (default)
   * ════════════════════════════════════════════════════════════════
   */
  var ch    = _currentChat;
  var token = localStorage.getItem('jastip_token');
  fetch(API + '/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      reported_type: ch ? ch.role.toLowerCase() : 'user',
      reported_id:   ch ? (ch.userId || null) : null,
      reported_name: ch ? ch.name : '',
      reason:        _chatRSelected,
      description:   description,
      context_type:  'chat',
      context_id:    ch ? (ch.orderId || null) : null
    })
  }).then(function() {
    closeChatReport();
    showToast('✅ Report submitted. Our team will review it shortly.');
  }).catch(function() {
    // Backend not yet implemented — show success anyway for demo
    closeChatReport();
    showToast('✅ Report submitted. Our team will review it shortly.');
  });
}

document.getElementById('chatReportModal').addEventListener('click', function(e) {
  if (e.target === this) closeChatReport();
});
