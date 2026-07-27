/*
 * Motion layer for the existing layout.
 * It deliberately does not address .hero or its children.
 */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function setScrollDepth() {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    document.documentElement.style.setProperty('--page-depth', (window.scrollY / scrollable).toFixed(4));
  }

  function enableReveals() {
    const targets = document.querySelectorAll(
      '.philosophy__stats, .philosophy__content, .apartments__title, .gallery .section__title, .gallery__slider, .gallery__gallery__dots, .contact .section__title, .section__subtitle, .footer__brand, .footer__column, .footer__social, .footer__bottom'
    );

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('motion-in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px -8% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  function enablePointerDepth(element, options = {}) {
    if (!element || !finePointer.matches || reducedMotion.matches) return;

    const maxTilt = options.maxTilt ?? 7;
    const scale = options.scale ?? 1.015;
    let frame = 0;
    let x = 0;
    let y = 0;

    const render = () => {
      frame = 0;
      element.style.setProperty('--tilt-x', `${y.toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${x.toFixed(2)}deg`);
      element.style.setProperty('--tilt-scale', scale);
    };

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      x = clamp((px - 0.5) * maxTilt * 2, -maxTilt, maxTilt);
      y = clamp((0.5 - py) * maxTilt * 2, -maxTilt, maxTilt);
      element.style.setProperty('--fx-x', `${(px * 100).toFixed(2)}%`);
      element.style.setProperty('--fx-y', `${(py * 100).toFixed(2)}%`);
      if (!frame) frame = requestAnimationFrame(render);
    });

    element.addEventListener('pointerenter', () => element.classList.add('has-pointer-depth'));
    element.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.classList.remove('has-pointer-depth');
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
      element.style.setProperty('--tilt-scale', '1');
    });
  }

  function enableStats() {
    document.querySelectorAll('.philosophy__stat').forEach((item, index) => {
      item.style.setProperty('--stat-delay', `${index * 90}ms`);
      enablePointerDepth(item, { maxTilt: 9, scale: 1.035 });
    });
  }

  function enableFooterLinks() {
    document.querySelectorAll('.footer a').forEach((link) => {
      link.addEventListener('pointerenter', () => link.classList.add('link-active'));
      link.addEventListener('pointerleave', () => link.classList.remove('link-active'));
    });
  }

  function init() {
    setScrollDepth();
    window.addEventListener('scroll', setScrollDepth, { passive: true });
    window.addEventListener('resize', setScrollDepth, { passive: true });

    if (!reducedMotion.matches) {
      enableReveals();
      enableStats();
      enablePointerDepth(document.getElementById('contactCard'), { maxTilt: 5, scale: 1.018 });
      enablePointerDepth(document.querySelector('.gallery__viewport'), { maxTilt: 2.5, scale: 1.008 });
    } else {
      document.querySelectorAll('.philosophy__stats, .philosophy__content, .apartments__title, .gallery .section__title, .gallery__slider, .gallery__gallery__dots, .contact .section__title, .section__subtitle, .footer__brand, .footer__column, .footer__social, .footer__bottom').forEach((item) => item.classList.add('motion-in'));
    }

    enableFooterLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
