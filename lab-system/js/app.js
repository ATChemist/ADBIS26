/**
 * app.js  –  Application entry point
 * Handles login, page routing, and the live clock.
 * LabSystem · Hillerød Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   GLOBAL APP STATE
──────────────────────────────────────────── */

let currentRole = 'planner'; // 'planner' | 'worker'
let currentUser = '';        // Full name of the logged-in user

const DEV_PREVIEW_STORAGE_KEY = 'labSystem.devPhonePreview';
const DEV_PREVIEW_HOSTS = new Set(['', '127.0.0.1', '::1', 'localhost']);

/* ────────────────────────────────────────────
   DEV PREVIEW
──────────────────────────────────────────── */

function shouldShowDevPreviewToggle() {
  const params = new URLSearchParams(window.location.search);
  return window.location.protocol === 'file:'
    || DEV_PREVIEW_HOSTS.has(window.location.hostname)
    || params.get('dev') === '1';
}

function readDevPreviewPreference() {
  try {
    return window.localStorage.getItem(DEV_PREVIEW_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDevPreviewPreference(enabled) {
  try {
    window.localStorage.setItem(DEV_PREVIEW_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Ignore storage issues in restrictive browser contexts.
  }
}

function setDevPhonePreview(enabled) {
  document.body.classList.toggle('dev-phone-preview', enabled);

  const toggle = document.getElementById('dev-preview-toggle');
  const mode = document.getElementById('dev-preview-toggle-mode');

  if (toggle) {
    toggle.classList.toggle('is-active', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
  }
  if (mode) {
    mode.textContent = enabled ? 'Desktop' : 'Telefon';
  }

  writeDevPreviewPreference(enabled);
}

function toggleDevPhonePreview() {
  setDevPhonePreview(!document.body.classList.contains('dev-phone-preview'));
}

function initDevPreview() {
  const toggle = document.getElementById('dev-preview-toggle');
  if (!toggle) return;

  const enabled = shouldShowDevPreviewToggle();
  toggle.classList.toggle('hidden', !enabled);

  if (!enabled) {
    document.body.classList.remove('dev-phone-preview');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  setDevPhonePreview(params.get('phone') === '1' || readDevPreviewPreference());
}

/* ────────────────────────────────────────────
   LOGIN
──────────────────────────────────────────── */

/**
 * Toggle between planner and worker role tiles.
 * @param {'planner'|'worker'} role
 */
function setRole(role) {
  currentRole = role;
  document.getElementById('rt-plan').classList.toggle('sel',   role === 'planner');
  document.getElementById('rt-worker').classList.toggle('sel', role === 'worker');

  const sel = document.getElementById('login-user-sel');
  sel.innerHTML = role === 'planner'
    ? PLANNER_USERS.map(u => `<option>${u.name}</option>`).join('')
    : WORKER_USERS.map(u  => `<option>${u.name}</option>`).join('');
}

/** Handle the login button click. */
function doLogin() {
  currentUser = document.getElementById('login-user-sel').value;

  // Derive initials and avatar class
  const parts    = currentUser.split(' ');
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const short    = `${parts[0]} ${parts[1] ?? ''}`.trim();

  // Switch views
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-app').style.display   = 'block';

  // Topbar
  document.getElementById('topbar-av').textContent    = initials;
  document.getElementById('topbar-uname').textContent = short;

  if (currentRole === 'planner') {
    const plannerUser = PLANNER_USERS.find(u => u.name === currentUser);
    document.getElementById('topbar-av').className       = `topbar-avatar ${plannerUser?.avClass ?? 'av-blue'}`;
    document.getElementById('topbar-page-label').textContent = 'Planlægger';
    showPage('planner-page');
    renderPlannerTasks();
    renderStaff();
    updateStats();
    renderActivityLog();

  } else {
    const staffMember = STAFF.find(s => s.name === currentUser);
    document.getElementById('topbar-av').className       = `topbar-avatar ${staffMember?.avClass ?? 'av-blue'}`;
    document.getElementById('topbar-page-label').textContent = 'Prøvetager';

    // Populate worker profile sidebar
    document.getElementById('worker-av-large').textContent = initials;
    document.getElementById('worker-av-large').className   = `worker-av-large ${staffMember?.avClass ?? 'av-blue'}`;
    document.getElementById('worker-full-name').textContent = short;

    // Populate competence tags
    const tagRow = document.getElementById('comp-tag-row');
    tagRow.innerHTML = (staffMember?.competences ?? [])
      .map(c => `<span class="comp-tag">${c}</span>`).join('');

    showPage('worker-page');
    initWorkerPage(currentUser);
  }

  startClock();
}

/** Handle the logout button. */
function doLogout() {
  document.getElementById('view-app').style.display   = 'none';
  document.getElementById('view-login').style.display = 'flex';
  stopClock();

  // Reset role selector to planner defaults
  setRole('planner');
}

/* ────────────────────────────────────────────
   PAGE ROUTING
──────────────────────────────────────────── */

/**
 * Show a specific page within the app shell.
 * @param {'planner-page'|'worker-page'} pageId
 */
function showPage(pageId) {
  ['planner-page', 'worker-page'].forEach(id => {
    document.getElementById(id).style.display = id === pageId ? 'block' : 'none';
  });
}

/* ────────────────────────────────────────────
   LIVE CLOCK
──────────────────────────────────────────── */

let _clockInterval = null;

function startClock() {
  const el  = document.getElementById('topbar-clock');
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const n = new Date();
    el.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
  };
  tick();
  _clockInterval = setInterval(tick, 15_000);
}

function stopClock() {
  clearInterval(_clockInterval);
  _clockInterval = null;
}

/* ────────────────────────────────────────────
   BOOTSTRAP
──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initDevPreview();

  // Set today's date in planner header
  document.getElementById('planner-date').textContent =
    new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });

  // Pre-populate login user select with planner users
  setRole('planner');
});
