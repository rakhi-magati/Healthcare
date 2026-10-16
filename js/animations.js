/* Stackly Motion Layer */
(() => {
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const mk = (tag, attrs = {}, html = '') => Object.assign(document.createElement(tag), attrs, { innerHTML: html });

  /* Loader (ECG heartbeat) */
  const loader = mk('div', { id: 'loader' },
    '<div class="ld"><svg viewBox="0 0 260 70"><path d="M0 35h70l12-26 18 52 14-40 10 14h136"/></svg>STACKLY</div>');
  document.body.prepend(loader);
  const hide = () => setTimeout(() => loader.classList.add('done'), 500);
  document.readyState === 'complete' ? hide() : addEventListener('load', hide);
  setTimeout(hide, 3000);

  /* Scroll progress, back-to-top, smart header */
  const bar = mk('div', { id: 'progress' });
  const C = 2 * Math.PI * 24;
  const top = mk('button', { id: 'toTop', ariaLabel: 'Back to top' },
    `<svg class="ring" viewBox="0 0 52 52"><circle class="bg" cx="26" cy="26" r="24"/><circle class="fg" cx="26" cy="26" r="24" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`);
  document.body.append(bar, top);
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  const header = document.querySelector('.site-header');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? y / max : 0;
    bar.style.width = p * 100 + '%';
    top.querySelector('.fg').style.strokeDashoffset = C * (1 - p);
    top.classList.toggle('show', y > 500);
    if (header) header.classList.toggle('hide', y > lastY && y > 300);
    lastY = y;
    const g = document.querySelector('.hero-glow-1');
    if (g && !reduce) g.style.translate = `0 ${y * 0.15}px`;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* Cursor glow + dot + magnetic buttons */
  if (fine && !reduce) {
    const glow = mk('div', { id: 'cursorGlow' }), dot = mk('div', { id: 'cursorDot' });
    document.body.append(glow, dot);
    let x = 0, y = 0, gx = 0, gy = 0;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
    (function loop() { gx += (x - gx) * .12; gy += (y - gy) * .12; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); })();
    $('a,button,.btn,.tilt,input,select,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('big'));
      el.addEventListener('mouseleave', () => dot.classList.remove('big'));
    });
    $('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28 - 3}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* Button ripple */
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const rp = mk('span', { className: 'ripple' });
    rp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(rp); setTimeout(() => rp.remove(), 700);
  });

  /* 3D tilt + spotlight on cards */
  const cards = '.service-card,.doctor-card,.testimonial-card,.step-card,.feature-item,.stat-item,.hero-main-card';
  $(cards).forEach(c => {
    c.classList.add('tilt');
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
      if (fine && !reduce) c.style.transform = `perspective(900px) rotateX(${(.5 - py) * 10}deg) rotateY(${(px - .5) * 12}deg) translateY(-8px) scale(1.02)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });

  /* Auto stagger + reveal variants (works with existing .reveal observer) */
  const stagger = sel => $(sel).forEach(grid => [...grid.children].forEach((ch, i) => {
    if (!ch.classList.contains('reveal')) ch.classList.add('reveal', 'zoom');
    ch.style.transitionDelay = i * 0.12 + 's';
  }));
  stagger('.services-grid,.doctors-grid,.stats-grid,.testimonials-grid,.steps-grid,.features-list');
  $('.hero-content').forEach(el => el.classList.add('from-left'));
  $('.hero-visual-wrapper').forEach(el => el.classList.add('from-right'));
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('visible'), io.unobserve(e.target))), { threshold: .12 });
  $('.reveal,.section-header,.section-title').forEach(el => io.observe(el));

  /* Hero: floating symbols + ECG line */
  const hero = document.querySelector('.hero');
  if (hero && !reduce) {
    const f = mk('div', { className: 'floaters' });
    const sy = ['+', '✚', '♥', '⚕', '💊', '✚', '+', '♥'];
    for (let i = 0; i < 16; i++) {
      const s = mk('span', { className: 'floater' }, sy[i % sy.length]);
      s.style.cssText = `left:${Math.random() * 100}%;font-size:${16 + Math.random() * 34}px;animation-duration:${14 + Math.random() * 16}s;animation-delay:-${Math.random() * 20}s`;
      f.appendChild(s);
    }
    hero.prepend(f);
    hero.insertAdjacentHTML('beforeend', '<svg class="ecg-strip" viewBox="0 0 1600 60" preserveAspectRatio="none"><path d="M0 30h300l20-24 25 48 20-40 15 16h420l20-24 25 48 20-40 15 16h740"/></svg>');
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      $('.floating-badge', hero).forEach((b, i) => b.style.translate = `${dx * (20 + i * 12)}px ${dy * (20 + i * 12)}px`);
    });
  }

  /* Success confetti + toast on any form submit */
  const toast = mk('div', { id: 'toastX' }, '<i>✓</i><span></span>');
  document.body.appendChild(toast);
  window.celebrate = (msg = 'Success! 🎉') => {
    toast.querySelector('span').textContent = msg;
    toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200);
    if (reduce) return;
    const cols = ['#10b981', '#0ea5e9', '#0a6c74', '#f59e0b', '#ef4444', '#a78bfa'];
    for (let i = 0; i < 120; i++) {
      const c = mk('div', { className: 'confetti' });
      c.style.background = cols[i % cols.length];
      if (i % 3 === 0) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 12;
      let px = innerWidth / 2, py = innerHeight / 3, vx = Math.cos(a) * v, vy = Math.sin(a) * v - 6, rot = 0, t = 0;
      (function step() {
        vy += .35; vx *= .99; px += vx; py += vy; rot += vx * 2; t++;
        c.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`;
        c.style.opacity = Math.max(0, 1 - t / 130);
        t < 130 ? requestAnimationFrame(step) : c.remove();
      })();
    }
  };
  document.addEventListener('submit', e => {
    const f = e.target;
    setTimeout(() => {
      if (f.checkValidity && !f.checkValidity()) return;
      const m = f.id && /appoint|book/i.test(f.id) ? 'Appointment booked! 🩺' : /login/i.test(f.id) ? 'Welcome back! 👋' : /regist/i.test(f.id) ? 'Account created! 🎉' : 'Message sent successfully! 💚';
      celebrate(m);
    }, 50);
  });

  onScroll();
})();
