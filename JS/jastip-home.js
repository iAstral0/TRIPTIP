const API = 'http://localhost:8000/api';

/* jastip-home.js */

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('jastip_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('jastip_user') || 'null'); }

function requireAuth() {
  if (!getToken()) {
    location.href = 'jastip-login.html';
    return false;
  }
  return true;
}

async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
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

function formatRp(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID'); }

// ── On page load ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard — uncomment when backend is ready:
  // if (!requireAuth()) return;

  // Bottom nav active state
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Banner auto-slide dots
  const dots = document.querySelectorAll('.banner-dots span');
  if (dots.length) {
    let current = 0;
    setInterval(() => {
      dots[current].classList.remove('active');
      current = (current + 1) % dots.length;
      dots[current].classList.add('active');
    }, 3000);
  }

  // Card tap feedback
  document.querySelectorAll('.jastip-card, .ongoing-card, .category-item').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.jastip-img, .ongoing-img, .category-img');
      if (img) {
        img.style.transition = 'transform 0.1s';
        img.style.transform = 'scale(0.92)';
        setTimeout(() => { img.style.transform = ''; }, 150);
      }
    });
  });

  // Load ongoing orders
  await loadOngoingOrders();

  // Close search on scroll
  document.querySelector('.scroll-body')?.addEventListener('scroll', closeSearch);
});

// ── Load ongoing orders (DUMMY DATA — replace with authFetch('/orders?status=ongoing')) ──
async function loadOngoingOrders() {
  const container = document.getElementById('ongoingOrdersHome');
  if (!container) return;

  /* DUMMY DATA — replace with real API call when backend is ready:
  const res  = await authFetch('/orders?status=ongoing');
  const data = await res.json();
  const orders = data.data || data || [];
  */
  const orders = [
    { id:'00012', flag:'🇲🇾', destination:'Kuala Lumpur', status:'Collecting' },
    { id:'00015', flag:'🇯🇵', destination:'Tokyo',         status:'In Transit' },
    { id:'00018', flag:'🇸🇬', destination:'Singapore',     status:'Pending'    },
  ];

  if (!orders.length) {
    container.innerHTML = '<div style="color:#9E9E9E;font-size:13px;padding:8px 0">No Ongoing Orders</div>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="ongoing-card" onclick="location.href='jastip-orders.html'">
      <div class="ongoing-img">${order.flag || '📦'}</div>
      <div class="ongoing-info">
        <div class="ongoing-name">${order.destination} #${order.id}</div>
        <div class="ongoing-status">${order.status}</div>
      </div>
      <span class="ongoing-arrow">›</span>
    </div>`).join('');
}

// ── Search ────────────────────────────────────────────────────────────────────
const searchData = {
  destinations: [
    { name:'Singapore', sub:'Asia · International',     icon:'🇸🇬', url:'jastip-international.html' },
    { name:'Japan',     sub:'Asia · International',     icon:'🇯🇵', url:'jastip-international.html' },
    { name:'Korea',     sub:'Asia · International',     icon:'🇰🇷', url:'jastip-international.html' },
    { name:'Malaysia',  sub:'Asia · International',     icon:'🇲🇾', url:'jastip-international.html' },
    { name:'Thailand',  sub:'Asia · International',     icon:'🇹🇭', url:'jastip-international.html' },
    { name:'USA',       sub:'America · International',  icon:'🇺🇸', url:'jastip-international.html' },
    { name:'UK',        sub:'Europe · International',   icon:'🇬🇧', url:'jastip-international.html' },
    { name:'Australia', sub:'Oceania · International',  icon:'🇦🇺', url:'jastip-international.html' },
    { name:'France',    sub:'Europe · International',   icon:'🇫🇷', url:'jastip-international.html' },
    { name:'Bandung',    sub:'Jawa Barat · Domestic',   icon:'🌺', url:'jastip-domestic.html' },
    { name:'Yogyakarta', sub:'DI Yogyakarta · Domestic',icon:'🏛️', url:'jastip-domestic.html' },
    { name:'Bali',       sub:'Bali · Domestic',         icon:'🌴', url:'jastip-domestic.html' },
    { name:'Jakarta',    sub:'DKI Jakarta · Domestic',  icon:'🏙️', url:'jastip-domestic.html' },
    { name:'Surabaya',   sub:'Jawa Timur · Domestic',   icon:'⚓', url:'jastip-domestic.html' },
  ],
  categories: [
    { name:'International', sub:'Order items from abroad',          icon:'✈️', url:'jastip-international.html' },
    { name:'Domestic',      sub:'Souvenirs from Indonesian cities', icon:'🏠', url:'jastip-domestic.html' },
    { name:'Crowdshipping', sub:'Community group shipping',         icon:'📦', url:'jastip-crowdshipping.html' },
  ],
};

function homeSearch(q) {
  q = q.toLowerCase().trim();
  const panel   = document.getElementById('searchResults');
  const overlay = document.getElementById('srOverlay');
  if (!q) { closeSearch(); return; }

  const allItems = [
    ...searchData.destinations.map(d => ({...d, section:'Destinations'})),
    ...searchData.categories.map(c   => ({...c, section:'Categories'})),
  ];

  const matches = allItems.filter(item =>
    item.name.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)
  );

  if (!matches.length) {
    panel.innerHTML = `<div class="sr-empty">No results for "<strong>${q}</strong>"</div>`;
  } else {
    const grouped = {};
    matches.forEach(item => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });
    let html = '';
    Object.entries(grouped).forEach(([section, items]) => {
      html += `<div class="sr-section">${section}</div>`;
      html += items.slice(0,5).map(item => `
        <div class="sr-item" onclick="srNavigate('${item.url}')">
          <div class="sr-icon">${item.icon}</div>
          <div class="sr-info">
            <div class="sr-name">${highlightMatch(item.name, q)}</div>
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

function highlightMatch(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return text.substring(0, idx) +
    `<span style="color:var(--purple);font-weight:700">${text.substring(idx, idx + q.length)}</span>` +
    text.substring(idx + q.length);
}

function srNavigate(url) { closeSearch(); if (url) location.href = url; }

function closeSearch() {
  document.getElementById('searchResults')?.classList.remove('show');
  document.getElementById('srOverlay')?.classList.remove('show');
  const inp = document.getElementById('homeSearchInput');
  if (inp) inp.value = '';
}
