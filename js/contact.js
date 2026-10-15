/**
 * AuraCare Health - Contact Page Script
 * Handles contact form validation, interactive inquiry buttons,
 * FAQ accordion interactions, and simulated message submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initFaqAccordion();
});

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('contactSubmitBtn');

  // Input clearing on type
  [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('error');
        const err = document.getElementById(`${inp.id}Error`);
        if (err) err.classList.remove('show');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showContactError(nameInput, 'contactNameError', 'Please enter your full name.');
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      showContactError(emailInput, 'contactEmailError', 'Please enter a valid email address.');
      isValid = false;
    }

    // Validate Subject
    if (!subjectInput.value.trim()) {
      showContactError(subjectInput, 'contactSubjectError', 'Please choose or type a subject.');
      isValid = false;
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showContactError(messageInput, 'contactMessageError', 'Please include a message with at least 10 characters.');
      isValid = false;
    }

    if (!isValid) return;

    // Disable button & show sending spinner state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      Sending message...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      form.reset();

      // Show success modal or toast
      showToast('Thank you! Your message has been received. Our healthcare team will respond shortly.', 'success', 6000);

      const statusBox = document.getElementById('contactStatusBox');
      if (statusBox) {
        statusBox.innerHTML = `
          <div style="background: var(--accent-light); color: var(--accent-dark); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; gap: 10px; margin-top: 16px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <div>
              <strong>Message Sent Successfully!</strong> We have received your inquiry. (Demo response).
            </div>
          </div>
        `;
        setTimeout(() => {
          statusBox.innerHTML = '';
        }, 8000);
      }
    }, 1000);
  });
}

function showContactError(inputEl, errorId, message) {
  inputEl.classList.add('error');
  const errEl = document.getElementById(errorId);
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add('show');
  }
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(f => f.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}
