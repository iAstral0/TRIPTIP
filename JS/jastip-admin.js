const API = 'http://localhost:8000/api';

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('jastip_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('jastip_user') || 'null'); }

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, dur = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

// ── Auth guard — admin only ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // DUMMY — set admin user display name
  // When backend ready: check getUser().role === 'admin', redirect if not
  const user = getUser();
  document.getElementById('adminUserName').textContent = user?.name || 'Admin';
  loadTickets();
});

function adminLogout() {
  // DUMMY — just redirect to login
  // When backend ready: call POST /api/logout first
  localStorage.removeItem('jastip_token');
  localStorage.removeItem('jastip_user');
  location.href = 'jastip-login.html';
}

// ══════════════════════════════════════════════════════════════════════════════
// TICKET LIST
// ══════════════════════════════════════════════════════════════════════════════

/* DUMMY DATA — replace with fetch(`${API}/admin/reports`) when backend ready */
let allTickets = [
  {
    id: 1, status: 'pending',
    reason: 'Abusive in chat',      reason_id: 'abusive',
    description: 'The traveller was very rude and used inappropriate language during our conversation.',
    context_type: 'chat', context_id: '#00012',
    reporter:  { name: 'Hans Wijaya',   role: 'Customer', emoji: '👤', phone: '+62 812 3456 7890' },
    reported:  { name: 'Arif Rahman',   role: 'Traveller', emoji: '👨', phone: '+62 812 9988 7766' },
    created_at: '2026-05-21 10:32', messages: []
  },
  {
    id: 2, status: 'pending',
    reason: 'Item not delivered',   reason_id: 'not_delivered',
    description: 'I paid for my order 2 weeks ago and the traveller has not delivered any items or responded to messages.',
    context_type: 'order', context_id: '#00009',
    reporter:  { name: 'Rina Susanti',  role: 'Customer', emoji: '👩', phone: '+62 877 5544 3322' },
    reported:  { name: 'Siti Nurhaliza',role: 'Traveller', emoji: '👩', phone: '+62 821 1122 3344' },
    created_at: '2026-05-21 09:15', messages: []
  },
  {
    id: 3, status: 'reviewing',
    reason: 'False receipt claim',  reason_id: 'false_claim',
    description: 'Customer confirmed received but then complained the item was missing. Claiming escrow should not be released.',
    context_type: 'group', context_id: 'gLB',
    reporter:  { name: 'Galih Saputra', role: 'Traveller/Owner', emoji: '👨', phone: '+62 813 6677 8899' },
    reported:  { name: 'Dira Kusuma',   role: 'Customer', emoji: '👩', phone: '+62 812 4455 6677' },
    created_at: '2026-05-20 15:45', messages: [
      { from: 'admin', text: 'We have received your report and are investigating.', time: '2026-05-20 16:00' },
      { from: 'user',  name: 'Galih Saputra', text: 'Thank you, please check the chat history.', time: '2026-05-20 16:05' },
    ]
  },
  {
    id: 4, status: 'resolved',
    reason: 'Unresponsive',         reason_id: 'unresponsive',
    description: 'Traveller has not responded for 5 days after payment was made.',
    context_type: 'order', context_id: '#00007',
    reporter:  { name: 'Budi Santoso',  role: 'Customer', emoji: '👤', phone: '+62 821 7788 9900' },
    reported:  { name: 'Doni Prakoso',  role: 'Traveller', emoji: '👤', phone: '+62 877 2233 4455' },
    created_at: '2026-05-19 08:00', messages: [
      { from: 'admin', text: 'We have contacted the traveller on your behalf.', time: '2026-05-19 09:00' },
      { from: 'admin', text: 'This case has been resolved. Refund has been initiated.', time: '2026-05-19 14:00' },
    ]
  },
  {
    id: 5, status: 'pending',
    reason: 'Suspected fraud',      reason_id: 'fraud',
    description: 'This traveller has collected payments from multiple customers but has not delivered any orders in the past month.',
    context_type: 'chat', context_id: null,
    reporter:  { name: 'Michael Tan',   role: 'Customer', emoji: '👤', phone: '+62 812 0011 2233' },
    reported:  { name: 'Unknown User',  role: 'Traveller', emoji: '⚠️', phone: 'Unknown' },
    created_at: '2026-05-22 07:30', messages: []
  },
];

let currentFilter = 'all';
let currentTicketId = null;

