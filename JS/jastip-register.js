const API = 'http://localhost:8000/api';

/* jastip-register.js — logic for jastip-register */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
  let selectedRole = null;
  let idCardSaved  = false;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function showToast(msg, dur = 2500) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  function goScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  // ── Step 1 validation ─────────────────────────────────────────────────────────
  const emailInput    = document.getElementById('emailInput');
  const nameInput     = document.getElementById('nameInput');
  const phoneInput    = document.getElementById('phoneInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmInput  = document.getElementById('confirmInput');

  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function isValidPhone(v){ return /^[0-9+\-\s]{7,15}$/.test(v.trim()); }

  function validateStep1() {
    const checks = [
      { el: emailInput,    err:'emailError',    fn: v => isValidEmail(v),                          msg:'Please enter a valid email.' },
      { el: nameInput,     err:'nameError',     fn: v => v.trim().length >= 2,                     msg:'Please enter your name.' },
      { el: phoneInput,    err:'phoneError',    fn: v => isValidPhone(v),                          msg:'Please enter a valid phone number.' },
      { el: passwordInput, err:'passwordError', fn: v => v.length >= 6,                            msg:'Password must be at least 6 characters.' },
      { el: confirmInput,  err:'confirmError',  fn: v => v === passwordInput.value && v.length>=6, msg:'Passwords do not match.' },
    ];
    let ok = true;
    checks.forEach(({ el, err, fn }) => {
      const valid = fn(el.value);
      el.classList.toggle('error', !valid && el.value !== '');
      document.getElementById(err).classList.toggle('show', !valid && el.value !== '');
      if (!valid) {
        if (!el.value) { el.classList.add('error'); document.getElementById(err).classList.add('show'); }
        ok = false;
      }
    });
    return ok;
  }

  // Live validation
  [[emailInput,'emailError',v=>isValidEmail(v)],[nameInput,'nameError',v=>v.trim().length>=2],
   [phoneInput,'phoneError',v=>isValidPhone(v)],[passwordInput,'passwordError',v=>v.length>=6],
   [confirmInput,'confirmError',v=>v===passwordInput.value&&v.length>=6]].forEach(([el,err,fn])=>{
    el.addEventListener('blur', () => { const ok=fn(el.value); el.classList.toggle('error',!ok&&el.value!==''); document.getElementById(err).classList.toggle('show',!ok&&el.value!==''); });
    el.addEventListener('input', () => { if(el.classList.contains('error')){ const ok=fn(el.value); el.classList.toggle('error',!ok&&el.value!==''); document.getElementById(err).classList.toggle('show',!ok&&el.value!==''); } });
    el.addEventListener('keydown', e => { if(e.key==='Enter') goStep2(); });
  });

  // Password toggles
  document.getElementById('togglePw1').addEventListener('click', () => { const h=passwordInput.type==='password'; passwordInput.type=h?'text':'password'; document.getElementById('togglePw1').textContent=h?'🙈':'👁'; });
  document.getElementById('togglePw2').addEventListener('click', () => { const h=confirmInput.type==='password'; confirmInput.type=h?'text':'password'; document.getElementById('togglePw2').textContent=h?'🙈':'👁'; });

  function goStep2() {
    if (!validateStep1()) return;
    // Send OTP simulation
    sendOtp();
  }

  // ── OTP: Email verification (real API) ──────────────────────────────────────
  let otpInterval = null;

  // Called after step 1 validates — registers user and sends OTP via email
  async function sendOtp() {
    const email    = document.getElementById('emailInput').value.trim();
    const name     = document.getElementById('nameInput').value.trim();
    const phone    = document.getElementById('phoneInput').value.trim();
    const password = document.getElementById('passwordInput').value;

    // Show loading on the Next button
    const btn = document.getElementById('step1Btn');
    btn.classList.add('loading');

    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Success — show OTP screen
        document.getElementById('otpEmailDisplay').textContent = email;
        for (let i = 0; i < 6; i++) {
          const box = document.getElementById('otp' + i);
          box.value = '';
          box.classList.remove('filled', 'error');
        }
        document.getElementById('otpError').style.display = 'none';
        goScreen('screenOtp');
        document.getElementById('otp0').focus();
        startOtpTimer();
      } else {
        // Server error (e.g. email already taken)
        showToast('❌ ' + (data.message || 'Registration failed. Please try again.'));
      }
    } catch (err) {
      showToast('❌ Cannot reach server. Is Laravel running?');
    } finally {
      btn.classList.remove('loading');
    }
  }

  function startOtpTimer(seconds = 60) {
    clearInterval(otpInterval);
    document.getElementById('otpResendBtn').style.display = 'none';
    document.getElementById('otpTimerLabel').style.display = '';
    document.getElementById('otpTimer').style.display = '';
    let t = seconds;
    document.getElementById('otpTimer').textContent = t + 's';
    otpInterval = setInterval(() => {
      t--;
      document.getElementById('otpTimer').textContent = t + 's';
      if (t <= 0) {
        clearInterval(otpInterval);
        document.getElementById('otpTimerLabel').style.display = 'none';
        document.getElementById('otpTimer').style.display = 'none';
        document.getElementById('otpResendBtn').style.display = 'inline';
      }
    }, 1000);
  }

  async function otpResend() {
    const email = document.getElementById('emailInput').value.trim();
    document.getElementById('otpResendBtn').style.display = 'none';
    for (let i = 0; i < 6; i++) {
      const box = document.getElementById('otp' + i);
      box.value = '';
      box.classList.remove('filled', 'error');
    }
    document.getElementById('otpError').style.display = 'none';

    try {
      const res = await fetch(`${API}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      showToast(res.ok ? '📧 New code sent to your email!' : '❌ ' + (data.message || 'Failed to resend.'));
    } catch {
      showToast('❌ Cannot reach server.');
    }

    startOtpTimer();
    document.getElementById('otp0').focus();
  }

  function otpInput(input, idx) {
    input.value = input.value.replace(/[^0-9]/g, '');
    input.classList.toggle('filled', input.value !== '');
    if (input.value && idx < 5) {
      document.getElementById('otp' + (idx + 1)).focus();
    }
  }

  function otpKey(e, idx) {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      const prev = document.getElementById('otp' + (idx - 1));
      prev.value = '';
      prev.classList.remove('filled');
      prev.focus();
    }
    if (e.key === 'Enter') verifyOtp();
  }

  async function verifyOtp() {
    const entered = Array.from({length:6}, (_, i) => document.getElementById('otp'+i).value).join('');
    if (entered.length < 6) { showToast('⚠️ Enter all 6 digits.'); return; }

    const email = document.getElementById('emailInput').value.trim();
    const btn   = document.getElementById('otpVerifyBtn');
    btn.classList.add('loading');

    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, otp: entered })
      });
      const data = await res.json();

      if (res.ok) {
        // Save token and user to localStorage for other pages to use
        localStorage.setItem('jastip_token', data.token);
        localStorage.setItem('jastip_user',  JSON.stringify(data.user));
        clearInterval(otpInterval);
        goScreen('screen2'); // proceed to role selection
      } else {
        // Wrong or expired OTP — shake boxes
        document.getElementById('otpError').style.display = 'block';
        for (let i = 0; i < 6; i++) {
          const box = document.getElementById('otp' + i);
          box.classList.add('error');
          setTimeout(() => box.classList.remove('error'), 400);
        }
      }
    } catch {
      showToast('❌ Cannot reach server. Is Laravel running?');
    } finally {
      btn.classList.remove('loading');
    }
  }

  // ── Step 2: Role selection ────────────────────────────────────────────────────
  function selectRole(role) {
    selectedRole = role;
    document.getElementById('roleCustomer').classList.toggle('selected',  role === 'customer');
    document.getElementById('roleTraveller').classList.toggle('selected', role === 'traveller');
  }

  function goStep3() {
    if (!selectedRole) { showToast('⚠️ Please select a role first.'); return; }
    if (selectedRole === 'customer') {
      // Customers go straight to creating account
      registerAccount(false);
    } else {
      // Travellers see ID card step
      goScreen('screen3');
    }
  }

  // ── Step 3: ID Card ───────────────────────────────────────────────────────────
  function handleIdPhoto(input, boxId, hintId) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      const box  = document.getElementById(boxId  || 'id-photo-box');
      const hint = document.getElementById(hintId || 'id-photo-hint');
      hint.style.display = 'none';
      let img = box.querySelector('img');
      if (!img) { img = document.createElement('img'); img.style.cssText='width:100%;height:150px;object-fit:cover'; box.appendChild(img); }
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }

  function finishRegister(skip) {
    if (!skip) {
      // Validate ID fields if not skipping
      const nik  = document.getElementById('id-nik').value.trim();
      const name = document.getElementById('id-name').value.trim();
      const dob  = document.getElementById('id-dob').value;
      const addr = document.getElementById('id-address').value.trim();
      const hasPhoto = document.getElementById('id-photo-input').files && document.getElementById('id-photo-input').files[0];

      if (!nik || !name || !dob || !addr) {
        showToast('⚠️ Please fill in all ID fields, or tap Skip.');
        return;
      }
      const hasSelfie = document.getElementById('selfie-photo-input').files && document.getElementById('selfie-photo-input').files[0];
    if (!hasPhoto) {
        showToast('⚠️ Please upload your ID card photo, or tap Skip.');
        return;
      }
      if (!hasSelfie) {
        showToast('⚠️ Please upload a selfie holding your ID card, or tap Skip.');
        return;
      }
      idCardSaved = true;
      // NOTE: When backend ready, save ID card data to /api/user/id-card
    } else {
      idCardSaved = false;
    }
    registerAccount(skip);
  }

  // ── Register & show success ───────────────────────────────────────────────────
  async function registerAccount(skippedId) {
    const btn = document.getElementById(selectedRole === 'traveller' ? 'finishBtn' : 'step1Btn');
    btn.classList.add('loading');
    await new Promise(r => setTimeout(r, 1800));
    btn.classList.remove('loading');

    // NOTE: When backend ready:
    // POST /api/auth/register with { email, name, phone, password, role, idCard? }
    // Store JWT token and role in localStorage

    // Show success
    const overlay = document.getElementById('successOverlay');
    const isTraveller = selectedRole === 'traveller';
    document.getElementById('successTitle').textContent   = 'Welcome to JasTip!';
    document.getElementById('successSub').textContent     = isTraveller
      ? (idCardSaved ? 'Your traveller account is ready. Your ID is saved — no need to re-enter when creating trips!' : 'Your traveller account is ready. You can add your ID card when creating your first trip.')
      : 'Your customer account is ready. Start ordering items from around the world!';
    document.getElementById('successBadge').textContent   = isTraveller ? '✈️ Traveller' : '📦 Customer';
    overlay.classList.add('show');

    // Redirect after delay
    setTimeout(() => {
      location.href = isTraveller ? 'jastip-traveller-home.html' : 'jastip-home.html';
    }, 2400);
  }

  // Pre-select customer by default for visual clarity
  // (user must still tap to confirm)
