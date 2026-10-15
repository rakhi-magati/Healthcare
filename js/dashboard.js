/**
 * AuraCare Health - Patient Dashboard Logic
 * Guards session, computes real-time patient metrics,
 * loads upcoming & completed appointments, and handles cancellations.
 */

// Initial Seed Demo Appointments if none exist
const DEFAULT_DEMO_APPOINTMENTS = [
  {
    id: 'APT-839102',
    patientName: 'Eleanor Vance',
    doctor: 'Dr. Sarah Jenkins (Cardiology)',
    specialty: 'Cardiology',
    date: '2026-10-24',
    time: '10:00 AM - 10:30 AM',
    reason: 'Annual cardiovascular risk screening & ECG review',
    status: 'Confirmed'
  },
  {
    id: 'APT-712490',
    patientName: 'Eleanor Vance',
    doctor: 'Dr. Arun Patel (Dentistry)',
    specialty: 'Dentistry',
    date: '2026-11-05',
    time: '02:00 PM - 02:30 PM',
    reason: 'Routine dental clean and ultrasonic plaque scaling',
    status: 'Confirmed'
  },
  {
    id: 'APT-492104',
    patientName: 'Eleanor Vance',
    doctor: 'Dr. Oliver Chen (General Medicine)',
    specialty: 'General Medicine',
    date: '2026-09-12',
    time: '11:15 AM - 11:45 AM',
    reason: 'Comprehensive annual wellness physical exam',
    status: 'Completed'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  guardDashboardSession();
  initDashboardData();
  initDashboardEvents();
});

function guardDashboardSession() {
  const user = getCurrentUser();
  if (!user) {
    alert('Please log in with the demo account to access your Patient Dashboard.');
    window.location.href = 'login.html';
  }
}

function initDashboardData() {
  const user = getCurrentUser();
  if (!user) return;

  // Set greeting & patient profile information
  const userNameEl = document.getElementById('dashUserName');
  const userAvatarEl = document.getElementById('dashUserAvatar');
  const userWelcomeEl = document.getElementById('dashWelcomeName');
  const profileEmailEl = document.getElementById('dashProfileEmail');
  const profilePhoneEl = document.getElementById('dashProfilePhone');
  const profileBloodEl = document.getElementById('dashProfileBlood');
  const profileAllergiesEl = document.getElementById('dashProfileAllergies');

  if (userNameEl) userNameEl.textContent = user.name;
  if (userWelcomeEl) userWelcomeEl.textContent = user.name;
  if (userAvatarEl) userAvatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'P';
  if (profileEmailEl) profileEmailEl.textContent = user.email || 'demo@carepulse.com';
  if (profilePhoneEl) profilePhoneEl.textContent = user.phone || '+1 (555) 234-5678';
  if (profileBloodEl) profileBloodEl.textContent = user.bloodGroup || 'O+';
  if (profileAllergiesEl) profileAllergiesEl.textContent = user.allergies || 'Penicillin';

  renderAppointmentsList();
}

function getStoredAppointments() {
  try {
    let list = JSON.parse(localStorage.getItem('auracare_appointments'));
    if (!list || !list.length) {
      localStorage.setItem('auracare_appointments', JSON.stringify(DEFAULT_DEMO_APPOINTMENTS));
      return DEFAULT_DEMO_APPOINTMENTS;
    }
    return list;
  } catch (e) {
    return DEFAULT_DEMO_APPOINTMENTS;
  }
}