function loadTickets() {
  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — GET /api/admin/reports
   * ════════════════════════════════════════════════════════════════
   * Query params: ?status=pending|reviewing|resolved|all
   * Returns: array of report objects
   * Response fields:
   *   id, status, reason, reason_id, description
   *   context_type ('order'|'group'|'chat'), context_id
   *   reporter: { name, role, emoji, phone }
   *   reported: { name, role, emoji, phone }
   *   created_at, messages: []
   * ════════════════════════════════════════════════════════════════
   *
   * Replace dummy data above with:
   *
   * const res = await fetch(`${API}/admin/reports`, {
   *   headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' }
   * });
   * allTickets = await res.json();
   *
   */
  updateStats();
  renderTickets();
}

function updateStats() {
  document.getElementById('statPending')   .textContent = allTickets.filter(t => t.status === 'pending').length;
  document.getElementById('statReviewing') .textContent = allTickets.filter(t => t.status === 'reviewing').length;
  document.getElementById('statResolved')  .textContent = allTickets.filter(t => t.status === 'resolved').length;
  document.getElementById('statTotal')     .textContent = allTickets.length;
}

function filterTickets(status) {
  currentFilter = status;
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.status === status);
  });
  renderTickets();
}

const REASON_LABELS = {
  abusive:          '💬 Abusive language',
  unresponsive:     '🚫 Unresponsive',
  not_delivered:    '📦 Item not delivered',
  wrong_item:       '❌ Wrong item sent',
  false_claim:      '❌ False receipt claim',
  fraud:            '⚠️ Suspected fraud',
  overcharged:      '💸 Overcharged',
  harassment:       '⚠️ Harassment',
  no_payment:       '💸 Did not pay',
  not_distributed:  '📦 Item not distributed',
  unfair_close:     '❌ Closed group unfairly',
  cancel_abuse:     '❌ Repeated cancellations',
  other:            '✏️ Other',
};

const STATUS_NEXT = { pending: 'reviewing', reviewing: 'resolved' };

function renderTickets() {
  const list = document.getElementById('ticketList');
  const filtered = currentFilter === 'all'
    ? allTickets
    : allTickets.filter(t => t.status === currentFilter);

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">📭 No tickets in this category.</div>';
    return;
  }

  list.innerHTML = filtered.map(t => `
    <div class="ticket-card" onclick="openTicket(${t.id})">
      <div class="tc-hdr">
        <span class="tc-badge ${t.status}">${t.status}</span>
        <span class="tc-id">#RPT-${String(t.id).padStart(4,'0')}</span>
      </div>
      <div class="tc-reason">${REASON_LABELS[t.reason_id] || t.reason}</div>
      <div class="tc-desc">${t.description}</div>
      <div class="tc-footer">
        <div class="tc-who">
          <div class="tc-avatar">${t.reporter.emoji}</div>
          <span>${t.reporter.name} → ${t.reported.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span>${formatDate(t.created_at)}</span>
          <span class="tc-arrow">›</span>
        </div>
      </div>
    </div>`).join('');
}

function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short' });
}

// ══════════════════════════════════════════════════════════════════════════════
// TICKET DETAIL
// ══════════════════════════════════════════════════════════════════════════════

