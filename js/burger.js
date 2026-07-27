document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const links = menu?.querySelectorAll('.header__mobile-link') || [];
  const contact = menu?.querySelector('[data-mobile-contact]');
  let returnFocusTo = null;

  if (!toggle || !menu || !overlay) return;

  const openMenu = () => {
    returnFocusTo = document.activeElement;
    toggle.classList.add('is-active');
    menu.classList.add('is-open');
    overlay.classList.add('is-active');
    document.body.classList.add('is-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    menu.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => links[0]?.focus(), 220);
  };

  const closeMenu = () => {
    toggle.classList.remove('is-active');
    menu.classList.remove('is-open');
    overlay.classList.remove('is-active');
    document.body.classList.remove('is-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    menu.setAttribute('aria-hidden', 'true');
  };

  toggle.addEventListener('click', () => menu.classList.contains('is-open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  links.forEach((link) => link.addEventListener('click', closeMenu));

  contact?.addEventListener('click', () => {
    closeMenu();
    document.querySelector('.header__button')?.click();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      returnFocusTo?.focus?.();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && menu.classList.contains('is-open')) closeMenu();
  }, { passive: true });
});
