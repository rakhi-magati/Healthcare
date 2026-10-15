
const SPECIALTY_DOCTORS_MAP = {
  'Cardiology': [
    { id: 'dr-sarah-jenkins', name: 'Dr. Sarah Jenkins (Cardiology)' }
  ],
  'General Medicine': [
    { id: 'dr-oliver-chen', name: 'Dr. Oliver Chen (General Medicine)' }
  ],
  'Pediatrics': [
    { id: 'dr-amara-williams', name: 'Dr. Amara Williams (Pediatrics)' }
  ],
  'Orthopedics': [
    { id: 'dr-marcus-vance', name: 'Dr. Marcus Vance (Orthopedics)' }
  ],
  'Dermatology': [
    { id: 'dr-elena-rodriguez', name: 'Dr. Elena Rodriguez (Dermatology)' }
  ],
  'Dentistry': [
    { id: 'dr-arun-patel', name: 'Dr. Arun Patel (Dentistry)' }
  ],
  'Diagnostic Services': [
    { id: 'dr-hannah-abbott', name: 'Dr. Hannah Abbott (Diagnostics)' }
  ],
  'Emergency Care': [
    { id: 'dr-david-kim', name: 'Dr. David Kim (Emergency Medicine)' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('appointmentForm');
  if (form) {
    initAppointmentForm();
  }
});

function initAppointmentForm() {
  const form = document.getElementById('appointmentForm');
  const specialtySelect = document.getElementById('aptSpecialty');
  const doctorSelect = document.getElementById('aptDoctor');
  const dateInput = document.getElementById('aptDate');
  const timeSlotContainer = document.getElementById('timeSlotsGroup');
  const selectedTimeInput = document.getElementById('aptSelectedTime');

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    // default to tomorrow if empty
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Pre-fill user data if logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    const nameInput = document.getElementById('aptFullName');
    const emailInput = document.getElementById('aptEmail');
    const phoneInput = document.getElementById('aptPhone');
    if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    if (phoneInput && !phoneInput.value && currentUser.phone) phoneInput.value = currentUser.phone || '';
  }

  // Handle URL query parameters (e.g. ?doctor=dr-sarah-jenkins&specialty=Cardiology)
  const urlParams = new URLSearchParams(window.location.search);
  const paramSpecialty = urlParams.get('specialty');
  const paramDoctor = urlParams.get('doctor');

  function updateDoctorsDropdown(chosenSpecialty, preselectedDoctorId = null) {
    doctorSelect.innerHTML = '<option value="">Select a Specialist</option>';
    if (!chosenSpecialty || !SPECIALTY_DOCTORS_MAP[chosenSpecialty]) {
      // populate all doctors
      Object.keys(SPECIALTY_DOCTORS_MAP).forEach(spec => {
        SPECIALTY_DOCTORS_MAP[spec].forEach(doc => {
          const opt = document.createElement('option');
          opt.value = doc.id;
          opt.textContent = doc.name;
          doctorSelect.appendChild(opt);
        });
      });
    } else {
      SPECIALTY_DOCTORS_MAP[chosenSpecialty].forEach(doc => {
        const opt = document.createElement('option');
        opt.value = doc.id;
        opt.textContent = doc.name;
        doctorSelect.appendChild(opt);
      });
    }

    if (preselectedDoctorId) {
      doctorSelect.value = preselectedDoctorId;
    }
  }

  if (paramSpecialty) {
    specialtySelect.value = paramSpecialty;
    updateDoctorsDropdown(paramSpecialty, paramDoctor);
  } else {
    updateDoctorsDropdown('', paramDoctor);
  }

  specialtySelect.addEventListener('change', () => {
    updateDoctorsDropdown(specialtySelect.value);
  });

  // Time slot selection pills
  if (timeSlotContainer) {
    const slotPills = timeSlotContainer.querySelectorAll('.time-slot-pill');
    slotPills.forEach(pill => {
      pill.addEventListener('click', () => {
        slotPills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        selectedTimeInput.value = pill.getAttribute('data-time');
        clearError('aptTimeError');
      });
    });
  }

  // Live input error clearing
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errEl = document.getElementById(`${input.id}Error`);
      if (errEl) errEl.classList.remove('show');
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateAppointmentForm()) {
      processAppointmentSubmission();
    }
  });
}

