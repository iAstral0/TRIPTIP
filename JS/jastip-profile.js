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

// ── Utilities ─────────────────────────────────────────────────────────────────
function showToast(msg, dur = 2400) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
const svgPerson = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const svgSwitch = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
const svgReport = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
const svgLogout = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
const svgBag    = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`;

function mi(icon, label, fn, cls = '') {
  return `<a class="menu-item ${cls}" href="#" onclick="${fn};return false;">
    <div class="menu-icon">${icon}</div>
    <span class="menu-label">${label}</span>
    <span class="menu-arrow">›</span>
  </a>`;
}

// ── State ─────────────────────────────────────────────────────────────────────
let userData          = { name: '', email: '', phone: '' };
let currentMode       = 'customer';
let countdownInterval = null;
let verifiedViaEmail  = false;

// ── On load ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard — uncomment when backend is ready:
  // if (!getToken()) { location.href = 'jastip-login.html'; return; }

  /* DUMMY DATA — replace with real API call when backend is ready:
  const res  = await authFetch('/me');
  const data = await res.json();
  userData = { name: data.name, email: data.email, phone: data.phone };
  */
  // Use localStorage if available, else use dummy
  const cached = getUser();
  if (cached && cached.name) {
    userData = { name: cached.name || '', email: cached.email || '', phone: cached.phone || '' };
  } else {
    userData = { name: 'John Doe', email: 'johndoe@email.com', phone: '+62 812 3456 7890' };
  }
  renderProfile();

  // 3. Wire OTP inputs
  document.querySelectorAll('.otp-input').forEach((inp, i, arr) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && i < arr.length - 1) arr[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) arr[i - 1].focus();
    });
  });
});

// ── Render profile from userData ──────────────────────────────────────────────
function renderProfile() {
  // Header
  const nameEl  = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  if (nameEl)  nameEl.textContent  = userData.name  || '-';
  if (emailEl) emailEl.textContent = userData.email || '-';

  // Info rows
  const dispName  = document.getElementById('displayName');
  const dispEmail = document.getElementById('displayEmail');
  const dispPhone = document.getElementById('displayPhone');
  if (dispName)  dispName.textContent  = userData.name  || '-';
  if (dispEmail) dispEmail.textContent = userData.email || '-';
  if (dispPhone) dispPhone.textContent = userData.phone || '-';

  // Menu: determine which mode to display
  const role      = getUser()?.role || 'customer';
  const savedMode = localStorage.getItem('jastip_current_mode');
  let displayMode;
  if (role !== 'traveller') {
    // Pure customer — always customer mode
    displayMode = 'customer';
    localStorage.setItem('jastip_current_mode', 'customer');
  } else if (savedMode === 'customer') {
    // Traveller who switched to customer view
    displayMode = 'customer';
  } else {
    // Traveller in traveller mode (default)
    displayMode = 'traveller';
  }
  setMode(displayMode);
}

// ── Mode / menu ───────────────────────────────────────────────────────────────

// Named wrappers — avoids quote conflicts inside onclick="" attributes
function goCustomerMode()  { switchMode('customer'); }
function goTravellerMode() { switchMode('traveller'); }

function switchMode(targetMode) {
  localStorage.setItem('jastip_current_mode', targetMode);
  const user = getUser();
  if (user) {
    user.current_mode = targetMode;
    localStorage.setItem('jastip_user', JSON.stringify(user));
  }
  location.href = targetMode === 'traveller'
    ? 'jastip-traveller-home.html'
    : 'jastip-home.html';
}

function setMode(m) {
  currentMode = m;

  // Bottom nav routing
  const bnOrders = document.getElementById('bnOrders');
  const bnHome   = document.getElementById('bnHome');
  if (bnOrders) bnOrders.onclick = () =>
    location.href = m === 'traveller' ? 'jastip-traveller-orders.html' : 'jastip-orders.html';
  if (bnHome) bnHome.onclick = () =>
    location.href = m === 'traveller' ? 'jastip-traveller-home.html' : 'jastip-home.html';

  // Mode badge
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'traveller' ? '✈️ Traveller' : '👤 Customer';

  // Menu items
  const menu = document.getElementById('menuList');
  if (!menu) return;

  const isTraveller = getUser()?.role === 'traveller';

  if (m === 'customer') {
    menu.innerHTML =
      mi(svgReport, 'My Reports',   "location.href='jastip-support.html'") +
      mi(svgPerson, 'Edit Profile', 'openEdit()') +
      (!isTraveller
        ? mi(svgBag,    'Become a Traveller!',      'openBecomeOverlay()')
        : mi(svgSwitch, 'Switch to Traveller Page', 'goTravellerMode()')
      ) +
      '<div style="height:40px"></div>' +
      mi(svgLogout, 'Log Out', 'showLogoutSheet(event)', 'logout');
  } else {
    // Traveller mode
    menu.innerHTML =
      mi(svgReport, 'My Reports',   "location.href='jastip-support.html'") +
      mi(svgPerson, 'Edit Profile', 'openEdit()') +
      mi(svgSwitch, 'Switch to Customer Page', 'goCustomerMode()') +
      '<div style="height:40px"></div>' +
      mi(svgLogout, 'Log Out', 'showLogoutSheet(event)', 'logout');
  }
}

function switchToTraveller() { goTravellerMode(); }

// ── Edit Profile overlay ──────────────────────────────────────────────────────
function openEdit() {
  document.getElementById('editOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  showViewMode();
}
function closeEdit() {
  document.getElementById('editOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function showViewMode() {
  document.getElementById('viewMode').style.display  = 'block';
  document.getElementById('editMode').classList.remove('show');
  // Populate view with current data
  const dispName  = document.getElementById('displayName');
  const dispEmail = document.getElementById('displayEmail');
  const dispPhone = document.getElementById('displayPhone');
  if (dispName)  dispName.textContent  = userData.name  || '-';
  if (dispEmail) dispEmail.textContent = userData.email || '-';
  if (dispPhone) dispPhone.textContent = userData.phone || '-';
}
function enterEditMode() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').classList.add('show');
  // Pre-fill edit fields
  document.getElementById('editName').value  = userData.name  || '';
  document.getElementById('editEmail').value = userData.email || '';
  document.getElementById('editPhone').value = userData.phone || '';
  document.getElementById('currentPw').value = '';
  document.getElementById('newPw').value     = '';
  verifiedViaEmail = false;
  clearErrors();
}
function cancelEdit() {
  document.getElementById('editMode').classList.remove('show');
  document.getElementById('viewMode').style.display = 'block';
  clearErrors();
}
function toggleVis(id, btn) {
  const i = document.getElementById(id);
  const h = i.type === 'password';
  i.type = h ? 'text' : 'password';
  btn.textContent = h ? '🙈' : '👁';
}
function clearErrors() {
  ['nameErr','emailErr','phoneErr','currentPwErr','newPwErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  ['editName','editEmail','editPhone','currentPw','newPw'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}
function setErr(inp, err, msg) {
  const i = document.getElementById(inp);
  const e = document.getElementById(err);
  if (i) i.classList.add('error');
  if (e) { e.textContent = msg; e.classList.add('show'); }
}

async function saveChanges() {
  clearErrors();
  let bad      = false;
  const name   = document.getElementById('editName').value.trim();
  const email  = document.getElementById('editEmail').value.trim();
  const phone  = document.getElementById('editPhone').value.trim();
  const curPw  = document.getElementById('currentPw').value;
  const newPw  = document.getElementById('newPw').value;

  if (name.length < 2)                            { setErr('editName',  'nameErr',     'Please enter your name.');            bad = true; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('editEmail', 'emailErr',    'Please enter a valid email.');        bad = true; }
  if (!/^[0-9+\-\s]{7,15}$/.test(phone))          { setErr('editPhone', 'phoneErr',    'Please enter a valid phone number.'); bad = true; }
  if (newPw && newPw.length < 6)                   { setErr('newPw',    'newPwErr',    'Password must be at least 6 chars.'); bad = true; }
  if (newPw && !verifiedViaEmail && !curPw)         { setErr('currentPw','currentPwErr','Current password is required.');     bad = true; }
  if (bad) return;

  const btn = document.getElementById('saveBtn');
  btn.classList.add('loading');

  try {
    const body = { name, email, phone };
    if (newPw) { body.password = newPw; body.password_confirmation = newPw; }
    if (curPw && !verifiedViaEmail) body.current_password = curPw;

    /* DUMMY — replace with real API call when backend ready:
    const res  = await authFetch('/user/profile', { method: 'PATCH', body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { showToast('❌ ' + (data.message || 'Update failed.')); return; }
    */

    // Simulate save locally
    await new Promise(r => setTimeout(r, 800));
    userData = { name, email, phone };
    const user = getUser() || {};
    user.name  = name; user.email = email; user.phone = phone;
    localStorage.setItem('jastip_user', JSON.stringify(user));
    renderProfile();
    closeEdit();
    showToast('✅ Profile updated successfully!');
  } catch {
    showToast('❌ Cannot reach server.');
  } finally {
    btn.classList.remove('loading');
  }
}

// ── OTP email verification for profile ───────────────────────────────────────
function openVerifySheet(e) {
  e && e.preventDefault();
  const email = document.getElementById('editEmail').value || userData.email;
  const el    = document.getElementById('sheetEmail');
  if (el) el.textContent = email;
  document.getElementById('verifyOverlay').classList.add('show');
  document.querySelectorAll('.otp-input').forEach(i => i.value = '');
  const first = document.querySelectorAll('.otp-input')[0];
  if (first) first.focus();
  sendProfileOtp(email);
}
function closeVerifySheet(e) {
  if (!e || e.target === document.getElementById('verifyOverlay')) {
    document.getElementById('verifyOverlay').classList.remove('show');
    clearInterval(countdownInterval);
  }
}
async function sendProfileOtp(email) {
  try {
    await authFetch('/user/send-verify-otp', { method: 'POST', body: JSON.stringify({ email }) });
    startResendTimer();
  } catch { showToast('❌ Cannot reach server.'); }
}
async function submitOTP() {
  const code = [...document.querySelectorAll('.otp-input')].map(i => i.value).join('');
  if (code.length < 6) { showToast('Enter the full 6-digit code.'); return; }
  try {
    const res  = await authFetch('/user/verify-email-otp', { method: 'POST', body: JSON.stringify({ otp: code }) });
    const data = await res.json();
    if (res.ok) {
      verifiedViaEmail = true;
      closeVerifySheet();
      const cpEl = document.getElementById('currentPw');
      if (cpEl) { cpEl.value = ''; cpEl.placeholder = 'Verified via email ✓'; }
      showToast('✅ Email verified!');
    } else {
      showToast('❌ ' + (data.message || 'Incorrect code.'));
      document.querySelectorAll('.otp-input').forEach(i => { i.value = ''; i.style.borderColor = 'var(--error)'; });
      const first = document.querySelectorAll('.otp-input')[0];
      if (first) first.focus();
      setTimeout(() => document.querySelectorAll('.otp-input').forEach(i => i.style.borderColor = ''), 1200);
    }
  } catch { showToast('❌ Cannot reach server.'); }
}
function startResendTimer() {
  clearInterval(countdownInterval);
  let s = 60;
  const cdEl   = document.getElementById('countdown');
  const timerEl = document.getElementById('resendTimer');
  const btnEl   = document.getElementById('resendBtn');
  if (cdEl)    cdEl.textContent = s;
  if (timerEl) timerEl.classList.remove('hidden');
  if (btnEl)   btnEl.classList.add('hidden');
  countdownInterval = setInterval(() => {
    s--;
    if (cdEl) cdEl.textContent = s;
    if (s <= 0) {
      clearInterval(countdownInterval);
      if (timerEl) timerEl.classList.add('hidden');
      if (btnEl)   btnEl.classList.remove('hidden');
    }
  }, 1000);
}

// ── Become Traveller overlay ──────────────────────────────────────────────────
function openBecomeOverlay() {
  document.getElementById('becomeTravellerOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBecomeOverlay() {
  document.getElementById('becomeTravellerOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function handleBtPhoto(inputId, boxId, hintId) {
  const input = document.getElementById(inputId);
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const box  = document.getElementById(boxId);
    const hint = document.getElementById(hintId);
    if (hint) hint.style.display = 'none';
    let img = box.querySelector('img');
    if (!img) { img = document.createElement('img'); img.style.cssText = 'width:100%;height:140px;object-fit:cover;border-radius:8px'; box.appendChild(img); }
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}
async function submitBecomeTraveller() {
  // Prevent double submission
  const btn = document.getElementById('bt-submit-btn');
  if (btn.disabled) return;
  const nik        = document.getElementById('bt-nik').value.trim();
  const name       = document.getElementById('bt-name').value.trim();
  const dob        = document.getElementById('bt-dob').value;
  const gender     = document.getElementById('bt-gender').value;
  const addr       = document.getElementById('bt-address').value.trim();
  const profession = document.getElementById('bt-profession').value.trim();
  const idFile     = document.getElementById('bt-id-input').files?.[0];
  const proofFile  = document.getElementById('bt-proof-input').files?.[0];

  // Clear all errors first
  ['bt-nik-err','bt-name-err','bt-dob-err','bt-gender-err',
   'bt-address-err','bt-profession-err','bt-id-err','bt-proof-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });

  let bad = false;
  if (!nik || nik.length < 16) { document.getElementById('bt-nik-err').classList.add('show'); bad = true; }
  if (!name)       { document.getElementById('bt-name-err').classList.add('show'); bad = true; }
  if (!dob)        { document.getElementById('bt-dob-err').classList.add('show'); bad = true; }
  if (!gender)     { document.getElementById('bt-gender-err').classList.add('show'); bad = true; }
  if (!addr)       { document.getElementById('bt-address-err').classList.add('show'); bad = true; }
  if (!profession) { document.getElementById('bt-profession-err').classList.add('show'); bad = true; }
  if (!idFile)     { document.getElementById('bt-id-err').classList.add('show'); bad = true; }
  if (!proofFile)  { document.getElementById('bt-proof-err').classList.add('show'); bad = true; }
  if (bad) return;

  btn.classList.add('loading');

  try {
    const formData = new FormData();
    formData.append('nik',        nik);
    formData.append('name',       name);
    formData.append('dob',        dob);
    formData.append('gender',     gender);
    formData.append('address',    addr);
    formData.append('profession', profession);
    formData.append('id_card',    idFile);
    formData.append('selfie',     proofFile);

    const res  = await fetch(`${API}/user/become-traveller`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    const data = await res.json();

    if (res.ok) {
        // Update stored user role
        const user = getUser();
        if (user) {
          user.role = 'traveller';
          localStorage.setItem('jastip_user', JSON.stringify(user));
        }
        // Disable button to prevent double submit
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = '✅ Submitted!';
        showToast('✅ Congratulations! You are now a Traveller!');
        // Redirect to traveller home after short delay
        setTimeout(() => {
          location.href = 'jastip-traveller-home.html';
        }, 1500);
    } else {
      // Show specific field errors from Laravel validation
      if (data.errors) {
        const map = {
          nik: 'bt-nik-err', name: 'bt-name-err', dob: 'bt-dob-err',
          gender: 'bt-gender-err', address: 'bt-address-err',
          profession: 'bt-profession-err', id_card: 'bt-id-err', selfie: 'bt-proof-err'
        };
        Object.entries(data.errors).forEach(([field, msgs]) => {
          const errEl = document.getElementById(map[field]);
          if (errEl) { errEl.textContent = msgs[0]; errEl.classList.add('show'); }
        });
      } else {
        showToast('❌ ' + (data.message || 'Submission failed. Please try again.'));
      }
    }
  } catch (err) {
    showToast('❌ Cannot reach server. Is Laravel running?');
  } finally {
    btn.classList.remove('loading');
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
function showLogoutSheet(e) { e && e.preventDefault(); document.getElementById('logoutOverlay').classList.add('show'); }
function hideLogoutSheet(e) {
  if (!e || e.target === document.getElementById('logoutOverlay'))
    document.getElementById('logoutOverlay').classList.remove('show');
}
async function doLogout() {
  document.getElementById('logoutOverlay').classList.remove('show');
  try { await authFetch('/logout', { method: 'POST' }); } catch { /* proceed */ }
  localStorage.removeItem('jastip_token');
  localStorage.removeItem('jastip_user');
  showToast('👋 Logged out!');
  setTimeout(() => location.href = 'jastip-login.html', 1000);
}