function openTicket(id) {
  currentTicketId = id;
  const t = allTickets.find(x => x.id === id);
  if (!t) return;

  const detail = document.getElementById('ticketDetail');
  detail.innerHTML = `
    <!-- Status + ID -->
    <div class="detail-section">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span class="tc-badge ${t.status}">${t.status}</span>
        <span style="font-size:13px;color:var(--gray-light);font-weight:600">#RPT-${String(t.id).padStart(4,'0')}</span>
      </div>
      <div style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:4px">${REASON_LABELS[t.reason_id] || t.reason}</div>
      <div style="font-size:13px;color:var(--gray);line-height:1.6">${t.description}</div>
    </div>

    <!-- Reporter -->
    <div class="detail-section">
      <div class="detail-section-title">Reported by</div>
      <div class="person-card">
        <div class="person-avatar">${t.reporter.emoji}</div>
        <div>
          <div class="person-name">${t.reporter.name}</div>
          <div class="person-role">${t.reporter.role}</div>
          <div style="font-size:12px;color:var(--gray);margin-top:2px">${t.reporter.phone}</div>
        </div>
      </div>
    </div>

    <!-- Reported -->
    <div class="detail-section">
      <div class="detail-section-title">Reported person</div>
      <div class="person-card">
        <div class="person-avatar">${t.reported.emoji}</div>
        <div>
          <div class="person-name">${t.reported.name}</div>
          <div class="person-role">${t.reported.role}</div>
          <div style="font-size:12px;color:var(--gray);margin-top:2px">${t.reported.phone}</div>
        </div>
      </div>
    </div>

    <!-- Context -->
    <div class="detail-section">
      <div class="detail-section-title">Report Context</div>
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-row-label">Source</span>
          <span class="detail-row-value" style="text-transform:capitalize">${t.context_type}</span>
        </div>
        <div class="detail-row">
          <span class="detail-row-label">Reference ID</span>
          <span class="detail-row-value">${t.context_id || '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-row-label">Date</span>
          <span class="detail-row-value">${t.created_at}</span>
        </div>
      </div>
    </div>
  `;

  // Render action buttons
  renderOvActions(t);

  // Render chat
  renderAdminChat(t);

  // Open overlay
  document.getElementById('ticketOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTicket() {
  document.getElementById('ticketOverlay').classList.remove('open');
  document.body.style.overflow = '';
  currentTicketId = null;
}

function renderOvActions(t) {
  const actions = document.getElementById('ovActions');
  if (t.status === 'pending') {
    actions.innerHTML = `
      <button class="ov-btn accept"  onclick="ticketAccept()">✅ Accept & Chat</button>
      <button class="ov-btn dismiss" onclick="ticketDismiss()">✖ Dismiss</button>`;
  } else if (t.status === 'reviewing') {
    actions.innerHTML = `
      <button class="ov-btn resolve" onclick="ticketResolve()">✔ Mark Resolved</button>
      <button class="ov-btn dismiss" onclick="ticketDismiss()">✖ Dismiss</button>`;
  } else {
    actions.innerHTML = `
      <div style="font-size:13px;color:var(--gray-light);padding:8px;text-align:center;width:100%">This ticket has been resolved.</div>`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN CHAT
// ══════════════════════════════════════════════════════════════════════════════

function renderAdminChat(t) {
  const panel = document.getElementById('adminChatPanel');

  if (t.status === 'pending') {
    panel.classList.remove('open');
    return;
  }

  panel.classList.add('open');
  document.getElementById('chatWithName').textContent = t.reporter.name;

  const msgs = document.getElementById('acMessages');
  if (!t.messages || !t.messages.length) {
    msgs.innerHTML = '<div style="text-align:center;color:var(--gray-light);font-size:12px;padding:20px 0">No messages yet.</div>';
  } else {
    msgs.innerHTML = t.messages.map(m => {
      const isMe    = m.from === 'admin';
      const align   = isMe ? 'flex-end' : 'flex-start';
      const msgType = m.type || 'text';

      let bubble = '';
      if (msgType === 'text') {
        bubble = `<div class="ac-msg ${isMe ? 'me' : 'them'}">${m.text}</div>`;
      } else if (msgType === 'image') {
        bubble = `<div class="ac-msg ${isMe ? 'me' : 'them'}" style="padding:6px">
          <img src="${m.fileData}" alt="${m.fileName}"
            style="max-width:200px;max-height:180px;border-radius:8px;display:block;cursor:pointer"
            onclick="window.open('${m.fileData}','_blank')"/>
          <div style="font-size:10px;margin-top:4px;opacity:0.8">${m.fileName}</div>
        </div>`;
      } else {
        // file
        const icon = getFileIcon(m.fileName);
        bubble = `<div class="ac-msg ${isMe ? 'me' : 'them'}" style="padding:10px 12px;min-width:180px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:28px;flex-shrink:0">${icon}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.fileName}</div>
              <div style="font-size:11px;opacity:0.75;margin-top:1px">${m.fileSize}</div>
            </div>
          </div>
          <button onclick="acDownloadFile('${m.fileData}','${m.fileName}')"
            style="width:100%;margin-top:8px;padding:6px;background:rgba(255,255,255,0.2);border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;color:${isMe?'#fff':'var(--purple)'}">
            ⬇ Download
          </button>
        </div>`;
      }

      return `<div style="display:flex;flex-direction:column;align-items:${align}">
        ${!isMe ? `<div class="ac-msg-name">${m.name || t.reporter.name}</div>` : ''}
        ${bubble}
        <div style="font-size:10px;color:var(--gray-light);margin-top:2px">${m.time || ''}</div>
      </div>`;
    }).join('');
  }
  setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
}

function acSend() {
  const input = document.getElementById('acInput');
  const text  = input.value.trim();
  if (!text || !currentTicketId) return;

  const t = allTickets.find(x => x.id === currentTicketId);
  if (!t) return;

  if (!t.messages) t.messages = [];
  t.messages.push({
    from: 'admin', type: 'text', text,
    time: new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})
  });
  input.value = '';
  renderAdminChat(t);

  /*
   * BACKEND: POST /api/admin/reports/{id}/messages
   * Body (JSON): { type: 'text', message: text }
   */
}

function acSendFile(input) {
  if (!input.files || !input.files[0] || !currentTicketId) return;
  const file = input.files[0];
  const t = allTickets.find(x => x.id === currentTicketId);
  if (!t) return;

  // Validate size — max 10MB
  if (file.size > 10 * 1024 * 1024) {
    showToast('❌ File too large. Maximum size is 10MB.');
    input.value = '';
    return;
  }

  const isImage = file.type.startsWith('image/');
  const reader  = new FileReader();

  reader.onload = function(e) {
    if (!t.messages) t.messages = [];
    t.messages.push({
      from:     'admin',
      type:     isImage ? 'image' : 'file',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileData: e.target.result,
      time:     new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})
    });
    input.value = '';
    renderAdminChat(t);
    showToast('📎 ' + file.name + ' sent.');
  };

  reader.onerror = function() {
    showToast('❌ Failed to read file.');
    input.value = '';
  };

  reader.readAsDataURL(file);

  /*
   * BACKEND: POST /api/admin/reports/{id}/messages (multipart/form-data)
   * Fields: type = 'image' | 'file', file = <binary>
   * Store in: storage/app/public/admin_docs/
   * Returns: { file_url, file_name, file_size }
   */
}

