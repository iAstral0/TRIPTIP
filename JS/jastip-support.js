const API = 'http://localhost:8000/api';

function getToken() { return localStorage.getItem('jastip_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('jastip_user') || 'null'); }

function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function showScreen(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── DUMMY DATA — matches tickets in jastip-admin.js ─────────────────────────
// Replace with: GET /api/my-reports (returns reports where reporter_id = auth user)
const myReports = [
  {
    id: 2,
    status: 'pending',
    reason: '📦 Item not delivered',
    reason_id: 'not_delivered',
    description: 'I paid for my order 2 weeks ago and the traveller has not delivered any items or responded to messages.',
    reported_name: 'Siti Nurhaliza',
    context_type: 'order',
    context_id: '#00009',
    created_at: '2026-05-21 09:15',
    unread: 0,
    messages: [],
  },
  {
    id: 1,
    status: 'reviewing',
    reason: '💬 Abusive language',
    reason_id: 'abusive',
    description: 'The traveller was very rude and used inappropriate language during our conversation.',
    reported_name: 'Arif Rahman',
    context_type: 'chat',
    context_id: '#00012',
    created_at: '2026-05-21 10:32',
    unread: 1,
    messages: [
      { from: 'admin', text: 'Hello Hans, we have received your report and are now reviewing it. We will get back to you shortly.', time: '2026-05-21 16:00' },
    ],
  },
];

let currentReportId = null;

const REASON_MAP = {
  not_delivered:'📦 Item not delivered', wrong_item:'❌ Wrong item sent',
  abusive:'💬 Abusive language', unresponsive:'🚫 Unresponsive',
  false_claim:'❌ False receipt claim', fraud:'⚠️ Suspected fraud',
  harassment:'⚠️ Harassment', overcharged:'💸 Overcharged',
  no_payment:'💸 Did not pay', not_distributed:'📦 Item not distributed',
  unfair_close:'❌ Closed group unfairly', other:'✏️ Other',
};

// ── RENDER REPORT LIST ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderReportList();
});

function renderReportList() {
  const container = document.getElementById('reportList');
  if (!myReports.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No reports yet</div>
        <div class="empty-sub">Reports you submit will appear here.<br/>You can track their status and chat with our support team.</div>
      </div>`;
    return;
  }

  container.innerHTML = myReports.map(r => {
    const hasChat    = r.status === 'reviewing' || r.status === 'resolved';
    const lastMsg    = r.messages.length ? r.messages[r.messages.length - 1] : null;
    const preview    = hasChat && lastMsg ? lastMsg.text : r.description;
    const unreadBadge = r.unread > 0
      ? `<span class="rc-unread">${r.unread}</span>`
      : `<span style="font-size:16px;color:var(--gray-text)">›</span>`;

    return `
      <div class="report-card" onclick="openReport(${r.id})">
        <div class="rc-hdr">
          <span class="rc-badge ${r.status}">${r.status}</span>
          <span class="rc-id">#RPT-${String(r.id).padStart(4,'0')}</span>
        </div>
        <div class="rc-reason">${REASON_MAP[r.reason_id] || r.reason}</div>
        <div class="rc-preview">${preview}</div>
        <div class="rc-footer">
          <span>${r.created_at}</span>
          ${unreadBadge}
        </div>
      </div>`;
  }).join('');
}

// ── OPEN REPORT CHAT ─────────────────────────────────────────────────────────
function openReport(id) {
  const r = myReports.find(x => x.id === id);
  if (!r) return;
  currentReportId = id;

  // Clear unread
  r.unread = 0;
  renderReportList();

  // Render ticket banner
  document.getElementById('ticketBanner').innerHTML = `
    <div class="tb-reason">${REASON_MAP[r.reason_id] || r.reason}</div>
    <div class="tb-row">
      <span class="tb-tag reported">Reported: ${r.reported_name}</span>
      ${r.context_id ? `<span class="tb-tag context">${r.context_type}: ${r.context_id}</span>` : ''}
      <span class="tb-tag status ${r.status}">${r.status}</span>
    </div>`;

  // Show/hide input bar
  const inputBar  = document.getElementById('chatInputBar');
  const closedBar = document.getElementById('chatClosedBar');
  if (r.status === 'resolved') {
    inputBar.style.display  = 'none';
    closedBar.style.display = 'block';
  } else if (r.status === 'reviewing') {
    inputBar.style.display  = 'flex';
    closedBar.style.display = 'none';
  } else {
    // Pending — no chat yet
    inputBar.style.display  = 'none';
    closedBar.style.display = 'none';
  }

  renderMessages(r);
  showScreen('screenChat');
}

// ── RENDER MESSAGES ──────────────────────────────────────────────────────────
function getFileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  const icons = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', txt:'📃', png:'🖼️', jpg:'🖼️', jpeg:'🖼️' };
  return icons[ext] || '📎';
}

function renderMessages(r) {
  const container = document.getElementById('chatMessages');

  if (r.status === 'pending') {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:40px;margin-bottom:12px">⏳</div>
        <div style="font-size:14px;font-weight:700;color:var(--dark);margin-bottom:6px">Waiting for review</div>
        <div style="font-size:13px;color:var(--gray-text);line-height:1.6">Our team has received your report and will review it shortly. You will be able to chat once a team member accepts your report.</div>
      </div>`;
    return;
  }

  if (!r.messages.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--gray-text);font-size:13px;padding:40px 0">No messages yet.</div>`;
    return;
  }

  container.innerHTML = r.messages.map(m => {
    const isMe   = m.from === 'user';
    const isAdmin = m.from === 'admin';
    const isSys  = m.from === 'system';
    const type   = m.type || 'text';

    if (isSys) return `
      <div class="msg-row" style="align-items:center">
        <div class="msg-bubble system">${m.text}</div>
      </div>`;

    let bubble = '';
    if (type === 'text') {
      bubble = `<div class="msg-bubble ${isMe ? 'me' : 'them'}">${m.text}</div>`;
    } else if (type === 'image') {
      bubble = `<div class="msg-bubble ${isMe ? 'me' : 'them'}" style="padding:6px">
        <img src="${m.fileData}" alt="${m.fileName}"
          style="max-width:200px;border-radius:8px;display:block;cursor:pointer"
          onclick="window.open('${m.fileData}','_blank')"/>
        <div style="font-size:10px;margin-top:4px;opacity:0.8">${m.fileName}</div>
      </div>`;
    } else {
      const icon = getFileIcon(m.fileName);
      bubble = `<div class="msg-bubble ${isMe ? 'me' : 'them'} file-bubble">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:28px;flex-shrink:0">${icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.fileName}</div>
            <div style="font-size:11px;opacity:0.75">${m.fileSize || ''}</div>
          </div>
        </div>
        <button class="${isMe ? 'file-dl-btn' : 'file-dl-btn them-dl'}"
          onclick="if(this.dataset.url)window.open(this.dataset.url,'_blank')" data-url="${m.fileData||''}">
          ⬇ Download
        </button>
      </div>`;
    }

    return `
      <div class="msg-row ${isMe ? 'me' : 'them'}">
        ${!isMe ? '<div class="msg-sender">🛡️ JasTip Support</div>' : ''}
        ${bubble}
        <div class="msg-time">${m.time || ''}</div>
      </div>`;
  }).join('');

  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// ── SEND USER REPLY ──────────────────────────────────────────────────────────
function sendUserMsg() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text || !currentReportId) return;

  const r = myReports.find(x => x.id === currentReportId);
  if (!r || r.status !== 'reviewing') return;

  r.messages.push({
    from: 'user', type: 'text', text,
    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})
  });
  input.value = '';
  renderMessages(r);

  /*
   * BACKEND: POST /api/my-reports/{id}/messages
   * Body: { type: 'text', message: text }
   */
}

// ── SEND USER FILE ───────────────────────────────────────────────────────────
function sendUserFile(input) {
  if (!input.files || !input.files[0] || !currentReportId) return;
  const file = input.files[0];
  const r = myReports.find(x => x.id === currentReportId);
  if (!r || r.status !== 'reviewing') return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('❌ File too large. Max 10MB.');
    input.value = '';
    return;
  }

  const isImage = file.type.startsWith('image/');
  const reader  = new FileReader();

  reader.onload = function(e) {
    r.messages.push({
      from:     'user',
      type:     isImage ? 'image' : 'file',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileData: e.target.result,
      time:     new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})
    });
    input.value = '';
    renderMessages(r);
    showToast('📎 ' + file.name + ' sent.');
  };

  reader.onerror = () => { showToast('❌ Failed to read file.'); input.value = ''; };
  reader.readAsDataURL(file);

  /*
   * BACKEND: POST /api/my-reports/{id}/messages (multipart/form-data)
   * Fields: type = 'image' | 'file', file = <binary>
   */
}

function formatFileSize(bytes) {
  if (bytes < 1024)             return bytes + ' B';
  if (bytes < 1024 * 1024)      return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
