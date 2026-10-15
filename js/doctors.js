/**
 * AuraCare Health - Doctor Directory & Filtering Engine
 * Manages sample doctor directory, live search, specialty filtering,
 * and detailed modal viewing.
 */

const DOCTORS_DATA = [
  {
    id: 'dr-sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    experience: '14+ Years Experience',
    rating: 4.9,
    reviewsCount: 142,
    availability: 'Available Mon, Wed, Fri',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=85',
    bio: 'Dr. Sarah Jenkins is an esteemed cardiovascular specialist with extensive background in preventative cardiology, hypertension management, and non-invasive cardiac diagnostic procedures.',
    education: 'Harvard Medical School • Johns Hopkins Residency',
    languages: 'English, Spanish',
    acceptingNewPatients: true
  },
  {
    id: 'dr-oliver-chen',
    name: 'Dr. Oliver Chen',
    title: 'MD, MPH',
    specialty: 'General Medicine',
    experience: '12+ Years Experience',
    rating: 4.8,
    reviewsCount: 98,
    availability: 'Available Mon - Thu',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=85',
    bio: 'Dr. Chen specializes in comprehensive adult wellness, chronic disease prevention, lifestyle medicine, and holistic primary healthcare for diverse individuals and families.',
    education: 'Stanford University School of Medicine',
    languages: 'English, Mandarin',
    acceptingNewPatients: true
  },
  {
    id: 'dr-amara-williams',
    name: 'Dr. Amara Williams',
    title: 'MD, FAAP',
    specialty: 'Pediatrics',
    experience: '11+ Years Experience',
    rating: 5.0,
    reviewsCount: 180,
    availability: 'Available Tue - Sat',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=85',
    bio: 'Dr. Williams brings compassionate, gentle pediatric care from newborn checkups through adolescent development, child nutrition, and preventative vaccinations.',
    education: 'Columbia University Vagelos College of Physicians and Surgeons',
    languages: 'English, French',
    acceptingNewPatients: true
  },
  {
    id: 'dr-marcus-vance',
    name: 'Dr. Marcus Vance',
    title: 'MD, FAAOS',
    specialty: 'Orthopedics',
    experience: '16+ Years Experience',
    rating: 4.9,
    reviewsCount: 210,
    availability: 'Available Mon, Tue, Thu',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=85',
    bio: 'A recognized pioneer in minimally invasive joint surgery and sports injury rehabilitation, Dr. Vance helps athletes and active adults regain pain-free mobility.',
    education: 'UCLA David Geffen School of Medicine • Mayo Clinic Fellowship',
    languages: 'English',
    acceptingNewPatients: true
  },
  {
    id: 'dr-elena-rodriguez',
    name: 'Dr. Elena Rodriguez',
    title: 'MD, FAAD',
    specialty: 'Dermatology',
    experience: '9+ Years Experience',
    rating: 4.9,
    reviewsCount: 115,
    availability: 'Available Mon, Wed, Fri',
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=85',
    bio: 'Dr. Rodriguez provides advanced dermatological treatments including skin cancer screenings, acne and psoriasis clinical management, and modern laser therapy.',
    education: 'Yale School of Medicine • NYU Langone Health',
    languages: 'English, Spanish, Portuguese',
    acceptingNewPatients: true
  },
  {
    id: 'dr-arun-patel',
    name: 'Dr. Arun Patel',
    title: 'DDS, FAGD',
    specialty: 'Dentistry',
    experience: '10+ Years Experience',
    rating: 4.8,
    reviewsCount: 130,
    availability: 'Available Tue - Fri',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=85',
    bio: 'Dr. Patel focuses on gentle, anxiety-free dentistry, restorative smile design, root canal therapies, and preventative family oral hygiene with state-of-the-art 3D imaging.',
    education: 'University of Pennsylvania School of Dental Medicine',
    languages: 'English, Hindi, Gujarati',
    acceptingNewPatients: true
  },
  {
    id: 'dr-hannah-abbott',
    name: 'Dr. Hannah Abbott',
    title: 'MD, FCAP',
    specialty: 'Diagnostic Services',
    experience: '13+ Years Experience',
    rating: 4.9,
    reviewsCount: 88,
    availability: 'Available Mon - Fri',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=85',
    bio: 'Leading our modern diagnostic and laboratory imaging division, Dr. Abbott ensures precision diagnostic reporting, MRI/CT evaluations, and genetic health panels.',
    education: 'University of Chicago Pritzker School of Medicine',
    languages: 'English',
    acceptingNewPatients: true
  },
  {
    id: 'dr-david-kim',
    name: 'Dr. David Kim',
    title: 'MD, FACEP',
    specialty: 'Emergency Care',
    experience: '15+ Years Experience',
    rating: 5.0,
    reviewsCount: 275,
    availability: 'Available 24/7 On-Call Shifts',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=85',
    bio: 'Head of Trauma and Acute Emergency Care with over a decade of rapid-response clinical leadership in critical stabilization, trauma care, and cardiac emergencies.',
    education: 'Northwestern University Feinberg School of Medicine',
    languages: 'English, Korean',
    acceptingNewPatients: true
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const directoryContainer = document.getElementById('doctorsDirectoryGrid');
  if (directoryContainer) {
    initDoctorDirectory();
  }
});

