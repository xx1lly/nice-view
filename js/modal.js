document.addEventListener('DOMContentLoaded', () => {
  const openMenuBtn = document.querySelector('.header__mobile-btn');
  const closeMenuBtn = document.getElementById('mobileMenuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.header__mobile-link');

  // Відкриття меню при кліку на бургер
  if (openMenuBtn && mobileMenu) {
    openMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('is-open');
    });
  }

  // Закриття меню при кліку на хрестик
  if (closeMenuBtn && mobileMenu) {
    closeMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
    });
  }

  // Закриття меню при кліку на будь-яке посилання в ньому
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const contactForm = document.getElementById('contactForm');

  const contactButtons = document.querySelectorAll('.header__button, .hero__button, .header__mobile-link, .contact__button');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  contactButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!btn.classList.contains('submit-btn') && !btn.classList.contains('modal__submit')) {
        e.preventDefault();
        openModal();
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.modal__submit');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.textContent = 'Sent ✓';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        closeModal();
        contactForm.reset();
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }, 1200);
    });
  }
});