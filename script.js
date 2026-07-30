/**
 * Slide Deck — Navigation Controller
 * Supports: keyboard, click, touch swipe, dots
 */
(function () {
  'use strict';

  // --- State ---
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 0;

  // --- DOM refs ---
  const progressBar = document.getElementById('progressBar');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('slideDots');

  // --- Build dots ---
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('slide-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.slide-dot');

  // --- Core navigation ---
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides || index === currentSlide) return;

    const direction = index > currentSlide ? 'forward' : 'backward';
    const prevSlide = slides[currentSlide];
    const nextSlide = slides[index];

    // Exit current
    prevSlide.classList.remove('active');
    prevSlide.classList.add(direction === 'forward' ? 'exit-left' : '');

    // Prepare entry direction
    nextSlide.style.transform =
      direction === 'forward' ? 'translateX(60px)' : 'translateX(-60px)';

    // Force reflow so the browser registers the starting transform
    void nextSlide.offsetHeight;

    // Activate next
    nextSlide.classList.add('active');
    nextSlide.style.transform = '';

    // Cleanup exit class after transition
    setTimeout(() => {
      prevSlide.classList.remove('exit-left');
    }, 550);

    currentSlide = index;
    updateUI();
  }

  function next() {
    if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
  }

  function prev() {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }

  function updateUI() {
    // Progress bar
    const pct = ((currentSlide + 1) / totalSlides) * 100;
    progressBar.style.width = pct + '%';

    // Counter
    slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

    // Dots
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

    // Disable states
    prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
    nextBtn.style.opacity =
      currentSlide === totalSlides - 1 ? '0.3' : '1';
  }

  // --- Event listeners ---

  // Buttons
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'Escape':
        // Toggle fullscreen
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        break;
    }
  });

  // Touch / swipe
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;

      // Only trigger if horizontal swipe dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    },
    { passive: true }
  );

  // Mouse wheel (throttled)
  let wheelTimeout = null;
  document.addEventListener(
    'wheel',
    (e) => {
      if (wheelTimeout) return;
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 600);

      if (e.deltaY > 30) next();
      else if (e.deltaY < -30) prev();
    },
    { passive: true }
  );

  // --- Init ---
  updateUI();
})();