function initDoctorDirectory() {
  const directoryContainer = document.getElementById('doctorsDirectoryGrid');
  const searchInput = document.getElementById('doctorSearchInput');
  const specialtyPills = document.querySelectorAll('.filter-pill[data-specialty]');
  const countBadge = document.getElementById('doctorResultsCount');

  let currentSpecialty = 'all';
  let currentSearchQuery = '';

  function renderDoctors() {
    const filtered = DOCTORS_DATA.filter(doc => {
      const matchesSpecialty = currentSpecialty === 'all' || 
        doc.specialty.toLowerCase() === currentSpecialty.toLowerCase();
      
      const query = currentSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        doc.name.toLowerCase().includes(query) || 
        doc.specialty.toLowerCase().includes(query) ||
        doc.education.toLowerCase().includes(query);

      return matchesSpecialty && matchesSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} doctor${filtered.length === 1 ? '' : 's'} available`;
    }

    if (filtered.length === 0) {
      directoryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
          <svg style="width: 50px; height: 50px; color: var(--text-light); margin: 0 auto 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No doctors found matching your criteria</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Try adjusting your search terms or selecting another medical specialty.</p>
          <button class="btn btn-outline btn-sm" id="resetDoctorFiltersBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetDoctorFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          currentSearchQuery = '';
          currentSpecialty = 'all';
          specialtyPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-specialty') === 'all'));
          renderDoctors();
        });
      }
      return;
    }

    directoryContainer.innerHTML = filtered.map(doc => `
      <article class="doctor-card reveal visible" data-id="${doc.id}">
        <div class="doctor-img-wrap">
          <img src="${doc.image}" alt="${escapeHtml(doc.name)}" loading="lazy">
          <span class="doctor-specialty-badge">${escapeHtml(doc.specialty)}</span>
          <span class="doctor-availability">
            <span style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%; display: inline-block;"></span>
            ${escapeHtml(doc.availability.split(',')[0])}
          </span>
        </div>
        <div class="doctor-body">
          <div class="doctor-rating">
            <span>★</span> ${doc.rating.toFixed(1)} 
            <span>(${doc.reviewsCount} reviews)</span>
          </div>
          <h3 class="doctor-name">${escapeHtml(doc.name)}</h3>
          <p class="doctor-qualification">${escapeHtml(doc.title)}</p>
          <p class="doctor-experience">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 108 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ${escapeHtml(doc.experience)}
          </p>
          <div class="doctor-card-actions">
            <button type="button" class="btn btn-outline btn-sm view-doctor-btn" data-id="${doc.id}">
              Details
            </button>
            <a href="appointments.html?doctor=${encodeURIComponent(doc.id)}&specialty=${encodeURIComponent(doc.specialty)}" class="btn btn-primary btn-sm">
              Book Visit
            </a>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click listeners to Details buttons
    document.querySelectorAll('.view-doctor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        openDoctorModal(docId);
      });
    });
  }

  // Specialty pills click event
  specialtyPills.forEach(pill => {
    pill.addEventListener('click', () => {
      specialtyPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentSpecialty = pill.getAttribute('data-specialty');
      renderDoctors();
    });
  });

  // Search input live typing
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderDoctors();
    });
  }

  // Initial render
  renderDoctors();
}

/* --- Doctor Details Modal Popup --- */
function openDoctorModal(docId) {
  const doc = DOCTORS_DATA.find(d => d.id === docId);
  if (!doc) return;

  let modalOverlay = document.getElementById('doctorDetailModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'doctorDetailModal';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close-btn" id="closeDoctorModalBtn" aria-label="Close dialog">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
        <img src="${doc.image}" alt="${escapeHtml(doc.name)}" style="width: 84px; height: 84px; border-radius: var(--radius-lg); object-fit: cover; border: 2px solid var(--primary-100);">
        <div>
          <span class="section-badge" style="padding: 3px 10px; font-size: 0.75rem; margin-bottom: 6px;">${escapeHtml(doc.specialty)}</span>
          <h2 style="font-size: 1.5rem; margin-bottom: 2px;">${escapeHtml(doc.name)}</h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">${escapeHtml(doc.title)} • ${escapeHtml(doc.experience)}</p>
        </div>
      </div>

      <div style="background: var(--bg-alt); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.88rem;">
        <div><strong>Patient Rating:</strong> <span style="color: #f59e0b;">★ ${doc.rating}</span> (${doc.reviewsCount} reviews)</div>
        <div><strong>Availability:</strong> ${escapeHtml(doc.availability)}</div>
        <div><strong>Languages:</strong> ${escapeHtml(doc.languages)}</div>
        <div><strong>Status:</strong> <span style="color: var(--accent); font-weight: 600;">Accepting New Patients</span></div>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 1rem; margin-bottom: 6px;">About Specialist</h4>
        <p style="font-size: 0.92rem; color: var(--text-body); line-height: 1.6;">${escapeHtml(doc.bio)}</p>
      </div>

      <div style="margin-bottom: 28px;">
        <h4 style="font-size: 1rem; margin-bottom: 6px;">Education & Credentials</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted);">${escapeHtml(doc.education)}</p>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" class="btn btn-outline" id="closeDoctorModalBtn2">Close</button>
        <a href="appointments.html?doctor=${encodeURIComponent(doc.id)}&specialty=${encodeURIComponent(doc.specialty)}" class="btn btn-primary">
          Book Appointment with ${escapeHtml(doc.name.split(' ')[1] || doc.name)}
        </a>
      </div>
    </div>
  `;

  modalOverlay.classList.add('open');

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  document.getElementById('closeDoctorModalBtn').addEventListener('click', closeModal);
  document.getElementById('closeDoctorModalBtn2').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}
