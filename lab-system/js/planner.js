/**
 * planner.js  –  Planner page: task management & rendering
 * LabSystem · Herlev Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */

let taskFilter    = 'all';   // 'all' | 'akut' | 'open' | 'done'
let selPrioVal    = 'rutine';
let assignTarget  = null;    // task id awaiting assignment
let deleteTarget  = null;    // task id awaiting delete confirmation
let _undoMarkDoneTimer = null;
let _undoDeleteTimer   = null;

/** Priority sort order */
const PRIO_ORDER = { akut: 0, fremsk: 1, udskr: 2, rutine: 3 };

const PRIO_LABEL   = { akut: 'Akut', fremsk: 'Fremskyndet', udskr: 'Udskrivning', rutine: 'Rutine' };
const PRIO_BADGE   = { akut: 'badge-red', fremsk: 'badge-orange', udskr: 'badge-amber', rutine: 'badge-gray' };

function getNextTaskId() {
  return state.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
}

/* ────────────────────────────────────────────
   STATS
──────────────────────────────────────────── */

function updateStats() {
  document.getElementById('st-akut').textContent    = state.tasks.filter(t => t.prio === 'akut'  && t.status !== 'done').length;
  document.getElementById('st-done').textContent    = state.tasks.filter(t => t.status === 'done').length;
  document.getElementById('st-pending').textContent = state.tasks.filter(t => t.status === 'open').length;
  document.getElementById('st-active').textContent  = state.tasks.filter(t => t.status === 'taken').length;
}

/* ────────────────────────────────────────────
   TASK LIST RENDERING
──────────────────────────────────────────── */

function getFilteredTasks() {
  let list;
  switch (taskFilter) {
    case 'akut': list = state.tasks.filter(t => t.prio === 'akut' && t.status !== 'done'); break;
    case 'open': list = state.tasks.filter(t => t.status === 'open'); break;
    case 'done': list = state.tasks.filter(t => t.status === 'done'); break;
    default:     list = state.tasks.filter(t => t.status !== 'done');
  }
  return list.sort((a, b) => PRIO_ORDER[a.prio] - PRIO_ORDER[b.prio]);
}

function minutesOpen(task) {
  if (!task.time) return 0;
  const [h, m] = task.time.split(':').map(Number);
  const now = new Date();
  const taskMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < taskMinutes) return 0;
  return nowMinutes - taskMinutes;
}

function renderPlannerTasks() {
  const list    = document.getElementById('planner-task-list');
  const sorted  = getFilteredTasks();

  // Feature 5: sort escalated open tasks above non-escalated (but below akut)
  sorted.sort((a, b) => {
    const pa = PRIO_ORDER[a.prio], pb = PRIO_ORDER[b.prio];
    if (pa !== pb) return pa - pb;
    // Within same priority, escalated first
    const aEsc = a.status === 'open' && minutesOpen(a) > 15 ? 0 : 1;
    const bEsc = b.status === 'open' && minutesOpen(b) > 15 ? 0 : 1;
    return aEsc - bEsc;
  });

  document.getElementById('task-count-badge').textContent = sorted.length;

  if (sorted.length === 0) {
    list.innerHTML = `
      <div class="card" style="padding:0">
        <div class="empty-state">
          <div class="empty-icon">${taskFilter === 'done' ? '✅' : '📋'}</div>
          <div class="empty-title">${taskFilter === 'done' ? 'Ingen færdige opgaver endnu' : 'Ingen opgaver i dette filter'}</div>
          <div class="empty-sub">Opret en ny opgave via formularen til højre</div>
        </div>
      </div>`;
    return;
  }

  list.innerHTML = '';
  sorted.forEach(t => {
    const statusBadge =
      t.status === 'open'  ? '<span class="badge badge-gray">Afventer</span>'
    : t.status === 'taken' ? `<span class="badge badge-blue">Taget · ${t.assignee}</span>`
    :                        '<span class="badge badge-green">Færdig</span>';

    const noteChip = t.note
      ? `<span class="task-note-chip">📝 ${t.note}</span>` : '';

    // Feature 5: escalation badge
    const escalated = t.status === 'open' && minutesOpen(t) > 15;
    const escalationBadge = escalated ? '<span class="badge badge-amber">⏳ Afventer længe</span>' : '';

    const row = document.createElement('div');
    row.className = `task-row task-card ${t.prio}${t.prio === 'akut' && t.status !== 'done' ? ' task-akut' : ''}${t.status === 'done' ? ' done-row' : ''}`;
    row.innerHTML = `
      <div class="task-dot-col"><div class="prio-dot ${t.prio}"></div></div>
      <div class="task-info-col">
        <div class="task-title-t">${t.dept} · ${t.type}</div>
        <div class="task-meta-row">
          <span class="task-meta-chip">⏱ ${t.deadline}</span>
          <span class="badge ${PRIO_BADGE[t.prio]}">${PRIO_LABEL[t.prio]}</span>
          ${escalationBadge}
          ${noteChip}
        </div>
      </div>
      <div class="task-status-col">${statusBadge}</div>
      <div class="task-actions-col">
        ${t.status === 'open' ? `<button class="btn btn-secondary btn-sm" onclick="openAssignModal(${t.id})">Tildel</button>` : ''}
        ${t.status !== 'done' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Markér færdig" onclick="markDone(${t.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>` : ''}
        <button class="btn btn-ghost btn-icon btn-sm" title="Slet" onclick="openDeleteModal(${t.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>`;
    list.appendChild(row);
  });
}

