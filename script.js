// мобильное меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
if (burger && nav) {
  burger.addEventListener('click', () => nav.classList.toggle('is-open'));
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('is-open'))
  );
}

// ===== ФОРМА + МОДАЛКА =====
const form = document.getElementById('leadForm');
const modal = document.getElementById('modal');

if (form && modal) {
  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    openModal();
  });
}

// ============ ПОДГОНКА ЛОГОТИПА ============
function fitLogo() {
  document.querySelectorAll('.logo').forEach(logo => {
    const main = logo.querySelector('.logo__main');
    const sub  = logo.querySelector('.logo__sub');
    if (!main || !sub) return;

    sub.style.fontSize = '';
    sub.style.letterSpacing = '0px';

    const baseSize = parseFloat(getComputedStyle(main).fontSize);
    sub.style.fontSize = baseSize + 'px';

    const wMain = main.offsetWidth;
    const wSub  = sub.offsetWidth;
    if (!wSub) return;

    sub.style.fontSize = (baseSize * (wMain / wSub)) + 'px';
  });
}

fitLogo();
window.addEventListener('resize', fitLogo);
window.addEventListener('load', fitLogo);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(fitLogo);
}

// ===== FAQ — плавное открытие + клик по всему блоку =====
document.querySelectorAll('.faq details').forEach(details => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.faq__content');
  if (!summary || !content) return;

  if (details.hasAttribute('open')) {
    content.style.height = 'auto';
  }

  function toggle() {
    if (details.dataset.animating === '1') return;
    details.dataset.animating = '1';

    if (details.open) {
      const startHeight = content.scrollHeight;
      content.style.height = startHeight + 'px';
      content.offsetHeight;

      content.style.transition = 'height 0.35s ease';
      content.style.height = '0px';

      const onClose = () => {
        content.removeEventListener('transitionend', onClose);
        details.removeAttribute('open');
        content.style.transition = '';
        content.style.height = '0';
        details.dataset.animating = '0';
      };
      content.addEventListener('transitionend', onClose);
    } else {
      details.setAttribute('open', '');
      content.style.transition = '';
      content.style.height = '0px';
      content.offsetHeight;

      const targetHeight = content.scrollHeight;
      content.style.transition = 'height 0.35s ease';
      content.style.height = targetHeight + 'px';

      const onOpen = () => {
        content.removeEventListener('transitionend', onOpen);
        content.style.transition = '';
        content.style.height = 'auto';
        details.dataset.animating = '0';
      };
      content.addEventListener('transitionend', onOpen);
    }
  }

  summary.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });

  content.addEventListener('click', (e) => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    if (e.target.closest('a, button')) return;
    toggle();
  });
});

// ===== МОДАЛКА ПРЕДМЕТОВ =====
const subjectModal = document.getElementById('subjectModal');
const subjectModalTitle = document.getElementById('subjectModalTitle');
const subjectModalText = document.getElementById('subjectModalText');
const subjectModalIcon = document.getElementById('subjectModalIcon');
const subjectModalBtn = document.getElementById('subjectModalBtn');

// ===== ВЫБОР ПРЕДМЕТА + МОДАЛКА =====
const selectedSubjects = new Set();
let currentSubjectCard = null;

// надпись на кнопке в модалке
function updateModalButton(card) {
  if (!subjectModalBtn || !card) return;
  const name = card.dataset.subject;
  const isSelected = selectedSubjects.has(name);
  subjectModalBtn.querySelector('span').textContent =
    isSelected ? 'Убрать предмет' : 'Выбрать предмет';
}

if (subjectModal) {
  window.openSubjectModal = function(title, desc, iconClass) {
    subjectModalTitle.textContent = title;
    subjectModalText.textContent = desc;
    subjectModalIcon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

    subjectModal.classList.add('is-open');
    subjectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateModalButton(currentSubjectCard);
  };

  window.closeSubjectModal = function() {
    subjectModal.classList.remove('is-open');
    subjectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.subject').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      currentSubjectCard = card;
      const title = card.dataset.subject;
      const desc = card.dataset.desc;
      const icon = card.dataset.icon;
      if (title && desc) openSubjectModal(title, desc, icon);
    });
  });

  subjectModal.querySelectorAll('[data-close-subject]').forEach(el => {
    el.addEventListener('click', closeSubjectModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && subjectModal.classList.contains('is-open')) {
      closeSubjectModal();
    }
  });

  if (subjectModalBtn) {
    subjectModalBtn.addEventListener('click', () => {
      if (!currentSubjectCard) return;

      const name = currentSubjectCard.dataset.subject;

      if (selectedSubjects.has(name)) {
        selectedSubjects.delete(name);
        currentSubjectCard.classList.remove('subject--selected');
      } else {
        selectedSubjects.add(name);
        currentSubjectCard.classList.add('subject--selected');
      }

      closeSubjectModal();
      syncFormSubjectSelect();
    });
  }
}