function renderAppointmentsList() {
  const appointments = getStoredAppointments();
  const listContainer = document.getElementById('dashAppointmentsList');
  const totalCountEl = document.getElementById('dashTotalAptCount');
  const upcomingCountEl = document.getElementById('dashUpcomingAptCount');
  const completedCountEl = document.getElementById('dashCompletedAptCount');

  // Compute metrics
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  if (totalCountEl) totalCountEl.textContent = totalCount;
  if (upcomingCountEl) upcomingCountEl.textContent = upcomingCount;
  if (completedCountEl) completedCountEl.textContent = completedCount;

  if (!listContainer) return;

  if (appointments.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <h4>No appointments found</h4>
        <p>You currently do not have any scheduled consultations.</p>
        <a href="appointments.html" class="btn btn-primary btn-sm" style="margin-top: 14px;">Book First Visit</a>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = appointments.map(apt => {
    // Parse date for badge
    let monthStr = 'DATE';
    let dayStr = '00';
    if (apt.date) {
      const parts = apt.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
        monthStr = d.toLocaleString('en-US', { month: 'short' });
        dayStr = parts[2];
      }
    }

    const statusClass = (apt.status || 'confirmed').toLowerCase();

    return `
      <div class="appointment-item-card" data-id="${apt.id}">
        <div class="apt-left">
          <div class="apt-date-badge">
            <div class="apt-date-month">${escapeHtml(monthStr)}</div>
            <div class="apt-date-day">${escapeHtml(dayStr)}</div>
          </div>
          <div class="apt-info">
            <h4>${escapeHtml(apt.doctor)}</h4>
            <p>${escapeHtml(apt.specialty)} • Ref #${escapeHtml(apt.id)}</p>
            <div class="apt-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${escapeHtml(apt.time)}</span>
            </div>
          </div>
        </div>

        <div class="apt-right">
          <span class="status-badge ${statusClass}">${escapeHtml(apt.status || 'Confirmed')}</span>
          ${apt.status === 'Confirmed' || apt.status === 'Pending' ? `
            <button type="button" class="btn-cancel-apt" data-id="${apt.id}" title="Cancel this appointment">
              Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Attach cancel listeners
  document.querySelectorAll('.btn-cancel-apt').forEach(btn => {
    btn.addEventListener('click', () => {
      const aptId = btn.getAttribute('data-id');
      cancelAppointment(aptId);
    });
  });
}

function cancelAppointment(aptId) {
  if (confirm(`Are you sure you want to cancel appointment ${aptId}?`)) {
    const appointments = getStoredAppointments();
    const updated = appointments.map(apt => {
      if (apt.id === aptId) {
        return { ...apt, status: 'Cancelled' };
      }
      return apt;
    });

    localStorage.setItem('auracare_appointments', JSON.stringify(updated));
    showToast(`Appointment ${aptId} has been cancelled.`, 'info');
    renderAppointmentsList();
  }
}

function initDashboardEvents() {
  // Logout button
  const logoutBtn = document.getElementById('dashLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Profile modal
  const viewProfileBtn = document.getElementById('btnViewFullProfile');
  if (viewProfileBtn) {
    viewProfileBtn.addEventListener('click', openProfileModal);
  }
}

function openProfileModal() {
  const user = getCurrentUser() || {};
  let modalOverlay = document.getElementById('profileDetailModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'profileDetailModal';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close-btn" id="closeProfileModalBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div style="display: flex; gap: 18px; align-items: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;">
          ${user.name ? user.name.charAt(0).toUpperCase() : 'P'}
        </div>
        <div>
          <h2 style="font-size: 1.4rem; margin-bottom: 4px;">${escapeHtml(user.name || 'Patient Name')}</h2>
          <span style="font-size: 0.82rem; background: var(--primary-50); color: var(--primary); padding: 3px 10px; border-radius: var(--radius-full); font-weight: 600;">Patient ID: #CP-82910</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; font-size: 0.92rem;">
        <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Email:</span>
          <strong>${escapeHtml(user.email || 'demo@carepulse.com')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Phone:</span>
          <strong>${escapeHtml(user.phone || '+1 (555) 234-5678')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Blood Type:</span>
          <strong>${escapeHtml(user.bloodGroup || 'O+')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
          <span style="color: var(--text-muted);">Known Allergies:</span>
          <strong style="color: var(--danger);">${escapeHtml(user.allergies || 'Penicillin')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Emergency Contact:</span>
          <span>Mark Vance (+1 555-982-1100)</span>
        </div>
      </div>

      <div style="text-align: right;">
        <button class="btn btn-primary btn-sm" id="closeProfileModalBtn2">Close Profile</button>
      </div>
    </div>
  `;

  modalOverlay.classList.add('open');

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  document.getElementById('closeProfileModalBtn').addEventListener('click', closeModal);
  document.getElementById('closeProfileModalBtn2').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}
