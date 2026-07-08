/**
 * Foundation[EA] Pitch Deck Presentation Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- Core State Management ---
  let currentSlide = 1;
  const totalSlides = 11;
  let autoplayInterval = null;
  const autoplayDuration = 8000; // 8 seconds per slide
  let isAutoplayActive = false;
  
  // Stopwatch Timer variables
  let timerStart = Date.now();
  let timerElapsed = 0;
  let timerInterval = null;

  // --- Speaker Notes Data ---
  const speakerNotes = {
    1: "I’m Ashimirwe Joseph Marie. We are Foundation[EA], a premium digital engineering agency based in Kigali, dedicated to setting a new aesthetic and functional standard for software in our region.",
    2: "We see a shift toward digitalization, but many businesses are stuck with outdated, analog processes. We exist to provide the high-end, '2026-Aesthetic' digital solutions they need to compete globally.",
    3: "Digital solutions often lack intuitive design and performance. Enterprises struggle with inefficient, paper-heavy workflows. A local talent gap exists between academic learning and industry standards.",
    4: "We build premium solutions using Next.js 15, TypeScript, Python, Node.js, and modern databases. We pair this with a rich visual style featuring kinetic typography, glassmorphism, and real-time syncing.",
    5: "My dual role as a founder and a software development teacher allows us to maintain a pipeline of top-tier talent while delivering world-class service.",
    6: "Our flagship portfolio now spans digital engineering, hospitality training, travel, aquaculture education, and precision agriculture. Each product is designed to solve real local problems with modern technology.",
    7: "We continue to expand our portfolio through practical, high-impact experiences that connect education, industry, and sustainable growth across East Africa.",
    8: "Kigali is emerging as a regional tech hub. Rising demand for digital transformation in education, logistics, and tourism sectors. Foundation[EA] is positioned at the intersection of this regional ICT vision.",
    9: "We are seeking a 10M RWF growth runway: 3.5M for hardware, 2.5M for a Studio HQ in Kigali, 1.5M for cloud and API tooling, 1.0M for portfolio branding, and 1.5M for an R&D prototype buffer.",
    10: "We are building a legacy: professionalizing the regional software engineering ecosystem, empowering students to solve local problems, and creating permanent innovation infrastructure.",
    11: "I invite you to join us in building this infrastructure. Let's make Foundation[EA] the premier name in African digital engineering. Connect with us at foundationea.com, email us at agency@mail.foundationea.com, or message us on WhatsApp at +250783309973."
  };

  // --- DOM Elements ---
  const slides = document.querySelectorAll('.slide');
  const appContainer = document.getElementById('app-container');
  const slideIndexEl = document.getElementById('slide-index');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playBtn = document.getElementById('play-btn');
  const playIcon = document.getElementById('play-icon');
  const notesToggleBtn = document.getElementById('notes-toggle-btn');
  const presenterToggleBtn = document.getElementById('presenter-toggle-btn');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const notesOverlay = document.getElementById('notes-overlay');
  const notesOverlayText = document.getElementById('notes-overlay-text');
  const notesCollapseBtn = document.getElementById('notes-collapse-btn');
  const exitPresenterBtn = document.getElementById('exit-presenter-btn');
  
  // Presenter DOM Elements
  const presenterTimer = document.getElementById('presenter-timer');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const presenterNotesContent = document.getElementById('presenter-notes-content');
  const nextSlidePreviewFrame = document.getElementById('next-slide-preview-frame');
  const dashboardSlideNum = document.getElementById('dashboard-slide-num');
  const dashboardAutoplayStatus = document.getElementById('dashboard-autoplay-status');

  // --- Interactive Animations Controllers ---
  let dbAnimationInterval = null;

  // --- Slide Navigation logic ---
  function goToSlide(index) {
    // Range boundary validation
    if (index < 1) index = 1;
    if (index > totalSlides) index = totalSlides;
    
    // Deactivate current active slide
    const currentActiveSlide = document.querySelector('.slide.active');
    if (currentActiveSlide) {
      currentActiveSlide.classList.remove('active');
    }
    
    currentSlide = index;
    
    // Activate target slide
    const targetSlide = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    if (targetSlide) {
      targetSlide.classList.add('active');
    }

    // Update Footers & Indicators
    slideIndexEl.textContent = `Slide ${currentSlide} of ${totalSlides}`;
    dashboardSlideNum.textContent = `${currentSlide} / ${totalSlides}`;

    // Update Speaker Notes Content
    const notesText = speakerNotes[currentSlide] || "No speaker notes for this slide.";
    notesOverlayText.textContent = notesText;
    presenterNotesContent.textContent = notesText;

    // Update Next Slide Preview
    updateNextSlidePreview();

    // Trigger Slide-Specific Animations
    handleSlideAnimations(currentSlide);

    // Disable/Enable Nav buttons
    prevBtn.disabled = (currentSlide === 1);
    nextBtn.disabled = (currentSlide === totalSlides);
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else {
      // Loop back to start if autoplaying
      if (isAutoplayActive) {
        goToSlide(1);
      }
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  // --- Autoplay Controllers ---
  function toggleAutoplay() {
    if (isAutoplayActive) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  function startAutoplay() {
    isAutoplayActive = true;
    dashboardAutoplayStatus.textContent = "Active";
    playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>`;
    playBtn.title = "Pause Autoplay (A)";
    
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, autoplayDuration);
  }

  function stopAutoplay() {
    isAutoplayActive = false;
    dashboardAutoplayStatus.textContent = "Inactive";
    playIcon.innerHTML = `<polygon points="6 3 20 12 6 21 6 3" fill="currentColor"/>`;
    playBtn.title = "Play Autoplay (A)";
    
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // --- Presenter View Timer / Stopwatch ---
  function startPresenterTimer() {
    timerStart = Date.now() - timerElapsed;
    timerInterval = setInterval(() => {
      timerElapsed = Date.now() - timerStart;
      updateTimerDisplay();
    }, 1000);
  }

  function resetPresenterTimer() {
    timerElapsed = 0;
    timerStart = Date.now();
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const totalSecs = Math.floor(timerElapsed / 1000);
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    presenterTimer.textContent = `${hrs}:${mins}:${secs}`;
  }

  // --- Presenter Mode Preview Generator ---
  function updateNextSlidePreview() {
    nextSlidePreviewFrame.innerHTML = '';
    const nextIdx = currentSlide + 1;
    
    if (nextIdx > totalSlides) {
      nextSlidePreviewFrame.innerHTML = `<div class="preview-placeholder">End of Presentation</div>`;
      return;
    }
    
    const nextSlideDom = document.querySelector(`.slide[data-slide="${nextIdx}"]`);
    if (nextSlideDom) {
      const title = nextSlideDom.querySelector('.slide-title')?.innerText || 
                    nextSlideDom.querySelector('h1')?.innerText || "Slide " + nextIdx;
      const category = nextSlideDom.querySelector('.slide-category')?.innerText || "Next Slide";
      
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '0.5rem';
      
      const catEl = document.createElement('span');
      catEl.textContent = category;
      catEl.style.fontSize = '0.65rem';
      catEl.style.color = 'var(--cyan-glow)';
      catEl.style.textTransform = 'uppercase';
      catEl.style.letterSpacing = '0.1em';
      
      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      titleEl.style.fontSize = '1.1rem';
      titleEl.style.color = '#fff';
      titleEl.style.margin = '0';
      
      container.appendChild(catEl);
      container.appendChild(titleEl);
      nextSlidePreviewFrame.appendChild(container);
    }
  }

  // --- Active Interactive Slide Animations ---
  function handleSlideAnimations(slideNum) {
    // Clean up older running animations
    if (dbAnimationInterval) {
      clearInterval(dbAnimationInterval);
      dbAnimationInterval = null;
    }

    // Slide 8: Roadmap progress bars width animation
    if (slideNum === 8) {
      const items = document.querySelectorAll('.roadmap-item');
      items.forEach(item => {
        const fill = item.querySelector('.progress-fill');
        const allocation = item.getAttribute('data-allocation');
        fill.style.width = '0%';
        // Trigger reflow to restart animation transition
        fill.offsetHeight; 
        fill.style.width = `${allocation}%`;
      });
    }

    // Slide 6: Database bar chart updates
    if (slideNum === 6) {
      const dbBars = document.querySelectorAll('.db-bar');
      // Set initial values
      dbBars.forEach(bar => {
        const val = bar.getAttribute('style').match(/\d+/)[0];
        bar.style.height = `${val}%`;
      });
      // Dynamically wiggle the data logs every second
      dbAnimationInterval = setInterval(() => {
        dbBars.forEach(bar => {
          const originalVal = parseInt(bar.getAttribute('style').match(/\d+/)[0]);
          const wiggle = Math.floor(Math.random() * 11) - 5; // -5 to +5%
          const newVal = Math.max(20, Math.min(100, originalVal + wiggle));
          bar.style.height = `${newVal}%`;
        });
      }, 1500);
    }
  }

  // --- Layout Mode Toggles ---
  function togglePresenterMode() {
    if (appContainer.classList.contains('viewer-layout')) {
      appContainer.classList.remove('viewer-layout');
      appContainer.classList.add('presenter-layout');
      presenterToggleBtn.classList.add('active');
      startPresenterTimer();
    } else {
      appContainer.classList.remove('presenter-layout');
      appContainer.classList.add('viewer-layout');
      presenterToggleBtn.classList.remove('active');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  }

  function toggleNotesOverlay() {
    notesOverlay.classList.toggle('hidden');
    notesToggleBtn.classList.toggle('active');
  }

  // --- Modal Helpers ---
  function toggleHelpModal() {
    helpModal.classList.toggle('hidden');
  }

  // --- Event Listeners Setup ---
  
  // Footer click controllers
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  playBtn.addEventListener('click', toggleAutoplay);
  notesToggleBtn.addEventListener('click', toggleNotesOverlay);
  notesCollapseBtn.addEventListener('click', () => {
    notesOverlay.classList.toggle('collapsed');
    if (notesOverlay.classList.contains('collapsed')) {
      notesCollapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
      notesCollapseBtn.title = "Expand Speaker Notes";
    } else {
      notesCollapseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      notesCollapseBtn.title = "Minimize Speaker Notes";
    }
  });
  presenterToggleBtn.addEventListener('click', togglePresenterMode);
  helpBtn.addEventListener('click', toggleHelpModal);
  closeModalBtn.addEventListener('click', toggleHelpModal);
  timerResetBtn.addEventListener('click', resetPresenterTimer);

  // QR Modal controls
  const qrBtn = document.getElementById('qr-btn');
  const qrModal = document.getElementById('qr-modal');
  const qrCloseBtn = document.getElementById('qr-close-btn');
  const qrCopyBtn = document.getElementById('qr-copy-btn');
  const qrDownloadBtn = document.getElementById('qr-download-btn');
  const qrLinkEl = document.getElementById('qr-link');

  function openQrModal() {
    if (qrModal) qrModal.classList.remove('hidden');
  }
  function closeQrModal() {
    if (qrModal) qrModal.classList.add('hidden');
  }

  if (qrBtn) qrBtn.addEventListener('click', openQrModal);
  if (qrCloseBtn) qrCloseBtn.addEventListener('click', closeQrModal);
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeQrModal();
    });
  }

  if (qrCopyBtn) {
    qrCopyBtn.addEventListener('click', () => {
      const url = qrLinkEl?.href || window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Presentation link copied to clipboard');
      }).catch(() => {
        alert('Unable to copy link');
      });
    });
  }

  // Exit Presenter Mode button (mobile): when clicked, ensure presenter mode is turned off
  if (exitPresenterBtn) {
    const forceExitPresenter = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
      }
      // Force exit presenter mode (do not rely on toggle state)
      if (appContainer.classList.contains('presenter-layout')) {
        appContainer.classList.remove('presenter-layout');
        appContainer.classList.add('viewer-layout');
        if (presenterToggleBtn) presenterToggleBtn.classList.remove('active');
        // Stop timer if running
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        // Ensure presenter aside is hidden and viewer updates
        const currentActiveSlide = document.querySelector('.slide.active');
        if (currentActiveSlide) currentActiveSlide.classList.add('active');
      }
    };

    // Listen to pointer events for broad device coverage and fallback to click
    exitPresenterBtn.addEventListener('pointerdown', forceExitPresenter, { passive: true });
    exitPresenterBtn.addEventListener('click', forceExitPresenter);
    // Also handle touchstart for older browsers
    exitPresenterBtn.addEventListener('touchstart', forceExitPresenter, { passive: true });
  }

  if (qrDownloadBtn) {
    qrDownloadBtn.addEventListener('click', () => {
      const img = document.getElementById('qr-img');
      if (!img) return;
      const link = document.createElement('a');
      link.href = img.src;
      link.download = 'foundationea_presentation_qr.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    // Avoid interfering when modal is open and Esc is hit
    if (e.key === 'Escape') {
      helpModal.classList.add('hidden');
      if (qrModal) qrModal.classList.add('hidden');
      return;
    }
    
    switch (e.key) {
      case ' ':
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        stopAutoplay();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        stopAutoplay();
        prevSlide();
        break;
      case 'p':
      case 'P':
        togglePresenterMode();
        break;
      case 'n':
      case 'N':
        toggleNotesOverlay();
        break;
      case 'a':
      case 'A':
        toggleAutoplay();
        break;
      case 'h':
      case 'H':
      case '?':
        toggleHelpModal();
        break;
    }
  });

  // Swipe gesture controls for mobile/tablet screens
  let touchStartX = 0;
  let touchEndX = 0;
  
  const viewport = document.getElementById('deck-viewport');
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe Left -> Next Slide
      stopAutoplay();
      nextSlide();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe Right -> Prev Slide
      stopAutoplay();
      prevSlide();
    }
  }

  // --- Initial System Boot ---
  // Start slide 1, display and initialize state values
  goToSlide(1);
  resetPresenterTimer();
  // Presenter split: enable by default only on non-touch large screens
  // Prevent auto-activating presenter mode on phones/tablets where it blocks interaction
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch && window.innerWidth >= 900) {
    togglePresenterMode();
  } else {
    // Ensure viewer layout for touch/smaller viewports
    appContainer.classList.remove('presenter-layout');
    appContainer.classList.add('viewer-layout');
    if (presenterToggleBtn) presenterToggleBtn.classList.remove('active');
  }

});