function validateAppointmentForm() {
  let isValid = true;

  const nameInput = document.getElementById('aptFullName');
  const emailInput = document.getElementById('aptEmail');
  const phoneInput = document.getElementById('aptPhone');
  const specialtySelect = document.getElementById('aptSpecialty');
  const doctorSelect = document.getElementById('aptDoctor');
  const dateInput = document.getElementById('aptDate');
  const timeInput = document.getElementById('aptSelectedTime');
  const reasonInput = document.getElementById('aptReason');

  // Name validation
  if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
    showInputError(nameInput, 'aptFullNameError', 'Please enter your full legal name.');
    isValid = false;
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
    showInputError(emailInput, 'aptEmailError', 'Please enter a valid email address.');
    isValid = false;
  }

  // Phone validation
  const phonePattern = /^[\d\s\-\+\(\)]{8,16}$/;
  if (!phoneInput.value.trim() || !phonePattern.test(phoneInput.value.trim())) {
    showInputError(phoneInput, 'aptPhoneError', 'Please provide a valid contact phone number.');
    isValid = false;
  }

  // Specialty
  if (!specialtySelect.value) {
    showInputError(specialtySelect, 'aptSpecialtyError', 'Please select a medical department.');
    isValid = false;
  }

  // Doctor
  if (!doctorSelect.value) {
    showInputError(doctorSelect, 'aptDoctorError', 'Please choose an available doctor.');
    isValid = false;
  }

  // Date
  if (!dateInput.value) {
    showInputError(dateInput, 'aptDateError', 'Please pick a preferred appointment date.');
    isValid = false;
  }

  // Time slot
  if (!timeInput.value) {
    const err = document.getElementById('aptTimeError');
    if (err) {
      err.textContent = 'Please select a preferred time slot.';
      err.classList.add('show');
    }
    isValid = false;
  }

  // Reason
  if (!reasonInput.value.trim() || reasonInput.value.trim().length < 5) {
    showInputError(reasonInput, 'aptReasonError', 'Please briefly describe the reason for your visit (min 5 characters).');
    isValid = false;
  }

  return isValid;
}

function showInputError(inputEl, errorId, message) {
  inputEl.classList.add('error');
  const errEl = document.getElementById(errorId);
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add('show');
  }
}

function clearError(errorId) {
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.classList.remove('show');
}

function processAppointmentSubmission() {
  const name = document.getElementById('aptFullName').value.trim();
  const email = document.getElementById('aptEmail').value.trim();
  const phone = document.getElementById('aptPhone').value.trim();
  const specialty = document.getElementById('aptSpecialty').value;
  const doctorSelect = document.getElementById('aptDoctor');
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
  const date = document.getElementById('aptDate').value;
  const time = document.getElementById('aptSelectedTime').value;
  const reason = document.getElementById('aptReason').value.trim();

  const refNumber = 'APT-' + Math.floor(100000 + Math.random() * 900000);

  const newAppointment = {
    id: refNumber,
    patientName: name,
    email: email,
    phone: phone,
    specialty: specialty,
    doctor: doctorName,
    date: date,
    time: time,
    reason: reason,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  // Persist to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('auracare_appointments') || '[]');
    existing.unshift(newAppointment);
    localStorage.setItem('auracare_appointments', JSON.stringify(existing));
  } catch (err) {
    console.error('Storage error:', err);
  }

  // Show Confirmation Modal
  openConfirmationModal(newAppointment);

  // Reset Form
  document.getElementById('appointmentForm').reset();
  document.querySelectorAll('.time-slot-pill').forEach(p => p.classList.remove('selected'));
  document.getElementById('aptSelectedTime').value = '';
}

function openConfirmationModal(apt) {
  let modalOverlay = document.getElementById('appointmentSuccessModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'appointmentSuccessModal';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card" style="max-width: 580px; text-align: left;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 68px; height: 68px; background: var(--accent-light); color: var(--accent-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="font-size: 1.6rem; color: var(--text-main); margin-bottom: 6px;">Appointment Confirmed!</h2>
        <p style="color: var(--text-muted); font-size: 0.92rem;">Your booking request has been successfully processed.</p>
        <span style="display: inline-block; background: var(--primary-50); color: var(--primary); font-weight: 700; padding: 4px 14px; border-radius: var(--radius-full); font-size: 0.85rem; margin-top: 10px;">
          Reference #${apt.id}
        </span>
      </div>

      <div style="background: var(--bg-alt); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px; font-size: 0.92rem; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Specialist Doctor:</span>
          <strong>${escapeHtml(apt.doctor)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Department:</span>
          <span>${escapeHtml(apt.specialty)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Appointment Date:</span>
          <strong>${escapeHtml(apt.date)} at ${escapeHtml(apt.time)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Patient Name:</span>
          <span>${escapeHtml(apt.patientName)}</span>
        </div>
      </div>

      <div class="demo-disclaimer" style="margin-bottom: 24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <strong>Frontend Demonstration:</strong> This appointment is recorded in your browser session and visible on the <a href="dashboard.html" style="text-decoration: underline; font-weight: 600;">Patient Dashboard</a>. No actual healthcare provider has been booked.
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" class="btn btn-outline" id="closeConfirmationModalBtn">Done</button>
        <a href="dashboard.html" class="btn btn-primary">View in Dashboard</a>
      </div>
    </div>
  `;

  modalOverlay.classList.add('open');

  const closeBtn = document.getElementById('closeConfirmationModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
  }
}
