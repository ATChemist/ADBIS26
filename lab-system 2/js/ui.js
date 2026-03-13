/**
 * ui.js  –  Shared UI utilities: Toast & Modal
 * LabSystem · Herlev Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   TOAST
──────────────────────────────────────────── */

const TOAST_BORDER = { blue: '',               red: ' toast-red', green: ' toast-green', amber: ' toast-amber' };
const TOAST_ICON   = { blue: 'ℹ️', red: '⚠️', green: '✓',        amber: '⚡' };

/**
 * Show a toast notification.
 * @param {string} title
 * @param {string} [body]
 * @param {'blue'|'red'|'green'|'amber'} [type]
 * @param {Function|null} [undoCallback]  – If provided, shows a "Fortryd" button.
 *   The caller is responsible for deferring the actual action; calling undoCallback
 *   signals that the user wants to cancel it.
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
    // Store callback on element for the undo button
    const uid = Date.now() + Math.random();
    el.dataset.uid = uid;
    // Re-render undo button with correct id now that el is in DOM
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
 * Dismiss (animate out + remove) a toast element.
 * @param {HTMLElement} el
 */
function dismissToast(el) {
  if (!el?.parentNode) return;
  el.classList.add('toast-fade');
  setTimeout(() => el.remove(), 300);
}

/* ────────────────────────────────────────────
   MODAL
──────────────────────────────────────────── */

/**
 * Open a modal by its DOM id.
 * @param {string} id
 */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

/**
 * Close a modal by its DOM id.
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-backdrop').forEach(mb => {
    mb.addEventListener('click', e => {
      if (e.target === mb) mb.classList.remove('open');
    });
  });
});