/* ────────────────────────────────────────────
   FILTER
──────────────────────────────────────────── */

function setFilter(f, el) {
  taskFilter = f;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderPlannerTasks();
}

/* ────────────────────────────────────────────
   TASK ACTIONS
──────────────────────────────────────────── */

function markDone(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;

  // Save original state for undo
  const prevStatus = t.status;
  const prevAssignee = t.assignee;
  const prevActiveTask = state.activeTask;

  // Optimistic UI: visually mark as done
  t.status   = 'done';
  t.assignee = t.assignee ?? 'Manuel';
  if (state.activeTask?.id === id) state.activeTask = null;
  renderPlannerTasks();
  updateStats();

  // Deferred commit with undo
  _undoMarkDoneTimer = setTimeout(() => {
    _undoMarkDoneTimer = null;
    // Data already set — no further action needed
  }, 5000);

  toast('Opgave markeret færdig', `${t.dept} markeret som færdig.`, 'green', () => {
    // Undo: revert data
    clearTimeout(_undoMarkDoneTimer);
    _undoMarkDoneTimer = null;
    t.status = prevStatus;
    t.assignee = prevAssignee;
    state.activeTask = prevActiveTask;
    renderPlannerTasks();
    updateStats();
  });
}

function openDeleteModal(id) {
  deleteTarget = id;
  openModal('modal-delete');
}

function confirmDelete() {
  const idToDelete = deleteTarget;
  if (idToDelete === null) { closeModal('modal-delete'); return; }
  deleteTarget = null;

  const taskIndex = state.tasks.findIndex(x => x.id === idToDelete);
  const taskCopy = taskIndex >= 0 ? { ...state.tasks[taskIndex] } : null;
  const prevActiveTask = state.activeTask;

  // Optimistic UI: remove from array
  if (taskIndex >= 0) state.tasks.splice(taskIndex, 1);
  if (state.activeTask?.id === idToDelete) state.activeTask = null;

  closeModal('modal-delete');
  renderPlannerTasks();
  updateStats();

  // Deferred commit with undo
  _undoDeleteTimer = setTimeout(() => {
    _undoDeleteTimer = null;
  }, 5000);

  toast('Opgave slettet', '', 'red', () => {
    // Undo: restore task
    clearTimeout(_undoDeleteTimer);
    _undoDeleteTimer = null;
    if (taskCopy) {
      state.tasks.splice(taskIndex, 0, taskCopy);
      state.activeTask = prevActiveTask;
    }
    renderPlannerTasks();
    updateStats();
  });
}

