/* Stackly Hospital Dashboard */
const $ = id => document.getElementById(id);
document.addEventListener('DOMContentLoaded', () => {
  let user = null;
  try { user = typeof getCurrentUser === 'function' ? getCurrentUser() : null; } catch (e) {}
  if (!user) { alert('Please log in to access your Dashboard.'); location.href = 'login.html'; return; }
  $('dashWelcomeName').textContent = user.name || 'Guest';
  $('dashUserAvatar').textContent = (user.name || 'P').charAt(0).toUpperCase();

  $('dashLogoutBtn').onclick = () => { if (typeof handleLogout === 'function') handleLogout(); else { localStorage.removeItem('auracare_session'); sessionStorage.removeItem('auracare_session'); location.href = 'index.html'; } };
  $('dxBurger').onclick = () => $('dxSide').classList.toggle('open');
  document.addEventListener('click', e => { if (!e.target.closest('#dxSide,#dxBurger')) $('dxSide').classList.remove('open'); });

  /* Clock */
  const tick = () => { const d = new Date(); $('dxClock').textContent = d.toLocaleTimeString(); $('dxDate').textContent = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' · Hospital operations overview'; };
  tick(); setInterval(tick, 1000);

  /* Count-up */
  document.querySelectorAll('[data-to]').forEach(el => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0), p = el.dataset.prefix || '', s = el.dataset.suffix || '', t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(1 - k, 3); el.textContent = p + (to * e).toFixed(dec) + s; if (k < 1) requestAnimationFrame(f); })(t0);
  });

  /* Progress bars */
  setTimeout(() => document.querySelectorAll('.bar span').forEach(b => b.style.width = b.dataset.w * 2 + '%'), 600);

  /* Line chart */
  const data = [820, 940, 760, 1180, 1320, 1500], mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const W = 700, H = 280, pad = 40, max = 1600, min = 600;
  const X = i => pad + i * (W - pad * 1.5) / 5, Y = v => H - 30 - (v - min) / (max - min) * (H - 60);
  let svg = '';
  for (let g = 0; g <= 4; g++) { const v = min + g * 250, y = Y(v); svg += `<line x1="${pad}" x2="${W - 10}" y1="${y}" y2="${y}" stroke="#e2e8f0"/><text x="4" y="${y + 4}" font-size="11" fill="#94a3b8">${v}</text>`; }
  mon.forEach((m, i) => svg += `<text x="${X(i) - 10}" y="${H - 6}" font-size="11" fill="#94a3b8">${m}</text>`);
  const pts = data.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  svg += `<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10b981" stop-opacity=".35"/><stop offset="1" stop-color="#10b981" stop-opacity="0"/></linearGradient></defs>`;
  svg += `<polygon class="area" fill="url(#ga)" points="${X(0)},${H - 30} ${pts} ${X(5)},${H - 30}"/><polyline class="line" points="${pts}"/>`;
  data.forEach((v, i) => svg += `<circle cx="${X(i)}" cy="${Y(v)}" r="6" style="animation-delay:${0.6 + i * .3}s"><title>${mon[i]}: ${v} patients</title></circle>`);
  $('lineChart').innerHTML = svg;

  /* Donut */
  const parts = [[112, '#10b981'], [26, '#f59e0b'], [42, '#ef4444']], R = 60, C = 2 * Math.PI * R; let off = 0, dsv = '';
  parts.forEach(([v, c], i) => { const len = v / 180 * C; dsv += `<circle cx="80" cy="80" r="${R}" stroke="${c}" stroke-dasharray="0 ${C}" stroke-dashoffset="${-off}" data-len="${len}" data-gap="${C}" style="transition:stroke-dasharray 1.4s ${i * .3}s ease"/>`; off += len; });
  $('donut').innerHTML = dsv;
  setTimeout(() => $('donut').querySelectorAll('circle').forEach(c => c.setAttribute('stroke-dasharray', `${c.dataset.len - 2} ${c.dataset.gap}`)), 500);

  /* Live activity feed */
  const ev = [['📅', 'New appointment booked', 'Cardiology · Dr. Chen'], ['🛏️', 'Bed assigned', 'Ward B · Room 204'], ['🧪', 'Lab results ready', 'Patient #48213'], ['🚑', 'Emergency admitted', 'Trauma Unit'], ['💊', 'Pharmacy order dispatched', 'Order #9912'], ['✅', 'Patient discharged', 'Ward A · Room 110'], ['🧾', 'Insurance claim approved', 'Claim #3305']];
  let n = 0;
  const addEv = () => { const [i, t, s] = ev[n++ % ev.length], li = document.createElement('li'); li.innerHTML = `<i>${i}</i><div><b>${t}</b><small>${s} · just now</small></div>`; $('feed').prepend(li); while ($('feed').children.length > 4) $('feed').lastChild.remove(); };
  for (let k = 0; k < 4; k++) addEv();
  setInterval(addEv, 4000);

  /* Live beds */
  setInterval(() => { const el = $('bedsLive'); let v = parseInt(el.textContent) + (Math.random() > .5 ? 1 : -1); v = Math.max(30, Math.min(55, v)); el.textContent = v; }, 5000);

  /* ECG monitor */
  const cv = $('ecg'), ctx = cv.getContext('2d'); let x = 0, last = 0, ph = 0;
  const fit = () => { cv.width = cv.clientWidth; ctx.fillStyle = '#04202a'; ctx.fillRect(0, 0, cv.width, cv.height); }; fit(); addEventListener('resize', fit);
  const wave = t => t < .1 ? Math.sin(t / .1 * Math.PI) * 8 : t < .18 ? 0 : t < .2 ? -10 : t < .24 ? 46 : t < .28 ? -18 : t < .4 ? 0 : t < .55 ? Math.sin((t - .4) / .15 * Math.PI) * 12 : 0;
  (function draw() {
    const h = cv.height, y = h * .65 - wave(ph % 1);
    ctx.fillStyle = '#04202a'; ctx.fillRect(x, 0, 14, h);
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.4; ctx.shadowColor = '#34d399'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(x - 2, last || y); ctx.lineTo(x, y); ctx.stroke(); ctx.shadowBlur = 0;
    last = y; x += 2; ph += .012; if (x > cv.width) { x = 0; last = 0; }
    requestAnimationFrame(draw);
  })();
  setInterval(() => { $('hr').textContent = 68 + Math.floor(Math.random() * 10); $('spo').textContent = 97 + Math.floor(Math.random() * 3); }, 2000);
});