// ===== ОБНОВЛЕНИЕ БЛОКА ВЫБРАННЫХ ПРЕДМЕТОВ В ФОРМЕ =====
const formSubjectInput = document.getElementById('formSubjectInput');
// ===== ССЫЛКА НА БЛОК ВЫБРАННЫХ ПРЕДМЕТОВ =====
const formSubjects = document.getElementById('formSubjects');

function syncFormSubjectSelect() {
  if (!formSubjects || !formSubjectInput) return;

  formSubjects.innerHTML = '';

  if (selectedSubjects.size === 0) {
    const empty = document.createElement('span');
    empty.className = 'form__subjects-empty';
    empty.textContent = 'Выберите предметы';
    formSubjects.appendChild(empty);
    formSubjectInput.value = '';
    return;
  }

  selectedSubjects.forEach(name => {
    const tag = document.createElement('span');
    tag.className = 'form__subjects-tag';
    tag.textContent = name;
    formSubjects.appendChild(tag);
  });

  formSubjectInput.value = [...selectedSubjects].join(', ');
}

// ===== КЛИК ПО БЛОКУ В ФОРМЕ → СКРОЛЛ К ПРЕДМЕТАМ =====
if (formSubjects) {
  formSubjects.addEventListener('click', () => {
    const subjectsSection = document.getElementById('subjects');
    if (!subjectsSection) return;

    const headerHeight = 68;
    const targetRect = subjectsSection.getBoundingClientRect();
    const targetHeight = targetRect.height;
    const windowHeight = window.innerHeight;

    let offset;
    if (targetHeight < windowHeight - headerHeight) {
      offset = targetRect.top + window.scrollY
             - (windowHeight - targetHeight) / 2;
    } else {
      offset = targetRect.top + window.scrollY - headerHeight - 24;
    }

    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
}

// ============================================================
// МОБИЛЬНАЯ ВЕРСИЯ
// ============================================================
function applyMobileVersion() {
  const isMobile = window.innerWidth <= 720;

  // если не мобилка — выходим (на всякий случай откатывать не нужно)
  if (!isMobile) return;

  // помечаем body — CSS будет опираться на этот класс
  document.body.classList.add('is-mobile');

  // ---------- 1. HEADER — оставляем только лого + бургер ----------
  const headerBtn = document.querySelector('.header .btn');
  if (headerBtn) headerBtn.style.display = 'none';

  // ---------- 2. BENTO ----------

  // 2.1 Меняем метку «Онлайн · 14–20 лет · Живые уроки…» на «Lumen Academy»
  const bigLabel = document.querySelector('.bento__item--big .bento__label');
  if (bigLabel) bigLabel.textContent = 'Lumen Academy';

  // 2.2 Короткий текст в большой карточке
  const bigLead = document.querySelector('.bento__item--big .bento__lead');
  if (bigLead) {
    bigLead.innerHTML = `
      Онлайн-школа для подростков 14–20 лет. Готовим к ОГЭ, ЕГЭ
      и поступлению. Только личные занятия с наставником, один на один.
    `;
  }

  // 2.3 Короткие описания в остальных bento-карточках
  const shortDescs = {
    'accent': 'Отдельный предмет: исследование, текст, защита.',
    'default': 'Живые уроки 1×1, не записи. Расписание под ученика.'
  };

  document.querySelectorAll('.bento__item').forEach(item => {
    if (item.classList.contains('bento__item--big')) return;
    if (item.classList.contains('bento__photo')) return;

    const desc = item.querySelector('.bento__desc');
    if (!desc) return;

    if (item.classList.contains('bento__item--accent')) {
      desc.textContent = shortDescs.accent;
    } else {
      // оставляем как есть, если это карточка «Формат»/«Старт»
      // (там уже есть описания), но сокращаем если длинные
      if (desc.textContent.length > 100) {
        desc.textContent = shortDescs.default;
      }
    }
  });

  // 2.4 Удаляем фото-блок в bento
  const bentoPhoto = document.querySelector('.bento__photo');
  if (bentoPhoto) bentoPhoto.remove();

  // ---------- 3. Удаляем MARQUEE ----------
  const marquee = document.querySelector('.marquee');
  if (marquee) marquee.remove();

  // ---------- 4. FAQ — удаляем фото ----------
  const faqPhoto = document.querySelector('.faq__photo');
  if (faqPhoto) faqPhoto.remove();

  // ---------- 5. FOOTER — убираем ссылки ----------
  const footerLinks = document.querySelector('.footer__links');
  if (footerLinks) footerLinks.remove();

  // ---------- 6. Модалка предмета — сокращаем ----------
  // (размер регулируется в CSS, тут только текст если нужно)
}

// запускаем при загрузке
applyMobileVersion();

// если пользователь меняет размер окна — перезагружаем страницу,
// чтобы откатить или применить мобильную версию заново
let lastMobile = window.innerWidth <= 720;
window.addEventListener('resize', () => {
  const nowMobile = window.innerWidth <= 720;
  if (nowMobile !== lastMobile) {
    location.reload();
  }
});