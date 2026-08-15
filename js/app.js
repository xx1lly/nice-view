(function () {
  'use strict';

  const APARTMENTS_DATA = [
    { type_name: 'Type 1', area: '23 m²', rooms: '1 room', price: 'from $1,000 / m²', image_path: './img/plan_a.webp', is_active: true },
    { type_name: 'Type 2', area: '27 m²', rooms: '2 rooms', price: 'from $1,150 / m²', image_path: './img/plan_b.webp', is_active: false },
    { type_name: 'Type 3', area: '31 m²', rooms: '3 rooms', price: 'from $1,300 / m²', image_path: './img/plan_c.webp', is_active: false },
  ];

  const GALLERY_IMAGES = [
    './img/gallery-left.webp',
    './img/gallery-main.webp',
    './img/gallery-right.webp',
    './img/gallery-1.webp',
    './img/gallery-2.webp',
    './img/gallery-3.webp',
  ];

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function initTilt(el, opts) {
    opts = opts || {};
    const maxTilt = opts.maxTilt || 11;
    const scaleOn = opts.scaleOn || 1.025;
    const imgStrength = opts.imgStrength || 0;
    const imgSelector = opts.imgSelector || null;
    const img = imgSelector ? el.querySelector(imgSelector) : null;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mx = (x / rect.width) * 100;
      const my = (y / rect.height) * 100;
      const rotateX = clamp(-((y - centerY) / centerY) * maxTilt, -maxTilt, maxTilt);
      const rotateY = clamp(((x - centerX) / centerX) * maxTilt, -maxTilt, maxTilt);

      el.style.setProperty('--mouse-x', `${mx.toFixed(1)}%`);
      el.style.setProperty('--mouse-y', `${my.toFixed(1)}%`);
      el.style.setProperty('--fx-x', `${mx.toFixed(1)}%`);
      el.style.setProperty('--fx-y', `${my.toFixed(1)}%`);
      el.style.setProperty('--card-mouse-x', `${mx.toFixed(1)}%`);
      el.style.setProperty('--card-mouse-y', `${my.toFixed(1)}%`);
      el.style.setProperty('--panel-mouse-x', `${mx.toFixed(1)}%`);
      el.style.setProperty('--panel-mouse-y', `${my.toFixed(1)}%`);
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scaleOn})`;
      el.classList.add('has-pointer-depth');

      if (img && imgStrength) {
        const imgX = ((x - centerX) / centerX) * -imgStrength;
        const imgY = ((y - centerY) / centerY) * -imgStrength;
        img.style.transform = `translateZ(60px) translate(${imgX.toFixed(1)}px, ${imgY.toFixed(1)}px)`;
      }
    };

    const onLeave = () => {
      el.style.transform = '';
      el.classList.remove('has-pointer-depth');
      if (img) img.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  }

  function initReveal(selector, opts) {
    selector = selector || '[data-reveal]';
    const amount = (opts && opts.amount) || 0.2;
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed', 'philo-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed', 'philo-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: amount }
    );

    els.forEach((el) => observer.observe(el));
  }

  function initMagnetic(el, strength) {
    strength = strength || 0.16;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  }

  const SECTION_IDS = ['home', 'about', 'apartments', 'infrastructure', 'gallery', 'contacts'];

  function initHeader() {
    const header = document.getElementById('header');
    const toggle = document.getElementById('header-menu-toggle');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const mobileLinks = document.querySelectorAll('[data-mobile-link]');

    let ticking = false;
    const updateScroll = () => {
      ticking = false;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateScroll);
        }
      },
      { passive: true }
    );
    updateScroll();

    const closeMenu = () => {
      if (toggle) toggle.checked = false;
      document.body.classList.remove('menu-open');
    };
    if (toggle) {
      toggle.addEventListener('change', () => {
        document.body.classList.toggle('menu-open', toggle.checked);
      });
    }
    mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle && toggle.checked) closeMenu();
    });

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
      const setActive = (id) => {
        navLinks.forEach((link) => {
          link.classList.toggle('is-current', link.getAttribute('href') === `#${id}`);
        });
      };

      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActive(visible.target.id);
        },
        { rootMargin: '-38% 0px -48% 0px', threshold: [0.01, 0.18, 0.42] }
      );

      sections.forEach((s) => observer.observe(s));
    }
  }

  function initHero() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let scheduled = false;
    const updateScroll = () => {
      scheduled = false;
      const scroll = window.scrollY;
      hero.style.setProperty('--hero-scroll', `${Math.min(scroll * 0.08, 26)}px`);
      const heroH = hero.offsetHeight || window.innerHeight;
      const melt = Math.min(Math.max(scroll / heroH, 0), 1);
      hero.style.setProperty('--hero-melt-scale', (1 - melt * 0.22).toFixed(4));
      hero.style.setProperty('--hero-melt-brightness', (1 - melt * 0.55).toFixed(4));
      hero.style.setProperty('--hero-melt-blur', `${(melt * 8).toFixed(2)}px`);
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!scheduled) {
          scheduled = true;
          window.requestAnimationFrame(updateScroll);
        }
      },
      { passive: true }
    );
    updateScroll();

    let raf = null;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--hero-mx', `${x.toFixed(1)}%`);
        hero.style.setProperty('--hero-my', `${y.toFixed(1)}%`);
      });
    });
  }

  function initApartments(opts) {
    const onOpenProperty = opts.onOpenProperty;
    const onOpenCatalog = opts.onOpenCatalog;
    const grid = document.getElementById('apartmentsGrid');
    if (!grid) return;

    let activeType = (APARTMENTS_DATA.find((a) => a.is_active) || APARTMENTS_DATA[0] || {}).type_name;

    APARTMENTS_DATA.forEach((apartment, i) => {
      const card = document.createElement('div');
      card.className = 'apartment-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', apartment.type_name === activeType ? 'true' : 'false');
      card.style.setProperty('--chroma-angle', `${Math.random() * 360}deg`);
      if (apartment.type_name === activeType) card.classList.add('active');

      card.innerHTML = `
        <div class="apartment-card__glow"></div>
        <div class="apartment-card__shimmer" aria-hidden="true"></div>
        <div class="apartment-card__image">
          <img src="${apartment.image_path}" alt="${apartment.type_name} apartment plan" width="400" height="300" loading="lazy" decoding="async" />
        </div>
        <h3 class="apartment-card__type">${apartment.type_name}</h3>
        <p class="apartment-card__area">${apartment.area}</p>
        <button type="button" class="apartment-card__cta"><span>Choose apartment</span></button>
      `;

      const setActive = () => {
        activeType = apartment.type_name;
        grid.querySelectorAll('.apartment-card').forEach((c) => {
          c.classList.toggle('active', c === card);
          c.setAttribute('aria-pressed', c === card ? 'true' : 'false');
        });
      };

      card.addEventListener('click', () => {
        setActive();
        onOpenProperty(apartment);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActive();
          onOpenProperty(apartment);
        }
      });

      const cta = card.querySelector('.apartment-card__cta');
      cta.addEventListener('click', (e) => {
        e.stopPropagation();
        setActive();
        onOpenCatalog();
      });

      initTilt(card, { maxTilt: 11, scaleOn: 1.025, imgStrength: 14, imgSelector: '.apartment-card__image' });

      grid.appendChild(card);

      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                window.setTimeout(() => card.classList.add('is-revealed'), i * 120);
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        obs.observe(card);
      } else {
        card.classList.add('is-revealed');
      }
    });
  }

  function computeCardVars(offsetRaw, total) {
    let offset = offsetRaw;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const distance = Math.abs(offset);

    return {
      translateX: `${offset * 46}%`,
      translateZ: `${-distance * 160}px`,
      rotateY: `${-offset * 32}deg`,
      scale: Math.max(0.55, 1 - distance * 0.22).toFixed(3),
      opacity: distance <= 1 ? 1 : Math.max(0, 1 - (distance - 1) * 0.55).toFixed(3),
      saturation: distance === 0 ? 1 : 0.75,
      brightness: distance === 0 ? 1 : 0.8,
      zIndex: Math.round((3.2 - distance) * 100),
      visible: distance < 3.2,
    };
  }

  function initGallery() {
    const stage = document.getElementById('galleryStage');
    const dotsWrap = document.getElementById('galleryDots');
    const titleEl = document.getElementById('galleryTitle');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const panel = document.getElementById('galleryPanel');
    const slider = document.getElementById('gallerySlider');
    if (!stage) return;

    const total = GALLERY_IMAGES.length;
    let currentIndex = 0;
    let autoplayId = null;

    if (titleEl) {
      titleEl.textContent = '';
      [...'Gallery'].forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'gallery__title-letter';
        span.style.setProperty('--letter-index', i);
        span.textContent = char === ' ' ? '\u00A0' : char;
        titleEl.appendChild(span);
      });
    }

    const cards = GALLERY_IMAGES.map((src, i) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.dataset.index = String(i);
      const picture = document.createElement('picture');
      const source = document.createElement('source');
      source.srcset = src.replace('.jpg', '.webp');
      source.type = 'image/webp';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Nice View gallery photo ${i + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      picture.appendChild(source);
      picture.appendChild(img);
      card.appendChild(picture);
      card.addEventListener('click', () => {
        if (i !== currentIndex) goTo(i);
      });
      stage.appendChild(card);
      return card;
    });

    const dots = GALLERY_IMAGES.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery__dot lg';
      dot.setAttribute('aria-label', `Show image ${i + 1}`);
      dot.innerHTML = '<div class="lg-surface"></div>';
      dot.addEventListener('click', () => {
        stopAutoplay();
        goTo(i);
        startAutoplay();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function render() {
      cards.forEach((card, i) => {
        const vars = computeCardVars(i - currentIndex, total);
        card.style.setProperty('--translate-x', vars.translateX);
        card.style.setProperty('--translate-z', vars.translateZ);
        card.style.setProperty('--rotate-y', vars.rotateY);
        card.style.setProperty('--card-scale', vars.scale);
        card.style.setProperty('--card-opacity', vars.opacity);
        card.style.setProperty('--card-saturation', vars.saturation);
        card.style.setProperty('--card-brightness', vars.brightness);
        card.style.zIndex = vars.zIndex;
        card.style.visibility = vars.visible ? 'visible' : 'hidden';
        card.classList.toggle('is-active', i === currentIndex);
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    function goTo(index) {
      currentIndex = ((index % total) + total) % total;
      render();
    }
    function next() {
      goTo(currentIndex + 1);
    }
    function prev() {
      goTo(currentIndex - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = window.setInterval(next, 5000);
    }
    function stopAutoplay() {
      if (autoplayId) window.clearInterval(autoplayId);
      autoplayId = null;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });

    if (slider) {
      slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    let dragActive = false;
    let dragStartX = 0;
    stage.addEventListener('pointerdown', (e) => {
      dragActive = true;
      dragStartX = e.clientX;
      if (stage.parentElement) stage.parentElement.classList.add('is-dragging');
    });
    window.addEventListener('pointerup', (e) => {
      if (!dragActive) return;
      dragActive = false;
      if (stage.parentElement) stage.parentElement.classList.remove('is-dragging');
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > 60) {
        stopAutoplay();
        if (delta > 0) prev();
        else next();
        startAutoplay();
      }
    });

    if (panel) {
      panel.addEventListener('pointermove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        panel.style.setProperty('--lg-mx', `${x.toFixed(1)}%`);
        panel.style.setProperty('--lg-my', `${y.toFixed(1)}%`);
      });
    }

    render();
    startAutoplay();
  }

  function lockScroll(locked) {
    document.body.classList.toggle('has-modal', locked);
  }

  function initModals() {
    const contactModal = document.getElementById('contactModal');
    const propertyModal = document.getElementById('propertyModal');
    const catalogModal = document.getElementById('catalogModal');
    const contactForm = document.getElementById('contactForm');
    const catalogForm = document.getElementById('catalogForm');
    const catalogSuccess = document.getElementById('catalogSuccess');

    const propertyImage = document.getElementById('propertyImage');
    const propertyTitle = document.getElementById('propertyModalTitle');
    const propertyArea = document.getElementById('propertyArea');
    const propertyRooms = document.getElementById('propertyRooms');
    const propertyPrice = document.getElementById('propertyPrice');

    function anyOpen() {
      return (
        contactModal.classList.contains('is-open') ||
        propertyModal.classList.contains('is-open') ||
        catalogModal.classList.contains('is-open')
      );
    }

    function closeAll() {
      [contactModal, propertyModal, catalogModal].forEach((m) => {
        m.classList.remove('is-open');
        m.setAttribute('aria-hidden', 'true');
      });
      lockScroll(false);
    }

    function openModal(modal) {
      closeAll();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll(true);
    }

    function openContact() {
      openModal(contactModal);
    }

    function openCatalog() {
      catalogSuccess.textContent = '';
      catalogForm.reset();
      openModal(catalogModal);
    }

    function openProperty(apartment) {
      propertyImage.src = apartment.image_path || '';
      propertyTitle.textContent = apartment.type_name || 'Apartment';
      propertyArea.textContent = apartment.area || '—';
      propertyRooms.textContent = apartment.rooms || '—';
      propertyPrice.textContent = apartment.price || '—';
      openModal(propertyModal);
    }

    document.querySelectorAll('[data-open-contact]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openContact();
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeAll));
    document.querySelectorAll('[data-close-property]').forEach((btn) => btn.addEventListener('click', closeAll));
    document.querySelectorAll('[data-close-catalog]').forEach((btn) => btn.addEventListener('click', closeAll));

    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeAll();
    });

    const propContactBtn = document.querySelector('[data-property-contact]');
    if (propContactBtn) propContactBtn.addEventListener('click', () => { closeAll(); openContact(); });
    const propCatalogBtn = document.querySelector('[data-property-catalog]');
    if (propCatalogBtn) propCatalogBtn.addEventListener('click', () => { closeAll(); openCatalog(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && anyOpen()) closeAll();
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.modal__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sent ✓';
      window.setTimeout(() => {
        closeAll();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Contact us';
        contactForm.reset();
        contactForm.querySelectorAll('.modal__field').forEach((f) => f.classList.remove('has-value'));
      }, 1200);
    });
    contactForm.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.closest('.modal__field');
        if (field) field.classList.toggle('has-value', Boolean(input.value));
      });
    });

    catalogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      catalogSuccess.textContent = 'Great! Check your email in a moment.';
      catalogForm.reset();
    });

    return { openContact, openCatalog, openProperty };
  }

  function boot() {
    initHeader();
    initHero();
    initGallery();

    const modals = initModals();
    initApartments({
      onOpenProperty: modals.openProperty,
      onOpenCatalog: modals.openCatalog,
    });

    initReveal('[data-reveal]', { amount: 0.2 });

    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const maxTilt = Number(el.dataset.tiltMax) || 8;
      initTilt(el, { maxTilt, scaleOn: 1.02 });
    });

    initMagnetic(document.getElementById('btnContact'), 0.16);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
