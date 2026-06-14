const API = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', function () {

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toast = document.getElementById('toast');

  function showToast(msg, dur = 2500) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), dur);
  }

  function showScreen(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  const emailInput    = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn      = document.getElementById('loginBtn');

  document.getElementById('togglePw').addEventListener('click', () => {
    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    document.getElementById('togglePw').textContent = hidden ? '🙈' : '👁';
  });

  document.getElementById('createLink').addEventListener('click', (e) => {
    e.preventDefault();
    location.href = 'jastip-register.html';
  });

  document.getElementById('forgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('screenFpEmail');
  });

  [emailInput, passwordInput].forEach(el =>
    el.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); })
  );

  loginBtn.addEventListener('click', async () => {
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!isValidEmail(email) || password.length < 6) {
      showToast('⚠️ Please enter a valid email and password.');
      return;
    }

    loginBtn.classList.add('loading');
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('jastip_token', data.token);
        localStorage.setItem('jastip_user',  JSON.stringify(data.user));
        showToast('✅ Welcome back!');
        setTimeout(() => {
          const role = data.user.role;
          if (role === 'admin')     location.href = 'jastip-admin.html';
          else if (role === 'traveller') location.href = 'jastip-traveller-home.html';
          else                          location.href = 'jastip-home.html';
        }, 1000);
      } else {
        if (res.status === 403) showToast('⚠️ Please verify your email first.');
        else showToast('❌ ' + (data.message || 'Wrong email or password.'));
      }
    } catch { showToast('❌ Cannot reach server. Is Laravel running?'); }
    finally   { loginBtn.classList.remove('loading'); }
  });

  // ── FORGOT: STEP 1 — Send OTP to email ───────────────────────────────────────
  document.getElementById('fpBack1').addEventListener('click', e => {
    e.preventDefault(); showScreen('screenLogin');
  });
  document.getElementById('fpBack2').addEventListener('click', e => {
    e.preventDefault(); showScreen('screenLogin');
  });

  const fpSendBtn = document.getElementById('fpSendBtn');
  fpSendBtn.addEventListener('click', async () => {
    const email = document.getElementById('fpEmail').value.trim();
    if (!isValidEmail(email)) {
      document.getElementById('fpEmailError').classList.add('show');
      return;
    }
    document.getElementById('fpEmailError').classList.remove('show');
    fpSendBtn.classList.add('loading');

    try {
      const res  = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        document.getElementById('fpEmailDisplay').textContent = email;
        for (let i = 0; i < 6; i++) {
          const b = document.getElementById('fpotp' + i);
          b.value = ''; b.classList.remove('filled','error');
        }
        document.getElementById('fpOtpError').classList.remove('show');
        showScreen('screenFpOtp');
        startFpTimer();
        document.getElementById('fpotp0').focus();
        showToast('📧 Reset code sent to your email!');
      } else {
        showToast('❌ ' + (data.message || 'Email not found.'));
      }
    } catch { showToast('❌ Cannot reach server.'); }
    finally   { fpSendBtn.classList.remove('loading'); }
  });

  // ── FORGOT: STEP 2 — Verify OTP ──────────────────────────────────────────────
  let fpTimerInt = null;

  function startFpTimer(sec = 60) {
    clearInterval(fpTimerInt);
    document.getElementById('fpResendBtn').style.display  = 'none';
    document.getElementById('fpTimerLabel').style.display = '';
    document.getElementById('fpTimer').style.display      = '';
    let t = sec;
    document.getElementById('fpTimer').textContent = t + 's';
    fpTimerInt = setInterval(() => {
      t--;
      document.getElementById('fpTimer').textContent = t + 's';
      if (t <= 0) {
        clearInterval(fpTimerInt);
        document.getElementById('fpTimerLabel').style.display = 'none';
        document.getElementById('fpTimer').style.display      = 'none';
        document.getElementById('fpResendBtn').style.display  = 'inline';
      }
    }, 1000);
  }

  window.fpResend = async function () {
    const email = document.getElementById('fpEmail').value.trim();
    document.getElementById('fpResendBtn').style.display = 'none';
    for (let i = 0; i < 6; i++) {
      const b = document.getElementById('fpotp' + i);
      b.value = ''; b.classList.remove('filled','error');
    }
    document.getElementById('fpOtpError').classList.remove('show');
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      showToast(res.ok ? '📧 New reset code sent!' : '❌ Failed to resend.');
    } catch { showToast('❌ Cannot reach server.'); }
    startFpTimer();
    document.getElementById('fpotp0').focus();
  };

  window.fpOtpInput = function (input, idx) {
    input.value = input.value.replace(/[^0-9]/g, '');
    input.classList.toggle('filled', input.value !== '');
    if (input.value && idx < 5) document.getElementById('fpotp' + (idx + 1)).focus();
  };

  window.fpOtpKey = function (e, idx) {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      const p = document.getElementById('fpotp' + (idx - 1));
      p.value = ''; p.classList.remove('filled'); p.focus();
    }
    if (e.key === 'Enter') document.getElementById('fpVerifyBtn').click();
  };

  const fpVerifyBtn = document.getElementById('fpVerifyBtn');
  fpVerifyBtn.addEventListener('click', async () => {
    const otp   = Array.from({length:6}, (_,i) => document.getElementById('fpotp'+i).value).join('');
    const email = document.getElementById('fpEmail').value.trim();
    if (otp.length < 6) { showToast('⚠️ Enter all 6 digits.'); return; }

    fpVerifyBtn.classList.add('loading');
    try {
      const res  = await fetch(`${API}/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (res.ok) {
        clearInterval(fpTimerInt);
        localStorage.setItem('fp_reset_token', data.reset_token);
        localStorage.setItem('fp_email', email);
        showScreen('screenFpReset');
        showToast('✅ Code verified! Set your new password.');
      } else {
        document.getElementById('fpOtpError').classList.add('show');
        for (let i = 0; i < 6; i++) {
          const b = document.getElementById('fpotp' + i);
          b.classList.add('error');
          setTimeout(() => b.classList.remove('error'), 400);
        }
      }
    } catch { showToast('❌ Cannot reach server.'); }
    finally   { fpVerifyBtn.classList.remove('loading'); }
  });

  // ── FORGOT: STEP 3 — Reset Password ──────────────────────────────────────────
  const fpResetBtn = document.getElementById('fpResetBtn');
  fpResetBtn.addEventListener('click', async () => {
    const newPw     = document.getElementById('fpNewPw').value;
    const confirmPw = document.getElementById('fpConfirmPw').value;
    let valid = true;

    if (newPw.length < 6) {
      document.getElementById('fpNewPwError').classList.add('show'); valid = false;
    } else {
      document.getElementById('fpNewPwError').classList.remove('show');
    }
    if (newPw !== confirmPw) {
      document.getElementById('fpConfirmPwError').classList.add('show'); valid = false;
    } else {
      document.getElementById('fpConfirmPwError').classList.remove('show');
    }
    if (!valid) return;

    fpResetBtn.classList.add('loading');
    try {
      const res  = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email:                 localStorage.getItem('fp_email'),
          reset_token:           localStorage.getItem('fp_reset_token'),
          password:              newPw,
          password_confirmation: confirmPw,
        })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('fp_reset_token');
        localStorage.removeItem('fp_email');
        showToast('✅ Password reset! Please log in with your new password.');
        setTimeout(() => showScreen('screenLogin'), 1500);
      } else {
        showToast('❌ ' + (data.message || 'Reset failed. Try again.'));
      }
    } catch { showToast('❌ Cannot reach server.'); }
    finally   { fpResetBtn.classList.remove('loading'); }
  });

}); // end DOMContentLoaded
