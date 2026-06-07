/**
 * app.js  –  Indgangspunkt for applikationen
 * Filen styrer indlogning, skift mellem sider og uret i toplinjen.
 * LabSystem · Hillerød Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   FÆLLES APP-TILSTAND
──────────────────────────────────────────── */

let currentRole = 'planner'; // Gemmer den valgte rolle internt: 'planner' eller 'worker'
let currentUser = '';        // Gemmer navnet på den bruger, der lige nu er logget ind

const DEV_PREVIEW_STORAGE_KEY = 'labSystem.devPhonePreview';
const DEV_PREVIEW_HOSTS = new Set(['', '127.0.0.1', '::1', 'localhost']);

/* ────────────────────────────────────────────
   UDVIKLERVISNING
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
    // Hvis browseren blokerer lagring, springer vi stille over uden at stoppe resten af appen.
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
   INDLOGNING
──────────────────────────────────────────── */

/**
 * Markerer den valgte rolle i indlogningsvisningen og opdaterer brugerlisten.
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

/** Logger brugeren ind og viser den side, der passer til den valgte rolle. */
function doLogin() {
  currentUser = document.getElementById('login-user-sel').value;

  // Udled initialer og vælg den rigtige avatar-klasse ud fra det valgte navn.
  const parts    = currentUser.split(' ');
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const short    = `${parts[0]} ${parts[1] ?? ''}`.trim();

  // Skjul indlogningen og vis selve applikationen.
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-app').style.display   = 'block';

  // Opdater toplinjen, så den viser den aktuelle bruger.
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

    // Udfyld prøvetagerens profilfelt i venstre side.
    document.getElementById('worker-av-large').textContent = initials;
    document.getElementById('worker-av-large').className   = `worker-av-large ${staffMember?.avClass ?? 'av-blue'}`;
    document.getElementById('worker-full-name').textContent = short;

    // Vis de kompetencer, som den valgte prøvetager har.
    const tagRow = document.getElementById('comp-tag-row');
    tagRow.innerHTML = (staffMember?.competences ?? [])
      .map(c => `<span class="comp-tag">${c}</span>`).join('');

    showPage('worker-page');
    initWorkerPage(currentUser);
  }

  startClock();
}

/** Logger brugeren ud og nulstiller visningen tilbage til indlogningssiden. */
function doLogout() {
  document.getElementById('view-app').style.display   = 'none';
  document.getElementById('view-login').style.display = 'flex';
  stopClock();

  // Gå tilbage til standardvalget, så næste indlogning starter som planlægger.
  setRole('planner');
}

/* ────────────────────────────────────────────
   SIDESKIFT
──────────────────────────────────────────── */

/**
 * Viser præcis én underside i app-rammen og skjuler den anden.
 * @param {'planner-page'|'worker-page'} pageId
 */
function showPage(pageId) {
  ['planner-page', 'worker-page'].forEach(id => {
    document.getElementById(id).style.display = id === pageId ? 'block' : 'none';
  });
}

/* ────────────────────────────────────────────
   KLOKKE I TOPLINJEN
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
   OPSTART
──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initDevPreview();

  // Skriv dags dato ind i overskriften på planlæggerens side.
  document.getElementById('planner-date').textContent =
    new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });

  // Start med at vise planlægger-brugerne i indlogningsfeltet.
  setRole('planner');
});
