/**
 * AuraCare Health - Client-Side Authentication Engine (Demo)
 * Manages demo registrations, login validation, session persistence,
 * password strength evaluation, and redirect guards.
 */

// Default Demo User Account
const DEFAULT_DEMO_USER = {
  name: 'Eleanor Vance',
  email: 'demo@carepulse.com',
  password: 'Password123!',
  phone: '+1 (555) 234-5678',
  dob: '1988-06-14',
  bloodGroup: 'O+',
  allergies: 'Penicillin',
  joinedDate: 'Jan 2024'
};

document.addEventListener('DOMContentLoaded', () => {
  initAuthGuards();
  initLoginForm();
  initRegisterForm();
  initDemoAutofill();
  initPasswordToggles();
});

/* Redirect if already logged in */
function initAuthGuards() {
  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
  if (isAuthPage) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      window.location.href = 'dashboard.html';
    }
  }
}

/* Quick Demo Autofill Button */
function initDemoAutofill() {
  const fillBtn = document.getElementById('btnAutofillDemo');
  if (fillBtn) {
    fillBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput && passInput) {
        emailInput.value = DEFAULT_DEMO_USER.email;
        passInput.value = DEFAULT_DEMO_USER.password;
        emailInput.classList.remove('error');
        passInput.classList.remove('error');
        const err = document.getElementById('loginAuthError');
        if (err) err.classList.remove('show');
        showToast('Demo credentials filled! Click Log In to continue.', 'info', 2500);
      }
    });
  }
}

/* Password Visibility Toggles */
function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInputId = btn.getAttribute('data-target');
      const input = document.getElementById(targetInputId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      }
    });
  });
}

/* Login Form Logic */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('rememberMe');
  const authError = document.getElementById('loginAuthError');


  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    if (!emailInput.value.trim()) {
      emailInput.classList.add('error');
      valid = false;
    }
    if (!passInput.value) {
      passInput.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    // Check credentials against demo user or registered users in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('auracare_users') || '[]');
    let matchedUser = null;

    if (email === DEFAULT_DEMO_USER.email.toLowerCase() && password === DEFAULT_DEMO_USER.password) {
      matchedUser = DEFAULT_DEMO_USER;
    } else {
      matchedUser = storedUsers.find(u => u.email.toLowerCase() === email && u.password === password);
    }

    if (matchedUser) {
      // Save session
      const sessionData = {
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone || '',
        bloodGroup: matchedUser.bloodGroup || 'O+',
        allergies: matchedUser.allergies || 'None',
        loginTime: new Date().toISOString()
      };

      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('auracare_session', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('auracare_session', JSON.stringify(sessionData));
      }

      showToast(`Welcome back, ${matchedUser.name}!`, 'success', 2500);

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } else {
      if (authError) {
        authError.textContent = 'Invalid email or password. You can use the quick demo credentials above.';
        authError.classList.add('show');
      }
      showToast('Authentication failed. Check your credentials.', 'error');
    }
  });

  // Forgot password modal
  const forgotLink = document.getElementById('forgotPasswordLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Demo Password Reset:\n\nFor testing, you can use the default demo credentials:\nEmail: demo@carepulse.com\nPassword: Password123!');
    });
  }
}

/* Register Form Logic */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const phoneInput = document.getElementById('regPhone');
  const passInput = document.getElementById('regPassword');
  const confirmPassInput = document.getElementById('regConfirmPassword');
  const termsCheckbox = document.getElementById('regTerms');
  const strengthFill = document.getElementById('strengthBarFill');
  const strengthText = document.getElementById('strengthText');

  // Password strength evaluator
  if (passInput && strengthFill && strengthText) {
    passInput.addEventListener('input', () => {
      const val = passInput.value;
      const score = evaluatePasswordStrength(val);

      strengthFill.className = 'strength-bar-fill';
      if (!val) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength';
        strengthText.style.color = 'var(--text-muted)';
      } else if (score < 2) {
        strengthFill.classList.add('strength-weak');
        strengthText.textContent = getPasswordRequirementMessage();
        strengthText.style.color = 'var(--danger)';
      } else if (score === 2 || score === 3) {
        strengthFill.classList.add('strength-medium');
        strengthText.textContent = 'Almost there - add the missing password requirements.';
        strengthText.style.color = 'var(--warning)';
      } else {
        strengthFill.classList.add('strength-strong');
        strengthText.textContent = 'Strong password - all requirements met.';
        strengthText.style.color = 'var(--accent)';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showInputError(nameInput, 'regNameError', 'Please enter your full name.');
      isValid = false;
    }

    // Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      showInputError(emailInput, 'regEmailError', 'Please enter a valid email address.');
      isValid = false;
    }

    // Phone
    const phonePattern = /^[\d\s\-\+\(\)]{8,16}$/;
    if (!phoneInput.value.trim() || !phonePattern.test(phoneInput.value.trim())) {
      showInputError(phoneInput, 'regPhoneError', 'Please enter a valid phone number.');
      isValid = false;
    }

    // Password: at least 8 characters, one uppercase letter, one number, and one special character.
    if (!isStrongPassword(passInput.value)) {
      showInputError(passInput, 'regPasswordError', getPasswordRequirementMessage());
      isValid = false;
    }

    // Confirm password
    if (passInput.value !== confirmPassInput.value) {
      showInputError(confirmPassInput, 'regConfirmPasswordError', 'Passwords do not match.');
      isValid = false;
    }

    // Terms
    if (!termsCheckbox.checked) {
      const termsError = document.getElementById('regTermsError');
      if (termsError) {
        termsError.textContent = 'You must agree to the Terms & Privacy Policy.';
        termsError.classList.add('show');
      }
      isValid = false;
    }

    if (!isValid) return;

    // Check if email already registered
    const storedUsers = JSON.parse(localStorage.getItem('auracare_users') || '[]');
    const existing = storedUsers.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase());
    if (existing || emailInput.value.trim().toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase()) {
      showInputError(emailInput, 'regEmailError', 'An account with this email already exists. Try logging in.');
      return;
    }

    // Create user object
    const newUser = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      phone: phoneInput.value.trim(),
      password: passInput.value,
      bloodGroup: 'A+',
      allergies: 'None reported',
      registeredAt: new Date().toISOString()
    };

    storedUsers.push(newUser);
    localStorage.setItem('auracare_users', JSON.stringify(storedUsers));

    showToast('Account registered successfully! Please sign in.', 'success', 2500);

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  });
}

function isStrongPassword(pass) {
  return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass);
}

function getPasswordRequirementMessage() {
  return 'Use at least 8 characters, including one uppercase letter, one number, and one special character.';
}

function evaluatePasswordStrength(pass) {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}
