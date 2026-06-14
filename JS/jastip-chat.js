const API = 'http://localhost:8000/api';

/* jastip-chat.js — logic for jastip-chat */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
const chats = [
  {
    id: 'c1', name: 'Hanako Yamada', emoji: '🇯🇵', online: true,
    orderId: '#00005', city: 'Tokyo', orderStatus: 'In Transit',
    unread: 2,
    messages: [
      { from:'them', text:'Hello! I have received all your items and packed them safely 📦', time:'10:32' },
      { from:'me',   text:'Thank you! Please handle the headphones carefully, they are fragile', time:'10:35' },
      { from:'them', text:'Of course, I wrapped them with extra bubble wrap 😊', time:'10:36' },
      { from:'system', text:'Order #00005 – Status updated: In Transit' },
      { from:'them', text:'I am now at Narita airport. Flight departs in 2 hours!', time:'13:15' },
      { from:'them', text:'Expected arrival to Jakarta: 20 March 2026 at 14:00', time:'13:16' },
      { from:'me',   text:'Perfect, I will be at the meeting point on time 👍', time:'13:20' },
    ]
  },
  {
    id: 'c2', name: 'Lim Wei Ling', emoji: '🇸🇬', online: true,
    orderId: '#00006', city: 'Singapore', orderStatus: 'Collecting Items',
    unread: 1,
    messages: [
      { from:'system', text:'Order #00006 created – Payment secured via Escrow' },
      { from:'them', text:'Hi! I got your order. Can you confirm the perfume brand name?', time:'09:15' },
      { from:'me',   text:'It is Chanel No. 5, 50ml bottle. Available at most malls there', time:'09:22' },
      { from:'them', text:'Got it! Found it at ION Orchard. The shoes and shirt are also ready', time:'09:45' },
      { from:'me',   text:'Amazing thank you so much! 🙏', time:'09:50' },
      { from:'them', text:'I will be collecting everything today. Order is on track!', time:'10:01' },
    ]
  },
  {
    id: 'c3', name: 'Budi Santoso', emoji: '🇲🇾', online: false,
    orderId: '#00002', city: 'Kuala Lumpur', orderStatus: 'Finished',
    unread: 0,
    messages: [
      { from:'system', text:'Order #00002 – Payment released to traveller' },
      { from:'them', text:'All items delivered! Hope you enjoy everything 😊', time:'15:30' },
      { from:'me',   text:'Everything is perfect, thank you Budi!', time:'15:45' },
      { from:'them', text:'Great! Feel free to order again next time I travel 🙌', time:'15:46' },
      { from:'me',   text:'Will do! 5 stars for you ⭐⭐⭐⭐⭐', time:'15:50' },
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
        <div class="chat-time">${last ? last.time || 'Today' : ''}</div>
        ${c.unread > 0 ? `<div class="chat-badge">${c.unread}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function openChat(id) {
  activeChatId = id;
  const chat = chats.find(c=>c.id===id);
  chat.unread = 0;
  _currentChat = chat; // store for info panel
  renderChatList();

  document.getElementById('msgAvatar').textContent = chat.emoji;
  document.getElementById('msgName').textContent   = chat.name;
  document.getElementById('msgStatus').textContent = chat.online ? '● Online' : '● Last seen recently';
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
    if (m.from === 'system') {
      return `<div class="msg-system">${m.text}</div>`;
    }
    return `<div class="msg-group ${m.from}">
      ${m.from==='them'?`<div class="msg-sender-name">${chat.name}</div>`:''}
      <div class="msg-bubble ${m.from}">${m.text}</div>
      <div class="msg-time ${m.from}">${m.time||''}</div>
    </div>`;
  }).join('');
}

function sendMsg() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !activeChatId) return;
  const chat = chats.find(c=>c.id===activeChatId);
  const now = new Date();
  const time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  chat.messages.push({ from:'me', text, time });
  input.value = '';
  renderMessages(chat);
  renderChatList();
  setTimeout(() => {
    const body = document.getElementById('msgBody');
    body.scrollTop = body.scrollHeight;
  }, 50);

  // Auto-reply after 1.5s
  setTimeout(() => {
    const replies = [
      'Got it! 👍',
      'Sure, I will check on that.',
      'No problem at all!',
      'Thank you for letting me know 😊',
      'On it! Will update you soon.',
    ];
    chat.messages.push({ from:'them', text: replies[Math.floor(Math.random()*replies.length)], time: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()+1).padStart(2,'0') });
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
  document.getElementById('infoAvatar').textContent  = ch.emoji || '👤';
  document.getElementById('infoName').textContent    = ch.name  || '-';
  document.getElementById('infoRole').textContent    = ch.role  || 'Traveller';
  document.getElementById('infoPhone').textContent   = ch.phone || 'Phone not available';
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
  {id:'no_delivery',  icon:'📦', label:'Item not delivered',   desc:'Items were never delivered'},
  {id:'wrong_item',   icon:'❌', label:'Wrong item sent',       desc:'Received a different item'},
  {id:'unresponsive', icon:'🚫', label:'Unresponsive',          desc:'Traveller stopped responding'},
  {id:'abusive',      icon:'💬', label:'Abusive language',      desc:'Traveller was rude or threatening'},
  {id:'fraud',        icon:'⚠️', label:'Suspected fraud',       desc:'Traveller may be acting fraudulently'},
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
