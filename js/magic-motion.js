(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function revealOnScroll() {
    const targets = document.querySelectorAll('.philosophy__stats, .philosophy__content, .apartments__title, .apartment-card, .infrastructure__title, .infrastructure__visual, .gallery .section__title, .gallery__slider, .gallery__gallery__dots, .contact .section__title, .section__subtitle, .contact__card, .footer__brand, .footer__column, .footer__social');
    targets.forEach((target, index) => {
      target.classList.add('spell-reveal');
      target.style.setProperty('--spell-delay', `${Math.min(index % 5, 4) * 85}ms`);
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .13, rootMargin: '0px -7% 0px' });
    targets.forEach((target) => observer.observe(target));
  }

  function enableTilt(element, maxTilt = 8) {
    if (!element || !precisePointer || reduceMotion) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const render = () => {
      frame = 0;
      element.style.setProperty('--magic-rotate-x', `${y.toFixed(2)}deg`);
      element.style.setProperty('--magic-rotate-y', `${x.toFixed(2)}deg`);
    };
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      x = (px - .5) * maxTilt * 2;
      y = (.5 - py) * maxTilt * 2;
      element.style.setProperty('--magic-x', `${px * 100}%`);
      element.style.setProperty('--magic-y', `${py * 100}%`);
      element.classList.add('magic-tilt');
      if (!frame) frame = requestAnimationFrame(render);
    });
    element.addEventListener('pointerleave', () => {
      element.classList.remove('magic-tilt');
      element.style.setProperty('--magic-rotate-x', '0deg');
      element.style.setProperty('--magic-rotate-y', '0deg');
    });
  }

  function enableMagnetic(element, strength = .16) {
    if (!element || !precisePointer || reduceMotion) return;
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * strength;
      const y = (event.clientY - rect.top - rect.height / 2) * strength;
      element.style.setProperty('--magnetic-x', `${x.toFixed(1)}px`);
      element.style.setProperty('--magnetic-y', `${y.toFixed(1)}px`);
      element.classList.add('is-magnetic');
    });
    element.addEventListener('pointerleave', () => element.classList.remove('is-magnetic'));
  }

  function activateNavigation() {
    const links = Array.from(document.querySelectorAll('.header__nav a[href^="#"]'));
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-38% 0px -48% 0px', threshold: [0.01, .18, .42] });

    sections.forEach((section) => observer.observe(section));
  }

  function addPressFeedback() {
    document.querySelectorAll('button, .header__button, .apartments__button').forEach((control) => {
      control.addEventListener('pointerdown', () => control.classList.add('is-pressed'));
      control.addEventListener('pointerup', () => control.classList.remove('is-pressed'));
      control.addEventListener('pointercancel', () => control.classList.remove('is-pressed'));
      control.addEventListener('pointerleave', () => control.classList.remove('is-pressed'));
    });
  }

  function makeApartmentCardsInteractive() {
    const cards = Array.from(document.querySelectorAll('.apartment-card'));
    cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', String(card.classList.contains('active')));
      const activate = () => {
        cards.forEach((item) => {
          const selected = item === card;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
        if (event.key === 'ArrowRight' && cards[index + 1]) cards[index + 1].focus();
        if (event.key === 'ArrowLeft' && cards[index - 1]) cards[index - 1].focus();
      });
    });
  }

  function enhanceFormFields() {
    document.querySelectorAll('.modal__field input').forEach((input) => {
      const update = () => input.closest('.modal__field')?.classList.toggle('has-value', Boolean(input.value.trim()));
      input.addEventListener('input', update);
      input.addEventListener('blur', update);
      update();
    });
  }

  function runScrollMotion() {
    if (reduceMotion) return;
    const hero = document.querySelector('.hero');
    const infrastructure = document.querySelector('.infrastructure__visual');
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const scroll = window.scrollY;
      document.documentElement.style.setProperty('--scroll-progress', String(scroll / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)));
      if (hero) hero.style.setProperty('--hero-scroll', `${Math.min(scroll * .08, 26)}px`);
      if (infrastructure) {
        const rect = infrastructure.getBoundingClientRect();
        const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
        infrastructure.style.setProperty('--map-shift', `${(progress - .5) * 14}px`);
      }
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function init() {
    document.documentElement.classList.add('motion-ready');
    revealOnScroll();

    document.addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${(event.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--pointer-y', `${(event.clientY / window.innerHeight) * 100}%`);
    }, { passive: true });

    document.querySelectorAll('.philosophy__stat, .apartment-card').forEach((item) => enableTilt(item, 9));
    enableTilt(document.querySelector('.contact__card'), 6);
    enableTilt(document.querySelector('.infrastructure__panel'), 4);
    enableTilt(document.querySelector('.gallery__viewport'), 3);

    document.querySelectorAll('.header__button, .hero__button, .apartments__button, .contact__button, .modal__submit').forEach((button) => enableMagnetic(button));
    activateNavigation();
    addPressFeedback();
    makeApartmentCardsInteractive();
    enhanceFormFields();
    runScrollMotion();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
