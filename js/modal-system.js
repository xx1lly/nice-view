(() => {
  'use strict';

  const propertyModal = document.getElementById('propertyModal');
  const catalogModal = document.getElementById('catalogModal');
  const contactModal = document.getElementById('contactModal');
  let lastFocusedElement = null;

  const openModal = (modal) => {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-modal');
    modal.querySelector('button, input')?.focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.property-modal.is-open, .catalog-modal.is-open, .modal.is-open')) {
      document.body.classList.remove('has-modal');
    }
    lastFocusedElement?.focus?.();
  };

  const openProperty = (card) => {
    if (!propertyModal) return;
    propertyModal.querySelector('#propertyModalTitle').textContent = card.dataset.apartmentType || 'Apartment';
    propertyModal.querySelector('#propertyModalArea').textContent = card.dataset.apartmentArea || '—';
    propertyModal.querySelector('#propertyModalRooms').textContent = card.dataset.apartmentRooms || '—';
    propertyModal.querySelector('#propertyModalPrice').textContent = card.dataset.apartmentPrice || '—';
    const image = propertyModal.querySelector('#propertyModalImage');
    image.src = card.dataset.apartmentImage || '';
    image.alt = `${card.dataset.apartmentType || 'Apartment'} plan`;
    openModal(propertyModal);
  };

  document.addEventListener('click', (event) => {
    const apartmentCard = event.target.closest('.apartment-card');
    if (apartmentCard && !event.target.closest('a, button')) openProperty(apartmentCard);
    if (event.target.closest('[data-modal__close]')) closeModal(propertyModal);
    if (event.target.closest('[data-catalog-close]')) closeModal(catalogModal);
    if (event.target.closest('.js-open-contact')) {
      closeModal(propertyModal);
      contactModal?.classList.add('is-open');
      contactModal?.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-modal');
      contactModal?.querySelector('input')?.focus();
    }
    if (event.target.closest('[data-open-catalog]')) {
      closeModal(propertyModal);
      openModal(catalogModal);
    }
  });

  document.querySelectorAll('.apartments__button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(catalogModal);
    });
  });

  document.getElementById('catalogForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = catalogModal.querySelector('.catalog-modal__success');
    message.textContent = 'Great! Check your email in a moment.';
    form.reset();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeModal(propertyModal);
    closeModal(catalogModal);
  });
})();
