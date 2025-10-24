document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(setupCarousel);
});

function setupCarousel(root) {
  const slides = Array.from(root.querySelectorAll('[data-slide]'));
  if (slides.length <= 1) {
    slides[0]?.classList.add('is-active');
    return;
  }

  let currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
  if (currentIndex < 0) currentIndex = 0;

  const prevButton = root.querySelector('[data-carousel-prev]');
  const nextButton = root.querySelector('[data-carousel-next]');
  const dotsHost = root.querySelector('[data-carousel-dots]');
  const interval = Number(root.dataset.carouselInterval) || 7000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dots = [];
  let timerId = 0;

  if (dotsHost) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dotsHost.appendChild(dot);
      dots.push(dot);
    });
  }

  const updateAria = () => {
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
      slide.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    });
  };

  const stopTimer = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = 0;
    }
  };

  const startTimer = () => {
    if (reducedMotion || interval <= 0) return;
    stopTimer();
    timerId = window.setInterval(() => goTo(currentIndex + 1, false), interval);
  };

  const goTo = (newIndex, shouldRestart = true) => {
    const nextIndex = (newIndex + slides.length) % slides.length;
    if (nextIndex === currentIndex) {
      if (shouldRestart) startTimer();
      return;
    }

    slides[currentIndex]?.classList.remove('is-active');
    slides[nextIndex]?.classList.add('is-active');

    dots[currentIndex]?.classList.remove('is-active');
    dots[nextIndex]?.classList.add('is-active');

    currentIndex = nextIndex;
    updateAria();
    if (shouldRestart) startTimer();
  };

  const handlePrev = () => goTo(currentIndex - 1);
  const handleNext = () => goTo(currentIndex + 1);

  prevButton?.addEventListener('click', handlePrev);
  nextButton?.addEventListener('click', handleNext);

  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  });

  const pauseAutoPlay = () => stopTimer();
  const resumeAutoPlay = () => startTimer();

  root.addEventListener('mouseenter', pauseAutoPlay);
  root.addEventListener('mouseleave', resumeAutoPlay);
  root.addEventListener('focusin', pauseAutoPlay);
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) {
      resumeAutoPlay();
    }
  });

  goTo(currentIndex, false);
  updateAria();
  dots[currentIndex]?.classList.add('is-active');
  startTimer();
}
