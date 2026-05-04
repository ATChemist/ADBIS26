/**
 * worker.js  –  Worker (prøvetager) page: state & rendering
 * LabSystem · Hillerød Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */

let workerBusy        = false;
let activeTaskId      = null;
let myDoneCount       = 0;
let wFilterMode       = 'alle'; // 'alle' | 'akut' | 'fremsk' | 'rutine'
let activeTaskStartTime = null; // Feature 4: timestamp when task was taken
let timerInterval     = null;   // Feature 4: setInterval handle
let workerDoneTarget  = null;   // id of task pending done-confirmation
let pendingAkutTaskId = null;   // task id from an incoming akut kald

const PRIO_ORDER_W = { akut: 0, fremsk: 1, udskr: 2, rutine: 3 };
const PRIO_LABEL_W = { akut: 'Akut', fremsk: 'Fremskyndet', udskr: 'Udskrivning', rutine: 'Rutine' };
const PRIO_BADGE_W = { akut: 'badge-red', fremsk: 'badge-orange', udskr: 'badge-amber', rutine: 'badge-gray' };

/**
 * Department codes this worker can service.
 * In production, load from the logged-in user's profile.
 * @type {string[]}
 */
let myCompetences = [];

/* ────────────────────────────────────────────
   INIT  (called by app.js after login)
──────────────────────────────────────────── */

/**
 * Initialise the worker page for a specific user.
 * @param {string} userName  - e.g. 'Sofia A.'
 */
function initWorkerPage(userName) {
  const staffMember = STAFF.find(s => s.name === userName);
  myCompetences = staffMember?.competences ?? [];

  // Reset state
  workerBusy   = false;
  activeTaskId = null;
  myDoneCount  = 0;
  wFilterMode  = 'alle';

  setFreeUI();
  renderWorkerTasks();
  updateWorkerStats();
}

/* ────────────────────────────────────────────
   RENDERING
──────────────────────────────────────────── */

