/**
 * AuraCare Health - Core Client JavaScript
 * Handles Global Navigation, Scroll Animations, Animated Counters,
 * Session State & Toast Notification Engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initCounterAnimations();
  initSessionNav();
  initFooterSocialLinks();
  initToastsContainer();
  initScrollToTop();
});

/* --- Mobile & Sticky Navigation --- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  // Sticky header on scroll
  if (header) {
    const handleHeaderScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // Mobile menu toggle
  if (toggle && mobileNav) {
    const setMobileMenuState = (isOpen) => {
      mobileNav.classList.toggle('open', isOpen);
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('mobile-menu-open', isOpen);
    };

    toggle.addEventListener('click', () => {
      setMobileMenuState(!mobileNav.classList.contains('open'));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMobileMenuState(false));
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        setMobileMenuState(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setMobileMenuState(false);
      }
    });
  }

  // Highlight active page link cleanly
  const rawPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentPath = rawPath.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-nav .nav-link');
  
  if (navLinks.length > 0) {
    let matched = false;
    navLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href === currentPath || ((currentPath === '' || currentPath === 'index.html') && href === 'index.html')) {
        link.classList.add('active');
        matched = true;
      } else {
        link.classList.remove('active');
      }
    });
    if (!matched && (currentPath === '' || currentPath === 'index.html')) {
      document.querySelectorAll('.nav-link[href="index.html"]').forEach(l => l.classList.add('active'));
    }
  }
}

/* --- Scroll To Top (Up Arrow) Floating Action Button --- */
function initScrollToTop() {
  let scrollBtn = document.getElementById('scrollToTopBtn');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.type = 'button';
    scrollBtn.id = 'scrollToTopBtn';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.setAttribute('title', 'Scroll to top');
    scrollBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    `;
    document.body.appendChild(scrollBtn);
  }

  const toggleScrollBtn = () => {
    if (window.scrollY > 280) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleScrollBtn, { passive: true });
  toggleScrollBtn();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --- Scroll Reveal Animations --- */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --- Animated Statistics Counter --- */
function initCounterAnimations() {
  const counterElements = document.querySelectorAll('[data-counter]');
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-counter'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const isDecimal = target % 1 !== 0;
        const duration = 1800; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuad
          const easeProgress = 1 - (1 - progress) * (1 - progress);
          const currentVal = target * easeProgress;

          if (isDecimal) {
            el.textContent = `${prefix}${currentVal.toFixed(1)}${suffix}`;
          } else {
            el.textContent = `${prefix}${Math.floor(currentVal).toLocaleString()}${suffix}`;
          }

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            if (isDecimal) {
              el.textContent = `${prefix}${target.toFixed(1)}${suffix}`;
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => observer.observe(el));
}

/* --- Global Session Navigation State --- */
function initSessionNav() {
  const currentUser = getCurrentUser();
  const authNavElements = document.querySelectorAll('.auth-nav');
  const mobileNavActions = document.querySelectorAll('.mobile-nav-actions');

  if (currentUser) {
    // User is logged in
    authNavElements.forEach(container => {
      container.innerHTML = `
        <a href="dashboard.html" class="user-profile-btn" title="View Patient Portal">
          <span class="user-avatar-small">${currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}</span>
          <span>${escapeHtml(currentUser.name || 'Patient')}</span>
        </a>
        <button type="button" class="btn-logout-small header-logout-btn" id="headerLogoutBtn" title="Logout">
          Logout
        </button>
      `;
    });

    mobileNavActions.forEach(container => {
      container.innerHTML = `
        <a href="dashboard.html" class="btn btn-secondary btn-sm" style="width:100%">Patient Dashboard</a>
        <button type="button" class="btn btn-outline btn-sm mobile-logout-btn" style="width:100%">Logout</button>
      `;
    });

    // Attach logout handlers
    document.querySelectorAll('.header-logout-btn, #headerLogoutBtn, .mobile-logout-btn').forEach(btn => {
      btn.addEventListener('click', handleLogout);
    });
  } else {
    // User is logged out
    authNavElements.forEach(container => {
      container.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
        <a href="register.html" class="btn btn-secondary btn-sm">Register</a>
      `;
    });
    mobileNavActions.forEach(container => {
      container.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm" style="width:100%">Log In</a>
        <a href="register.html" class="btn btn-secondary btn-sm" style="width:100%">Register</a>
        <a href="appointments.html" class="btn btn-primary btn-sm" style="width:100%">Book Appointment</a>
      `;
    });
  }
}

/* --- Footer Social Links --- */
function initFooterSocialLinks() {
  const icons = {
    Facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
    Twitter: '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>',
    LinkedIn: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
    Instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>'
  };
  const socialMarkup = `<div class="social-links" aria-label="Social media links">${Object.entries(icons).map(([name, icon]) => `<a href="404.html" class="social-btn" aria-label="${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg></a>`).join('')}</div>`;

  document.querySelectorAll('.site-footer .footer-brand, .dashboard-footer').forEach(footerBrand => {
    const socialLinks = footerBrand.querySelector('.social-links');
    if (socialLinks) {
      socialLinks.querySelectorAll('.social-btn').forEach(link => link.setAttribute('href', '404.html'));
    } else {
      footerBrand.insertAdjacentHTML('beforeend', socialMarkup);
    }
  });
}
/* --- Global Toast Notifications --- */
function initToastsContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    initToastsContainer();
    container = document.querySelector('.toast-container');
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

/* --- Session & Storage Helpers --- */
function getCurrentUser() {
  try {
    const session = sessionStorage.getItem('auracare_session');
    if (session) return JSON.parse(session);
    const localSession = localStorage.getItem('auracare_session');
    if (localSession) return JSON.parse(localSession);
  } catch (e) {
    console.error('Error reading session data', e);
  }
  return null;
}

function handleLogout() {
  sessionStorage.removeItem('auracare_session');
  localStorage.removeItem('auracare_session');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
