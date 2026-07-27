from pathlib import Path
import re

files = [
    'index.html',
    'css/style.css',
    'js/burger.js',
    'js/apartments.js',
    'js/gallery-3d.js',
    'js/main.js',
    'js/modal-system.js',
    'js/magic-motion.js',
    'js/animation-fx.js',
    'js/modal.js',
]

mapping = {
    'main-header': 'header',
    'site-header': 'header',
    'logo': 'header__brand',
    'site-header__brand': 'header__brand',
    'nav-menu': 'header__nav',
    'site-header__nav': 'header__nav',
    'site-header__link': 'header__link',
    'header-btn': 'header__button',
    'site-header__cta': 'header__button',
    'burger-btn': 'header__burger',
    'site-header__menu-toggle': 'header__burger',
    'mobile-menu': 'header__mobile',
    'site-menu': 'header__mobile-panel',
    'site-menu__orb': 'header__mobile-orb',
    'site-menu__orb--one': 'header__mobile-orb--one',
    'site-menu__orb--two': 'header__mobile-orb--two',
    'site-menu__eyebrow': 'header__mobile-label',
    'mobile-nav': 'header__mobile-nav',
    'site-menu__nav': 'header__mobile-nav',
    'mobile-nav-link': 'header__mobile-link',
    'site-menu__link': 'header__mobile-link',
    'site-menu__cta': 'header__mobile-button',
    'site-menu__caption': 'header__mobile-text',
    'menu-overlay': 'header__overlay',
    'hero-section': 'hero',
    'hero-content': 'hero__content',
    'hero-title': 'hero__title',
    'hero-subtitle': 'hero__subtitle',
    'hero-btn': 'hero__button',
    'hero__cta': 'hero__button',
    'philosophy-stats': 'philosophy__stats',
    'stat-item': 'philosophy__stat',
    'stat-icon': 'philosophy__stat-icon',
    'stat-text': 'philosophy__stat-text',
    'philosophy-content': 'philosophy__content',
    'philosophy-title': 'philosophy__title',
    'philosophy-description': 'philosophy__text',
    'philosophy-section': 'philosophy',
    'philosophy-container': 'philosophy__inner',
    'apartments-section': 'apartments',
    'apartments-container': 'apartments__container',
    'apartments-main-title': 'apartments__title',
    'apartments-grid': 'apartments__grid',
    'apartments-loading': 'apartments__loading',
    'infrastructure-section': 'infrastructure',
    'infrastructure-container': 'infrastructure__container',
    'infrastructure-title': 'infrastructure__title',
    'infrastructure-visual': 'infrastructure__visual',
    'infrastructure-panel': 'infrastructure__panel',
    'infrastructure-row': 'infrastructure__row',
    'walk-badge': 'infrastructure__badge',
    'gallery-section': 'gallery',
    'gallery-section__container': 'gallery__inner',
    'gallery-slider': 'gallery__slider',
    'slider-btn--prev': 'gallery__control--prev',
    'slider-btn--next': 'gallery__control--next',
    'slider-btn': 'gallery__control',
    'gallery-viewport': 'gallery__viewport',
    'gallery-loading': 'gallery__loading',
    'gallery-loading-spinner': 'gallery__loading-spinner',
    'gallery-dots': 'gallery__dots',
    'dot': 'gallery__dot',
    'get-in-touch': 'contact',
    'contact-section__container': 'contact__container',
    'contact-section__title': 'contact__title',
    'contact-section__subtitle': 'contact__subtitle',
    'contact-card': 'contact__card',
    'contact-info': 'contact__info',
    'contact-item': 'contact__item',
    'contact-icon-wrap': 'contact__icon-wrap',
    'contact-icon': 'contact__icon',
    'btn-contact': 'contact__button',
    'modal-overlay': 'modal',
    'modal-content': 'modal__content',
    'modal-close': 'modal__close',
    'modal-title': 'modal__title',
    'modal-form': 'modal__form',
    'form-group': 'modal__field',
    'modal-submit-btn': 'modal__submit',
    'section-title': 'section__title',
    'section-subtitle': 'section__subtitle',
    'footer-container': 'footer__inner',
    'footer-logo': 'footer__brand',
    'footer-col': 'footer__column',
    'footer-title': 'footer__title',
    'footer-list': 'footer__list',
    'footer-socials': 'footer__social',
    'footer-bottom': 'footer__bottom',
    'footer-text': 'footer__text',
    'apartments-btn': 'apartments__button',
    'apartments-btn-wrap': 'apartments__actions',
    'card-shimmer-edge': 'apartment-card__shimmer',
    'apartment-img-wrap': 'apartment-card__image',
    'apartment-type': 'apartment-card__type',
    'apartment-area': 'apartment-card__area',
    'card-chroma-glow': 'apartment-card__glow',
}

sorted_keys = sorted(mapping.keys(), key=len, reverse=True)

def replace_text(text):
    new_text = text
    for key in sorted_keys:
        new_text = new_text.replace(key, mapping[key])
    return new_text


def clean_classes(text):
    return re.sub(r'(?<![A-Za-z0-9_-])([A-Za-z0-9_-]+)(?:\s+\1)+(?!(?:[A-Za-z0-9_-]))', r'\1', text)

for filename in files:
    path = Path(filename)
    if not path.exists():
        print('Missing file:', filename)
        continue
    content = path.read_text(encoding='utf-8')
    new_content = replace_text(content)
    new_content = clean_classes(new_content)
    if new_content != content:
        path.write_text(new_content, encoding='utf-8')
        print('Updated', filename)
    else:
        print('No changes in', filename)