/* ===== In-page sidebar tabs (no navigation, so no 404) ===== */
document.addEventListener('DOMContentLoaded', () => {
  const pill = s => `<span class="dx-pill ${/confirm|paid|stable|on duty|active/i.test(s) ? 'ok' : /pending|due|observ|break/i.test(s) ? 'wait' : 'bad'}">${s}</span>`;
  const table = (heads, rows) => `<div class="dx-card dx-scroll"><table class="dx-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr style="animation-delay:${i * .06}s">${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const cards = items => `<div class="dx-cards">${items.map((c, i) => `<div class="dx-mini" style="animation-delay:${i * .07}s"><div class="em">${c[0]}</div><h4>${c[1]}</h4><p>${c[2]}</p>${c[3]}</div>`).join('')}</div>`;
  const V = {
    appointments: ['Appointments', 'Today’s schedule across all departments', () => table(['Patient', 'Doctor', 'Department', 'Time', 'Status'], [
      ['Ravi Kumar', 'Dr. Sarah Chen', 'Cardiology', '10:30 AM', pill('Confirmed')], ['Anita Rao', 'Dr. Michael Ross', 'Neurology', '12:00 PM', pill('Pending')],
      ['Karan Mehta', 'Dr. Priya Nair', 'Pediatrics', '02:15 PM', pill('Confirmed')], ['Sneha Iyer', 'Dr. James Cole', 'Orthopedics', '04:00 PM', pill('Confirmed')],
      ['Arjun Das', 'Dr. Sarah Chen', 'Cardiology', '05:30 PM', pill('Pending')]])],
    doctors: ['Doctors', 'Specialists currently on the roster', () => cards([
      ['👩‍⚕️', 'Dr. Sarah Chen', 'Cardiology · 12 yrs', pill('On Duty')], ['👨‍⚕️', 'Dr. Michael Ross', 'Neurology · 15 yrs', pill('On Duty')],
      ['👩‍⚕️', 'Dr. Priya Nair', 'Pediatrics · 9 yrs', pill('On Break')], ['👨‍⚕️', 'Dr. James Cole', 'Orthopedics · 11 yrs', pill('On Duty')],
      ['👩‍⚕️', 'Dr. Meera Shah', 'Dermatology · 8 yrs', pill('On Duty')], ['👨‍⚕️', 'Dr. Omar Khan', 'Emergency · 14 yrs', pill('On Duty')]])],
    departments: ['Departments', 'Live bed load per department', () => cards([['❤️', 'Cardiology', '38 / 45 beds', 38, 45], ['🧠', 'Neurology', '24 / 30 beds', 24, 30], ['👶', 'Pediatrics', '18 / 35 beds', 18, 35], ['🦴', 'Orthopedics', '16 / 25 beds', 16, 25], ['🚑', 'Emergency', '28 / 30 beds', 28, 30], ['🧴', 'Dermatology', '6 / 15 beds', 6, 15]].map(d => [d[0], d[1], d[2], `<div class="bar"><span data-w="${Math.round(d[3] / d[4] * 50)}" style="width:${Math.round(d[3] / d[4] * 100)}%"></span></div>`]))],
    patients: ['Patients', 'Currently admitted and recent patients', () => table(['ID', 'Name', 'Age', 'Ward', 'Condition'], [
      ['P-1021', 'Ravi Kumar', 54, 'Cardiac ICU', pill('Critical')], ['P-1034', 'Anita Rao', 41, 'Neuro Ward', pill('Observation')], ['P-1048', 'Karan Mehta', 7, 'Pediatrics', pill('Stable')],
      ['P-1052', 'Sneha Iyer', 33, 'Ortho Ward', pill('Stable')], ['P-1067', 'Arjun Das', 62, 'General', pill('Observation')]])],
    billing: ['Billing & Insurance', 'Invoices and claim status', () => `<div class="dx-chips"><div class="dx-chip s1">Collected<b>$1.2M</b></div><div class="dx-chip s4">Pending<b>$214K</b></div><div class="dx-chip s3">Claims Approved<b>92%</b></div></div>` + table(['Invoice', 'Patient', 'Amount', 'Insurance', 'Status'], [
      ['INV-3301', 'Ravi Kumar', '$4,200', 'Star Health', pill('Paid')], ['INV-3302', 'Anita Rao', '$1,850', 'HDFC Ergo', pill('Pending')], ['INV-3303', 'Karan Mehta', '$620', 'Self-pay', pill('Paid')], ['INV-3304', 'Arjun Das', '$3,100', 'Care Health', pill('Due')]])],
    reports: ['Reports', 'Weekly admissions overview', () => `<div class="dx-card"><div class="dx-ch"><h3>Admissions this week</h3></div><div class="dx-cols">${[['Mon', 60], ['Tue', 82], ['Wed', 55], ['Thu', 95], ['Fri', 72], ['Sat', 40], ['Sun', 30]].map(d => `<div data-h="${d[1]}"><span>${d[0]}</span></div>`).join('')}</div><br></div>`],
    support: ['Support', 'Reach the hospital help desk', () => `<div class="dx-card"><div class="dx-cards" style="margin:0 0 18px"><div class="dx-mini"><div class="em">📞</div><h4>+1 (800) 555-CARE</h4><p>24/7 emergency line</p></div><div class="dx-mini"><div class="em">✉️</div><h4>help@stackly.health</h4><p>Replies within 2 hours</p></div></div><form class="dx-form" id="supForm"><input required placeholder="Your name"><textarea required rows="4" placeholder="How can we help?"></textarea><button>Send Message</button></form></div>`]
  };
  const dash = document.getElementById('tab-dashboard'), other = document.getElementById('tab-other'), links = document.querySelectorAll('.dx-nav a');
  function show(k) {
    if (!k || (k !== 'dashboard' && !V[k])) k = 'dashboard';
    links.forEach(a => a.classList.toggle('active', a.dataset.tab === k));
    document.getElementById('dxSide').classList.remove('open');
    scrollTo({ top: 0, behavior: 'smooth' });
    if (k === 'dashboard') { other.hidden = true; dash.hidden = false; return; }
    const [t, s, f] = V[k];
    dash.hidden = true; other.hidden = false;
    other.innerHTML = `<h1 class="dx-ph">${t}</h1><p class="dx-sub">${s}</p>${f()}`;
    other.style.animation = 'none'; other.offsetHeight; other.style.animation = '';
    setTimeout(() => other.querySelectorAll('.dx-cols div').forEach(b => b.style.height = b.dataset.h + '%'), 100);
    const sf = document.getElementById('supForm');
    if (sf) sf.onsubmit = e => { e.preventDefault(); sf.reset(); if (window.celebrate) celebrate('Message sent successfully! 💚'); };
  }
  links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#' + a.dataset.tab); show(a.dataset.tab); }));
  show(location.hash.slice(1));
  window.scrollTo(0, 0);
});
