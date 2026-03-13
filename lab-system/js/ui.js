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
 */
function toast(title, body = '', type = 'blue', undoCallback = null) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast-item' + (TOAST_BORDER[type] ?? '');
  el.innerHTML = `
    <div class="toast-icon">${TOAST_ICON[type] ?? 'ℹ️'}</div>
    <div class="toast-body">
      <div class="toast-title-t">${title}</div>
      ${body ? `<div class="toast-sub">${body}</div>` : ''}
    </div>
    <button class="toast-close-btn" aria-label="Luk" onclick="dismissToast(this.closest('.toast-item'))">×</button>`;

  if (undoCallback) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-ghost btn-sm toast-undo-btn';
    undoBtn.style.cssText = 'margin-left:auto; font-weight:600; color:var(--blue-600); text-decoration:underline; cursor:pointer; background:none; border:none; padding:0.25rem 0.5rem;';
    undoBtn.textContent = 'Fortryd';
    undoBtn.addEventListener('click', () => {
      undoCallback();
      dismissToast(el);
    });
    el.querySelector('.toast-body').appendChild(undoBtn);
  }

  container.appendChild(el);
  const autoTimer = setTimeout(() => dismissToast(el), undoCallback ? 5500 : 4500);
  el._autoTimer = autoTimer;
  return el;
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