function acDownloadFile(dataUrl, fileName) {
  const a = document.createElement('a');
  a.href     = dataUrl;
  a.download = fileName;
  a.click();
}

function formatFileSize(bytes) {
  if (bytes < 1024)             return bytes + ' B';
  if (bytes < 1024 * 1024)      return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  const icons = {
    pdf:'📄', doc:'📝', docx:'📝',
    xls:'📊', xlsx:'📊', txt:'📃',
    png:'🖼️', jpg:'🖼️', jpeg:'🖼️', gif:'🖼️', webp:'🖼️'
  };
  return icons[ext] || '📎';
}

// ══════════════════════════════════════════════════════════════════════════════
// TICKET ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

function ticketAccept() {
  const t = allTickets.find(x => x.id === currentTicketId);
  if (!t) return;

  t.status = 'reviewing';
  if (!t.messages) t.messages = [];
  const now = new Date().toLocaleString('id-ID');
  t.messages.push({ from:'admin', text:`Hello ${t.reporter.name}, we have received your report and are now reviewing it. We will get back to you shortly.`, time: now });

  updateStats();
  renderOvActions(t);
  renderAdminChat(t);
  showToast('✅ Ticket accepted — chat opened with reporter.');

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — PATCH /api/admin/reports/{id}
   * Body: { status: 'reviewing' }
   * Also: POST /api/admin/reports/{id}/messages with welcome message
   * ════════════════════════════════════════════════════════════════
   */
}

function ticketResolve() {
  const t = allTickets.find(x => x.id === currentTicketId);
  if (!t) return;

  t.status = 'resolved';
  const now = new Date().toLocaleString('id-ID');
  t.messages.push({ from:'admin', text:`This report has been reviewed and resolved. Thank you for bringing this to our attention, ${t.reporter.name}.`, time: now });

  updateStats();
  renderTickets();
  renderOvActions(t);
  renderAdminChat(t);
  showToast('✅ Ticket resolved.');

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — PATCH /api/admin/reports/{id}
   * Body: { status: 'resolved' }
   * ════════════════════════════════════════════════════════════════
   */
}

function ticketDismiss() {
  if (!confirm('Dismiss this report? It will be marked as resolved with no action.')) return;
  const t = allTickets.find(x => x.id === currentTicketId);
  if (!t) return;

  t.status = 'resolved';
  updateStats();
  renderTickets();
  closeTicket();
  showToast('Report dismissed.');

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — PATCH /api/admin/reports/{id}
   * Body: { status: 'resolved', dismissed: true }
   * ════════════════════════════════════════════════════════════════
   */
}
