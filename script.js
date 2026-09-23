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

// ===== ВЫБОР ПРЕДМЕТА + ЦЕНА =====
const PRICE_PER_SUBJECT = 1200;
const selectedSubjects = new Set();
let currentSubjectCard = null;

// скидка в зависимости от количества предметов
function getDiscount(count) {
  if (count >= 4) return 0.15;
  if (count === 3) return 0.10;
  if (count === 2) return 0.05;
  return 0;
}

const priceValue    = document.getElementById('priceValue');
const priceOld      = document.getElementById('priceOld');
const priceDiscount = document.getElementById('priceDiscount');
const priceHint     = document.getElementById('priceHint');

function updateTotal() {
  if (!priceValue) return;

  const count = selectedSubjects.size;
  const baseTotal = count * PRICE_PER_SUBJECT;
  const discount = getDiscount(count);
  const finalTotal = Math.round(baseTotal * (1 - discount));

  priceValue.textContent = finalTotal.toLocaleString('ru-RU');

  if (discount > 0 && priceOld && priceDiscount) {
    priceOld.hidden = false;
    priceOld.textContent = baseTotal.toLocaleString('ru-RU') + ' ₽';

    priceDiscount.hidden = false;
    priceDiscount.textContent = '−' + Math.round(discount * 100) + '%';
  } else if (priceOld && priceDiscount) {
    priceOld.hidden = true;
    priceDiscount.hidden = true;
  }

  if (priceHint) {
    if (count === 0) {
      priceHint.textContent = 'Выберите предметы, чтобы рассчитать стоимость';
      priceHint.classList.remove('is-active');
    } else {
      priceHint.textContent = `Выбрано предметов: ${count}`;
      priceHint.classList.add('is-active');
    }
  }
  syncFormSubjectSelect();
}

// надпись на кнопке в модалке
function updateModalButton(card) {
  if (!subjectModalBtn || !card) return;
  const name = card.dataset.subject;
  const isSelected = selectedSubjects.has(name);
  subjectModalBtn.querySelector('span').textContent =
    isSelected ? 'Убрать предмет' : 'Выбрать предмет';
}

// модалка предмета
if (subjectModal) {
  function openSubjectModal(title, desc, iconClass) {
    subjectModalTitle.textContent = title;
    subjectModalText.textContent = desc;
    subjectModalIcon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

    subjectModal.classList.add('is-open');
    subjectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    updateModalButton(currentSubjectCard);
  }

  function closeSubjectModal() {
    subjectModal.classList.remove('is-open');
    subjectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // клик по карточке предмета — открыть модалку
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

  // закрытие
  subjectModal.querySelectorAll('[data-close-subject]').forEach(el => {
    el.addEventListener('click', closeSubjectModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && subjectModal.classList.contains('is-open')) {
      closeSubjectModal();
    }
  });

  // кнопка «Выбрать / Убрать предмет»
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
      updateTotal();
    });
  }
}

// ===== ЗАПОЛНЕНИЕ БЛОКА ВЫБРАННЫХ ПРЕДМЕТОВ =====
const formSubjects = document.getElementById('formSubjects');
const formSubjectInput = document.getElementById('formSubjectInput');

function syncFormSubjectSelect() {
  if (!formSubjects || !formSubjectInput) return;

  // очищаем блок
  formSubjects.innerHTML = '';

  // если ничего не выбрано — заглушка
  if (selectedSubjects.size === 0) {
    const empty = document.createElement('span');
    empty.className = 'form__subjects-empty';
    empty.textContent = 'Выберите предметы';
    formSubjects.appendChild(empty);

    formSubjectInput.value = '';
    return;
  }

  // выводим теги с названиями
  selectedSubjects.forEach(name => {
    const tag = document.createElement('span');
    tag.className = 'form__subjects-tag';
    tag.textContent = name;
    formSubjects.appendChild(tag);
  });

  // отправляемое значение — через запятую
  formSubjectInput.value = [...selectedSubjects].join(', ');
}

// ===== КЛИК ПО БЛОКУ В ФОРМЕ → СКРОЛЛ К ПРЕДМЕТАМ =====
if (formSubjects) {   // ← без const, переменная уже есть выше
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