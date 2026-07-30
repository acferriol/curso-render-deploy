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
  let isAnimating = false;

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
    if (index < 0 || index >= totalSlides || index === currentSlide || isAnimating) return;

    isAnimating = true;
    const goingForward = index > currentSlide;
    const oldSlide = slides[currentSlide];
    const newSlide = slides[index];

    // 1. Desactivar slide actual
    oldSlide.classList.remove('active');

    // 2. Preparar slide nuevo: posicionarlo fuera de pantalla en la dirección correcta
    newSlide.style.transition = 'none';
    newSlide.style.transform = goingForward ? 'translateX(100%)' : 'translateX(-100%)';
    newSlide.style.opacity = '0';
    newSlide.classList.add('active');

    // 3. Forzar reflow para que el browser registre la posición inicial
    void newSlide.offsetWidth;

    // 4. Animar slide nuevo hacia su posición
    newSlide.style.transition = '';
    newSlide.style.transform = 'translateX(0)';
    newSlide.style.opacity = '1';

    // 5. Limpiar después de la transición
    setTimeout(function () {
      oldSlide.classList.remove('active');
      oldSlide.style.transform = '';
      oldSlide.style.opacity = '';
      oldSlide.style.transition = '';
      newSlide.style.transition = '';
      isAnimating = false;
    }, 500);

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
    var pct = ((currentSlide + 1) / totalSlides) * 100;
    progressBar.style.width = pct + '%';

    // Counter
    slideCounter.textContent = (currentSlide + 1) + ' / ' + totalSlides;

    // Dots
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentSlide);
    });

    // Disable states
    prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
  }

  // --- Event listeners ---

  // Buttons
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Keyboard
  document.addEventListener('keydown', function (e) {
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
  var touchStartX = 0;
  var touchStartY = 0;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].screenX - touchStartX;
    var dy = e.changedTouches[0].screenY - touchStartY;

    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
  }, { passive: true });

  // Mouse wheel (throttled)
  var wheelTimeout = null;
  document.addEventListener('wheel', function (e) {
    if (wheelTimeout) return;
    wheelTimeout = setTimeout(function () {
      wheelTimeout = null;
    }, 600);

    if (e.deltaY > 30) next();
    else if (e.deltaY < -30) prev();
  }, { passive: true });

  // --- Init ---
  updateUI();
})();