function openAssignModal(id) {
  assignTarget = id;
  const t = state.tasks.find(x => x.id === id);
  document.getElementById('assign-desc').textContent =
    `Tildel: "${t.type}" på ${t.dept}`;

  // Feature 3: dynamically populate select with state indicators
  const sel = document.getElementById('assign-select');
  sel.innerHTML = '';
  state.workers.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    let label = s.name;
    if (s.state === 'busy') { label += ' (optaget \u{1F534})'; opt.dataset.state = 'busy'; }
    else if (s.state === 'break') { label += ' (pause \u{1F7E1})'; opt.dataset.state = 'break'; }
    opt.textContent = label;
    sel.appendChild(opt);
  });

  const warning = document.getElementById('assign-warning');
  warning.style.display = 'none';
  warning.textContent = '';

  // Show warning on change
  sel.onchange = function() {
    const opt = sel.options[sel.selectedIndex];
    if (opt?.dataset.state === 'busy') {
      warning.textContent = '\u26A0\uFE0F Denne prøvetager er allerede i gang med en opgave.';
      warning.style.display = 'block';
    } else if (opt?.dataset.state === 'break') {
      warning.textContent = '\u26A0\uFE0F Denne prøvetager er på pause.';
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
  };

  // Trigger initial check
  sel.onchange();

  openModal('modal-assign');
}

function confirmAssign() {
  const t = state.tasks.find(x => x.id === assignTarget);
  if (t) {
    t.assignee = document.getElementById('assign-select').value;
    t.status   = 'taken';
    toast('Opgave tildelt', `${t.assignee} tager opgaven på ${t.dept}.`, 'blue');
  }
  closeModal('modal-assign');
  renderPlannerTasks();
  updateStats();
}

/* ────────────────────────────────────────────
   CREATE TASK
──────────────────────────────────────────── */

function selPrio(el, v) {
  selPrioVal = v;
  document.querySelectorAll('.prio-pill').forEach(p => p.classList.remove('sel'));
  el.classList.add('sel');
}

function addTask() {
  const dept     = document.getElementById('nt-dept').value;
  const type     = document.getElementById('nt-type').value;
  const deadline = document.getElementById('nt-deadline').value;
  const assignee = document.getElementById('nt-assign').value || null;
  const note     = document.getElementById('nt-note').value.trim();
  const now      = new Date();
  const time     = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const prio     = selPrioVal;

  state.tasks.unshift({
    id: getNextTaskId(), dept, type, prio,
    deadline, note, status: assignee ? 'taken' : 'open', assignee, time,
  });

  // Reset form
  document.getElementById('nt-note').value    = '';
  document.getElementById('nt-assign').value  = '';
  selPrio(document.querySelector('.prio-pill.p-rutine'), 'rutine');

  renderPlannerTasks();
  updateStats();

  toast(
    prio === 'akut' ? 'Akut opgave oprettet' : 'Opgave oprettet',
    `${dept} · ${deadline}`,
    prio === 'akut' ? 'red' : 'green',
  );
}

function scrollToCreate() {
  document.getElementById('create-section')
    .scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ────────────────────────────────────────────
   AKUT KALD
──────────────────────────────────────────── */

function fireAkutKald() {
  const dept = document.getElementById('akut-dept').value;
  const msg  = document.getElementById('akut-msg').value.trim();
  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  state.tasks.unshift({
    id: getNextTaskId(), dept, type: `Akut kald – ${msg}`, prio: 'akut',
    deadline: 'Øjeblikkeligt', note: 'Notifikation sendt til alle prøvetagere',
    status: 'open', assignee: null, time,
  });

  closeModal('modal-akut');
  renderPlannerTasks();
  updateStats();
  toast('Akut kald sendt', `${dept} · Alle prøvetagere notificeret`, 'red');
}

/* ────────────────────────────────────────────
   STAFF LIST
──────────────────────────────────────────── */

function renderStaff() {
  const list = document.getElementById('staff-list');
  list.innerHTML = '';

  const STATE_LABEL = { free: 'Fri', busy: 'Optaget', break: 'Pause' };
  const STATE_CLS   = { free: 'ss-free', busy: 'ss-busy', break: 'ss-break' };

  state.workers.forEach(s => {
    const row = document.createElement('div');
    row.className = 'staff-row';
    row.innerHTML = `
      <div class="staff-av ${s.avClass}">${s.initials}</div>
      <div class="staff-info">
        <div class="staff-name">${s.name}</div>
        <div class="staff-dept">${s.dept}</div>
      </div>
      <span class="badge ${STATE_CLS[s.state]}" style="font-size:.6875rem;">${STATE_LABEL[s.state]}</span>`;
    list.appendChild(row);
  });
}
