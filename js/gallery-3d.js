/* Standalone gallery: no WebGL, CDN imports, or network dependency. */
const IMAGE_SOURCES = [
  './img/gallery-left.jpg',
  './img/gallery-main.jpg',
  './img/gallery-right.jpg',
  './img/gallery-1.jpg',
  './img/gallery-2.jpg',
  './img/gallery-3.jpg'
];

class Gallery3D {
  constructor(viewport, loadingEl, gallery__dotsContainer, prevBtn, nextBtn, sliderEl) {
    this.viewport = viewport;
    this.loadingEl = loadingEl;
    this.gallery__dotsContainer = gallery__dotsContainer;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.sliderEl = sliderEl;
    this.currentIndex = 0;
    this.startX = 0;
    this.dragOffset = 0;
    this.isDragging = false;
    this.autoplayTimer = null;
    this.cards = [];
    this.gallery__dots = [];

    this.build();
    this.bindEvents();
    this.render();
    this.hideLoading();
    this.startAutoplay();
  }

  build() {
    const canvas = this.viewport.querySelector('#galleryCanvas');
    if (canvas) canvas.hidden = true;

    this.stage = document.createElement('div');
    this.stage.className = 'gallery-stage';
    this.stage.setAttribute('role', 'list');
    this.viewport.appendChild(this.stage);

    IMAGE_SOURCES.forEach((source, index) => {
      const card = document.createElement('figure');
      card.className = 'gallery-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', `Gallery image ${index + 1} of ${IMAGE_SOURCES.length}`);

      const image = document.createElement('img');
      image.src = source;
      image.alt = `Nice View gallery image ${index + 1}`;
      image.draggable = false;
      image.addEventListener('error', () => card.classList.add('gallery-card--missing'));
      card.appendChild(image);
      card.addEventListener('click', () => {
        if (!this.isDragging) this.goTo(index);
      });

      this.stage.appendChild(card);
      this.cards.push(card);

      const gallery__gallery__dot = document.createElement('button');
      gallery__gallery__dot.type = 'button';
      gallery__gallery__dot.className = 'gallery__gallery__dot';
      gallery__gallery__dot.setAttribute('aria-label', `Show image ${index + 1}`);
      gallery__gallery__dot.addEventListener('click', () => this.goTo(index));
      this.gallery__dotsContainer.appendChild(gallery__gallery__dot);
      this.gallery__dots.push(gallery__gallery__dot);
    });
  }

  bindEvents() {
    this.nextBtn?.addEventListener('click', () => this.next());
    this.prevBtn?.addEventListener('click', () => this.prev());

    this.viewport.addEventListener('pointerdown', (event) => {
      this.isDragging = true;
      this.startX = event.clientX;
      this.dragOffset = 0;
      this.viewport.setPointerCapture?.(event.pointerId);
      this.stopAutoplay();
      this.stage.classList.add('is-dragging');
    });

    this.viewport.addEventListener('pointermove', (event) => {
      if (!this.isDragging) return;
      this.dragOffset = event.clientX - this.startX;
      this.stage.style.setProperty('--drag-x', `${this.dragOffset}px`);
    });

    const finishDrag = () => {
      if (!this.isDragging) return;
      const threshold = Math.min(90, this.viewport.clientWidth * 0.12);
      if (this.dragOffset > threshold) this.prev();
      if (this.dragOffset < -threshold) this.next();
      this.isDragging = false;
      this.dragOffset = 0;
      this.stage.style.setProperty('--drag-x', '0px');
      this.stage.classList.remove('is-dragging');
      this.startAutoplay();
    };

    this.viewport.addEventListener('pointerup', finishDrag);
    this.viewport.addEventListener('pointercancel', finishDrag);
    this.viewport.addEventListener('pointerleave', (event) => {
      if (event.buttons) finishDrag();
    });
    this.viewport.addEventListener('mouseenter', () => this.stopAutoplay());
    this.viewport.addEventListener('mouseleave', () => {
      if (!this.isDragging) this.startAutoplay();
    });

    this.sliderEl?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') this.next();
      if (event.key === 'ArrowLeft') this.prev();
    });
  }

  getOffset(index) {
    const count = this.cards.length;
    let offset = index - this.currentIndex;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  }

  render() {
    this.cards.forEach((card, index) => {
      const offset = this.getOffset(index);
      const distance = Math.abs(offset);
      card.style.setProperty('--translate-x', `${offset * 52}%`);
      card.style.setProperty('--translate-z', `${distance * -155}px`);
      card.style.setProperty('--rotate-y', `${offset * -17}deg`);
      card.style.setProperty('--card-scale', String(1 - distance * 0.13));
      card.style.setProperty('--card-opacity', String(Math.max(0, 1 - distance * 0.28)));
      card.style.setProperty('--card-saturation', String(Math.max(0.25, 1 - distance * 0.22)));
      card.style.setProperty('--card-brightness', String(Math.max(0.45, 1 - distance * 0.1)));
      card.classList.toggle('is-active', offset === 0);
      card.setAttribute('aria-hidden', String(offset !== 0));
    });
    this.gallery__dots.forEach((gallery__gallery__dot, index) => gallery__gallery__dot.classList.toggle('active', index === this.currentIndex));
  }

  goTo(index) {
    this.currentIndex = (index + this.cards.length) % this.cards.length;
    this.render();
  }

  next() { this.goTo(this.currentIndex + 1); }
  prev() { this.goTo(this.currentIndex - 1); }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = window.setInterval(() => this.next(), 5000);
  }

  stopAutoplay() {
    if (this.autoplayTimer) window.clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }

  hideLoading() {
    if (!this.loadingEl) return;
    this.loadingEl.classList.add('is-hidden');
    window.setTimeout(() => this.loadingEl.remove(), 450);
  }
}

function initGallery() {
  const viewport = document.getElementById('galleryViewport');
  const loadingEl = document.getElementById('galleryLoading');
  const gallery__dotsContainer = document.getElementById('galleryDots');
  if (!viewport || !gallery__dotsContainer) return;

  try {
    new Gallery3D(
      viewport,
      loadingEl,
      gallery__dotsContainer,
      document.querySelector('.gallery__control--prev'),
      document.querySelector('.gallery__control--next'),
      document.getElementById('gallerySlider')
    );
  } catch (error) {
    console.error('Gallery initialization failed:', error);
    if (loadingEl) {
      loadingEl.textContent = 'Gallery could not be displayed.';
      loadingEl.classList.remove('is-hidden');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery, { once: true });
} else {
  initGallery();
}
