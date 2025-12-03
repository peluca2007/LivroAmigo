document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach((el) => {
    const slides = [...el.querySelectorAll('[data-slide]')];
    if (!slides.length) return;
    const prev = el.querySelector('[data-carousel-prev]');
    const next = el.querySelector('[data-carousel-next]');
    const dotsWrap = el.querySelector('[data-carousel-dots]');
    const intervalMs = Number(el.dataset.carouselInterval) || 6000;
    let i = slides.findIndex(s => s.classList.contains('is-active'));
    if (i < 0) i = 0;
    const dots = slides.map((_, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => show(idx, true));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });
    function show(n, user = false) {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      dots.forEach((d, idx) => d.setAttribute('aria-current', idx === i ? 'true' : 'false'));
      if (user) restart();
    }
    prev && prev.addEventListener('click', () => show(i - 1, true));
    next && next.addEventListener('click', () => show(i + 1, true));
    let timer;
    function start() { timer = setInterval(() => show(i + 1, false), intervalMs); }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    show(i);
    start();
  });
});
