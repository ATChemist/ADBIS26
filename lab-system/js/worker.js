/**
 * worker.js  –  Worker (prøvetager) page: state & rendering
 * LabSystem · Herlev Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */

let workerBusy   = false;
let myDoneCount  = 0;
let wFilterMode  = 'alle'; // 'alle' | 'akut' | 'fremsk' | 'rutine'
let taskTransitionLock = false;

const PRIO_ORDER_W = { akut: 0, fremsk: 1, udskr: 2, rutine: 3 };
const PRIO_LABEL_W = { akut: 'Akut', fremsk: 'Fremskyndet', udskr: 'Udskrivning', rutine: 'Rutine' };
const PRIO_BADGE_W = { akut: 'badge-red', fremsk: 'badge-orange', udskr: 'badge-amber', rutine: 'badge-gray' };
const TASK_TRANSITION_MS = 350;

function getCurrentWorker() {
  return state.workers.find(s => s.name === state.currentUser);
}

function syncCurrentWorkerState(nextState, dept) {
  const worker = getCurrentWorker();
  if (!worker) return;
  worker.state = nextState;
  worker.dept = dept;
}

function animateTaskTransition(id, className, onComplete) {
  const card = document.getElementById(`wc-${id}`);
  const banner = document.getElementById('active-task-banner');
  const target = card ?? (className === 'task-complete' && banner?.style.display !== 'none' ? banner : null);

  if (!target) {
    onComplete();
    return;
  }

  taskTransitionLock = true;
  const buttons = Array.from(target.querySelectorAll('button'));
  buttons.forEach(button => {
    button.disabled = true;
  });
  target.classList.remove('task-taken', 'task-complete');
  void target.offsetWidth;
  target.classList.add(className);

  window.setTimeout(() => {
    onComplete();
    target.classList.remove(className);
    buttons.forEach(button => {
      button.disabled = false;
    });
    taskTransitionLock = false;
  }, TASK_TRANSITION_MS);
}

/* ────────────────────────────────────────────
   INIT  (called by app.js after login)
──────────────────────────────────────────── */

/**
 * Initialise the worker page for a specific user.
 * @param {string} userName  - e.g. 'Sofia A.'
 */
function initWorkerPage(userName) {
  state.currentUser = userName;

  // Reset state
  workerBusy   = false;
  state.activeTask = null;
  myDoneCount  = 0;
  wFilterMode  = 'alle';
  taskTransitionLock = false;

  setFreeUI();
  renderWorkerTasks();
  updateWorkerStats();
}

/* ────────────────────────────────────────────
   RENDERING
──────────────────────────────────────────── */

