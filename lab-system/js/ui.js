/**
 * ui.js  –  Fælles hjælpefunktioner til brugerfladen
 * Filen samler logik til små statusbeskeder og modaler, som bruges flere steder i systemet.
 * LabSystem · Hillerød Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   SMÅ STATUSBESKEDER
──────────────────────────────────────────── */

const TOAST_BORDER = { blue: '',               red: ' toast-red', green: ' toast-green', amber: ' toast-amber' };
const TOAST_ICON   = { blue: 'ℹ️', red: '⚠️', green: '✓',        amber: '⚡' };

/**
 * Viser en lille besked i hjørnet af skærmen.
 * @param {string} title
 * @param {string} [body]
 * @param {'blue'|'red'|'green'|'amber'} [type]
 * @param {Function|null} [undoCallback] – Hvis funktionen findes, vises en "Fortryd"-knap.
 *   Den kaldende kode skal selv vente med at låse handlingen fast; et kald til
 *   undoCallback betyder blot, at brugeren vil annullere den planlagte ændring.
 */
function toast(title, body = '', type = 'blue', undoCallback = null) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast-item' + (TOAST_BORDER[type] ?? '');

  const undoHtml = undoCallback
    ? `<button class="toast-undo-btn" onclick="(function(e){e.stopPropagation();window.__toastUndo_${el.dataset.uid=Date.now()}&&window.__toastUndo_${el.dataset.uid}();})(event)">Fortryd</button>`
    : '';

  el.innerHTML = `
    <div class="toast-icon">${TOAST_ICON[type] ?? 'ℹ️'}</div>
    <div class="toast-body">
      <div class="toast-title-t">${title}</div>
      ${body ? `<div class="toast-sub">${body}</div>` : ''}
      ${undoCallback ? `<button class="toast-undo-btn" id="toast-undo-${el.dataset.uid}">Fortryd</button>` : ''}
    </div>
    <button class="toast-close-btn" aria-label="Luk" onclick="dismissToast(this.closest('.toast-item'))">×</button>`;

  container.appendChild(el);

  if (undoCallback) {
    // Gem fortryd-handlingen sammen med den viste besked, så den rigtige funktion kaldes ved klik.
    const uid = Date.now() + Math.random();
    el.dataset.uid = uid;
    // Knyt først klikhåndteringen til knappen, når elementet faktisk findes i DOM'en.
    const undoBtn = el.querySelector('.toast-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        undoCallback();
        dismissToast(el);
      });
    }
    setTimeout(() => dismissToast(el), 5500);
  } else {
    setTimeout(() => dismissToast(el), 4500);
  }
}

/**
 * Fjerner beskeden ved først at afspille dens fade-out-animation.
 * @param {HTMLElement} el
 */
function dismissToast(el) {
  if (!el?.parentNode) return;
  el.classList.add('toast-fade');
  setTimeout(() => el.remove(), 300);
}

/* ────────────────────────────────────────────
   MODALER
──────────────────────────────────────────── */

/**
 * Åbner en modal ud fra dens DOM-id.
 * @param {string} id
 */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

/**
 * Lukker en modal ud fra dens DOM-id.
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Luk modalen, når brugeren klikker uden for selve indholdsboksen.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-backdrop').forEach(mb => {
    mb.addEventListener('click', e => {
      if (e.target === mb) mb.classList.remove('open');
    });
  });
});

// For akut-modalen blokeres Escape, så den kræver et tydeligt aktivt valg fra brugeren.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const akutModal = document.getElementById('modal-akut-worker');
    if (akutModal?.classList.contains('open')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
});
