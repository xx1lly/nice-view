const contactCard = document.getElementById('contactCard');
if (contactCard) {
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        contactObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  contactObserver.observe(contactCard);

  contactCard.addEventListener('mousemove', (e) => {
    const rect = contactCard.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    contactCard.style.setProperty('--card-mouse-x', `${x}%`);
    contactCard.style.setProperty('--card-mouse-y', `${y}%`);
  });
}

const btnContact = document.getElementById('btnContact');
if (btnContact) {
  btnContact.addEventListener('mousemove', (e) => {
    const rect = btnContact.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    btnContact.style.setProperty('--btn-mouse-x', `${x}%`);
  });
}