function renderWorkerTasks() {
  const list = document.getElementById('worker-task-list');
  const myCompetences = getCurrentWorker()?.competences ?? [];
  const workerName = currentWorkerShortName();

  let filtered = state.tasks.filter(t => {
    if (t.status === 'done') return false;
    if (state.activeTask?.id === t.id && t.assignee === workerName) return false;
    // Only show tasks for departments this worker is competent in
    if (myCompetences.length > 0 && !myCompetences.some(c => t.dept.startsWith(c))) return false;
    if (wFilterMode === 'akut')   return t.prio === 'akut';
    if (wFilterMode === 'fremsk') return t.prio === 'fremsk';
    if (wFilterMode === 'rutine') return t.prio === 'rutine' || t.prio === 'udskr';
    return true;
  });

  filtered.sort((a, b) => PRIO_ORDER_W[a.prio] - PRIO_ORDER_W[b.prio]);

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
    const isOwn = t.assignee && t.assignee === workerName;

    let actionsHtml;
    if (t.status === 'open') {
      actionsHtml = `
        <button class="btn btn-primary btn-sm" onclick="takeTask(${t.id})">Tag opgave</button>
        <button class="btn btn-ghost btn-sm"   onclick="reqHelp(${t.id})">Anmod om hjælp</button>`;
    } else if (isOwn) {
      actionsHtml = `
        <button class="btn btn-primary btn-sm" onclick="workerDone(${t.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Markér færdig
        </button>`;
    } else {
      actionsHtml = `<span class="badge badge-blue">Taget af ${t.assignee}</span>`;
    }

    const card = document.createElement('div');
    card.className = `worker-task-card task-card ${t.prio}${t.prio === 'akut' ? ' task-akut' : ''}`;
    card.id = `wc-${t.id}`;
    card.innerHTML = `
      <div class="wtc-inner">
        <div class="wtc-top-row">
          <div>
            <span class="badge ${PRIO_BADGE_W[t.prio]}">${PRIO_LABEL_W[t.prio]}</span>
            ${isOwn ? '<span class="badge badge-blue" style="margin-left:.25rem;">Min opgave</span>' : ''}
          </div>
          <span style="font-size:.6875rem;color:var(--gray-400);">${t.time}</span>
        </div>
        <div class="wtc-title-t">${t.dept}</div>
        <div class="wtc-type-t">${t.type}</div>
        <div class="wtc-meta-row">
          <div class="wtc-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
  if (taskTransitionLock) return;
  if (workerBusy && state.activeTask) {
    toast('Du er allerede optaget', 'Færdiggør din nuværende opgave først.', 'amber');
    return;
  }
  const t = state.tasks.find(x => x.id === id);
  if (!t || t.status !== 'open') return;

  animateTaskTransition(id, 'task-taken', () => {
    t.status   = 'taken';
    t.assignee = currentWorkerShortName();
    state.activeTask = t;

    syncCurrentWorkerState('busy', t.dept);
    setWorkerBusyUI(t);
    renderWorkerTasks();
    toast('Opgave taget', `${t.dept} · ${t.deadline}`, 'blue');
  });
}

function workerDone(id) {
  if (taskTransitionLock) return;
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;

  animateTaskTransition(id, 'task-complete', () => {
    t.status = 'done';
    myDoneCount++;

    if (state.activeTask?.id === id) {
      state.activeTask = null;
      syncCurrentWorkerState('free', 'Ledig');
      setFreeUI();
    }
    renderWorkerTasks();
    updateStats();  // also update planner stats
    toast('Opgave færdig 🎉', `${t.dept} er markeret som færdig.`, 'green');
  });
}

function completeActiveTask() {
  if (taskTransitionLock) return;
  if (state.activeTask) workerDone(state.activeTask.id);
}

function reqHelp(id) {
  const t = state.tasks.find(x => x.id === id);
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
  document.getElementById('si-dot').className          = 'si-dot free';
  document.getElementById('si-text').textContent       = 'Fri – klar til opgaver';
  document.getElementById('si-sub').textContent        = 'Ingen aktiv opgave';
  document.getElementById('btn-set-free').style.display  = 'none';
  document.getElementById('btn-set-busy').style.display  = 'inline-flex';
  document.getElementById('active-task-banner').style.display = 'none';
  document.getElementById('my-active-name').textContent  = '–';
}

function setFree() {
  state.activeTask = null;
  syncCurrentWorkerState('free', 'Ledig');
  setFreeUI();
  renderWorkerTasks();
}

function setWorkerManualBusy() {
  workerBusy = true;
  syncCurrentWorkerState('busy', 'Manuel status');
  document.getElementById('si-dot').className         = 'si-dot busy';
  document.getElementById('si-text').textContent      = 'Optaget';
  document.getElementById('si-sub').textContent       = 'Manuel status';
  document.getElementById('btn-set-free').style.display = 'inline-flex';
  document.getElementById('btn-set-busy').style.display = 'none';
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
  if (!state.currentUser) return '';
  const parts = state.currentUser.split(' ');
  return parts[0] + ' ' + (parts[1]?.[0] ?? '') + '.';
}

function updateWorkerStats() {
  const active = state.activeTask;
  document.getElementById('my-done-count').textContent  = myDoneCount;
  document.getElementById('my-active-name').textContent = active?.dept.split('–')[0].trim() ?? '–';
}