function renderWorkerTasks() {
  const list = document.getElementById('worker-task-list');

  // Feature 2: count all non-done tasks before competence filter
  const totalOpen = TASKS.filter(t => t.status !== 'done').length;

  let filtered = TASKS.filter(t => {
    if (t.status === 'done') return false;
    // Only show tasks for departments this worker is competent in
    if (myCompetences.length > 0 && !myCompetences.some(c => t.dept.startsWith(c))) return false;
    if (wFilterMode === 'akut')   return t.prio === 'akut';
    if (wFilterMode === 'fremsk') return t.prio === 'fremsk';
    if (wFilterMode === 'rutine') return t.prio === 'rutine' || t.prio === 'udskr';
    return true;
  });

  filtered.sort((a, b) => PRIO_ORDER_W[a.prio] - PRIO_ORDER_W[b.prio]);

  // Feature 2: show/hide competence info chip
  const infoEl = document.getElementById('worker-competence-info');
  if (infoEl) {
    const hiddenCount = totalOpen - filtered.length;
    if (hiddenCount > 0) {
      infoEl.innerHTML = `<span class="competence-info-chip">
        👁 Viser ${filtered.length} af ${totalOpen} opgaver – ${hiddenCount} kræver kompetencer du ikke har
      </span>`;
      infoEl.style.display = 'block';
    } else {
      infoEl.style.display = 'none';
    }
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="card" style="padding:0">
        <div class="empty-state">
          <div class="empty-icon">🎉</div>
          <div class="empty-title">Ingen opgaver</div>
          <div class="empty-sub">Alle opgaver inden for dine kompetencer er taget eller færdige.</div>
        </div>
      </div>`;
    return;
  }

  list.innerHTML = '';
  filtered.forEach(t => {
    const isOwn = t.assignee && t.assignee === currentWorkerShortName();

    let actionsHtml;
    if (t.status === 'open') {
      actionsHtml = `
        <button class="btn btn-primary btn-sm" onclick="takeTask(${t.id})">Tag opgave</button>
        <button class="btn btn-ghost btn-sm"   onclick="reqHelp(${t.id})">Anmod om hjælp</button>`;
    } else if (isOwn) {
      actionsHtml = `
        <button class="btn btn-primary btn-sm" onclick="openWorkerDoneModal(${t.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Markér færdig
        </button>`;
    } else {
      actionsHtml = `<span class="badge badge-blue">Taget af ${t.assignee}</span>`;
    }

    const card = document.createElement('div');
    card.className = `worker-task-card ${t.prio}`;
    card.id = `wc-${t.id}`;
    card.onclick = (e) => { if (!e.target.closest('.wtc-actions')) openTaskDetail(t.id); };
    card.innerHTML = `
      <div class="wtc-inner">
        <div class="wtc-top-row">
          <div>
            <span class="badge ${PRIO_BADGE_W[t.prio]}" style="font-size:.75rem;padding:.25rem .625rem;">${PRIO_LABEL_W[t.prio]}</span>
            ${isOwn ? '<span class="badge badge-blue" style="margin-left:.25rem;">Min opgave</span>' : ''}
          </div>
          <span style="font-size:.75rem;color:var(--gray-400);">${t.time}</span>
        </div>
        <div class="wtc-title-t">${t.dept}</div>
        <div class="wtc-type-t">${t.type}</div>
        <div class="wtc-meta-row">
          <div class="wtc-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${t.deadline}
          </div>
        </div>
        ${t.note ? `<div class="wtc-note">📝 ${t.note}</div>` : ''}
        <div class="wtc-actions">${actionsHtml}</div>
      </div>`;
    list.appendChild(card);
  });

  updateWorkerStats();
}

/* ────────────────────────────────────────────
   WORKER ACTIONS
──────────────────────────────────────────── */

function takeTask(id) {
  if (workerBusy && activeTaskId) {
    toast('Du er allerede optaget', 'Færdiggør din nuværende opgave først.', 'amber');
    return;
  }
  const t = TASKS.find(x => x.id === id);
  if (!t || t.status !== 'open') return;

  t.status   = 'taken';
  t.assignee = currentWorkerShortName();
  activeTaskId = id;
  activeTaskStartTime = Date.now();

  // Feature 4: start live timer
  clearInterval(timerInterval);
  timerInterval = setInterval(updateActiveTimer, 1000);

  setWorkerBusyUI(t);
  renderWorkerTasks();
  toast('Opgave taget', `${t.dept} · ${t.deadline}`, 'blue');
}

function openWorkerDoneModal(id) {
  const t = TASKS.find(x => x.id === id);
  if (!t) return;
  workerDoneTarget = id;
  document.getElementById('wdone-desc').textContent =
    `Er du sikker på, at opgaven er fuldt udført og prøven er taget korrekt? (${t.dept} · ${t.type})`;
  openModal('modal-worker-done');
}

function confirmWorkerDone() {
  closeModal('modal-worker-done');
  if (workerDoneTarget === null) return;
  workerDone(workerDoneTarget);
  workerDoneTarget = null;
}

function workerDone(id) {
  const t = TASKS.find(x => x.id === id);
  if (!t) return;
  t.completedAt = new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  t.durationMin = activeTaskStartTime
    ? Math.round((Date.now() - activeTaskStartTime) / 60000)
    : null;
  t.status = 'done';
  myDoneCount++;

  if (activeTaskId === id) {
    activeTaskId = null;
    clearInterval(timerInterval); // Feature 4
    timerInterval = null;
    activeTaskStartTime = null;
    setFreeUI();
  }
  renderWorkerTasks();
  updateStats();         // also update planner stats
  renderActivityLog();   // update planner activity log
  toast('Opgave færdig 🎉', `${t.dept} er markeret som færdig.`, 'green');
}

function completeActiveTask() {
  if (activeTaskId !== null) openWorkerDoneModal(activeTaskId);
}

function reqHelp(id) {
  const t = TASKS.find(x => x.id === id);
  toast('Hjælp anmodet', `Planlæggeren er notificeret om ${t?.dept}.`, 'amber');
}

/* ────────────────────────────────────────────
   STATUS UI
──────────────────────────────────────────── */

function setWorkerBusyUI(t) {
  workerBusy = true;
  document.getElementById('si-dot').className          = 'si-dot busy';
  document.getElementById('si-text').textContent       = 'Optaget – i gang';
  document.getElementById('si-sub').textContent        = t.dept;
  document.getElementById('btn-set-free').style.display  = 'inline-flex';
  document.getElementById('btn-set-busy').style.display  = 'none';
  document.getElementById('atb-task-title').textContent  = t.type;
  document.getElementById('atb-task-meta').textContent   = `${t.dept} · ${t.deadline}`;
  document.getElementById('active-task-banner').style.display = 'flex';
}

function setFreeUI() {
  workerBusy = false;
  clearInterval(timerInterval); // Feature 4
  timerInterval = null;
  activeTaskStartTime = null;
  const timerEl = document.getElementById('atb-timer');
  if (timerEl) timerEl.textContent = '';
  document.getElementById('si-dot').className          = 'si-dot free';
  document.getElementById('si-text').textContent       = 'Fri – klar til opgaver';
  document.getElementById('si-sub').textContent        = 'Ingen aktiv opgave';
  document.getElementById('btn-set-free').style.display  = 'none';
  document.getElementById('btn-set-busy').style.display  = 'inline-flex';
  document.getElementById('active-task-banner').style.display = 'none';
  document.getElementById('my-active-name').textContent  = '–';
}

function setFree() {
  activeTaskId = null;
  setFreeUI();
  renderWorkerTasks();
}

function setWorkerManualBusy() {
  workerBusy = true;
  document.getElementById('si-dot').className         = 'si-dot busy';
  document.getElementById('si-text').textContent      = 'Optaget';
  document.getElementById('si-sub').textContent       = 'Manuel status';
  document.getElementById('btn-set-free').style.display = 'inline-flex';
  document.getElementById('btn-set-busy').style.display = 'none';
}

/* ────────────────────────────────────────────
   FEATURE 4 – LIVE TIMER
──────────────────────────────────────────── */

function updateActiveTimer() {
  if (!activeTaskStartTime) return;
  const elapsed = Math.floor((Date.now() - activeTaskStartTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const el = document.getElementById('atb-timer');
  if (el) el.textContent = `Aktiv i ${mm}:${ss}`;
}

/* ────────────────────────────────────────────
   FILTER
──────────────────────────────────────────── */

function setWFilter(f, el) {
  wFilterMode = f;
  document.querySelectorAll('#worker-chip-row .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderWorkerTasks();
}

/* ────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */

/** @returns {string} Short display name, e.g. 'Sofia A.' */
function currentWorkerShortName() {
  const parts = currentUser.split(' ');
  return parts[0] + ' ' + (parts[1]?.[0] ?? '') + '.';
}

function updateWorkerStats() {
  const active = activeTaskId ? TASKS.find(t => t.id === activeTaskId) : null;
  document.getElementById('my-done-count').textContent  = myDoneCount;
  document.getElementById('my-active-name').textContent = active?.dept.split('–')[0].trim() ?? '–';
}

/* ────────────────────────────────────────────
   ÆNDRING 1: AKUT FULLSCREEN MODAL
──────────────────────────────────────────── */

function showWorkerAkutModal(dept, msg, taskId) {
  pendingAkutTaskId = taskId;
  document.getElementById('akut-worker-dept').textContent = dept;
  document.getElementById('akut-worker-msg').textContent  = msg || 'Akut prøvetagning påkrævet';
  document.getElementById('modal-akut-worker').classList.add('open');
}

function acceptAkutKald() {
  document.getElementById('modal-akut-worker').classList.remove('open');
  if (pendingAkutTaskId !== null) {
    takeTask(pendingAkutTaskId);
    pendingAkutTaskId = null;
  }
}

function forwardAkutKald() {
  document.getElementById('modal-akut-worker').classList.remove('open');
  console.log('[AkutKald] Videresendt — prøvetager optaget:', currentUser);
  toast('Akut kald videresendt', 'Kaldet er sendt videre til andre prøvetagere.', 'amber');
  pendingAkutTaskId = null;
}

/* ────────────────────────────────────────────
   ÆNDRING 5: OPGAVEDETALJE MODAL
──────────────────────────────────────────── */

function openTaskDetail(id) {
  const t = TASKS.find(x => x.id === id);
  if (!t) return;

  document.getElementById('task-detail-badge').innerHTML =
    `<span class="badge ${PRIO_BADGE_W[t.prio]}" style="font-size:.8125rem;padding:.25rem .625rem;">${PRIO_LABEL_W[t.prio]}</span>`;
  document.getElementById('task-detail-title').textContent = t.dept;
  document.getElementById('task-detail-type').textContent  = t.type;

  const bodyEl = document.getElementById('task-detail-body');
  bodyEl.innerHTML = `
    <div class="task-detail-grid">
      <div class="task-detail-item">
        <div class="label">Deadline</div>
        <div style="font-weight:600;">${t.deadline}</div>
      </div>
      <div class="task-detail-item">
        <div class="label">Status</div>
        <div style="font-weight:600;">${t.status === 'open' ? 'Afventer' : t.status === 'taken' ? 'Taget' : 'Færdig'}</div>
      </div>
      ${t.assignee ? `<div class="task-detail-item"><div class="label">Tildelt til</div><div style="font-weight:600;">${t.assignee}</div></div>` : ''}
      <div class="task-detail-item">
        <div class="label">Oprettet</div>
        <div style="font-weight:600;">${t.time}</div>
      </div>
    </div>
    ${t.note ? `<div class="wtc-note" style="margin-top:.75rem;">📝 ${t.note}</div>` : ''}`;

  const footerEl = document.getElementById('task-detail-footer');
  const isOwn = t.assignee && t.assignee === currentWorkerShortName();
  if (t.status === 'open') {
    footerEl.innerHTML = `
      <button class="btn btn-primary" onclick="closeModal('modal-task-detail');takeTask(${t.id})">Tag opgave</button>
      <button class="btn btn-secondary" onclick="closeModal('modal-task-detail')">Luk</button>`;
  } else if (isOwn && t.status === 'taken') {
    footerEl.innerHTML = `
      <button class="btn btn-primary" onclick="closeModal('modal-task-detail');openWorkerDoneModal(${t.id})">Markér færdig</button>
      <button class="btn btn-secondary" onclick="closeModal('modal-task-detail')">Luk</button>`;
  } else {
    footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('modal-task-detail')">Luk</button>`;
  }

  openModal('modal-task-detail');
}
