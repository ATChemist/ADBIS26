/**
 * planner.js  –  Planner page: task management & rendering
 * LabSystem · Herlev Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */

/** @type {Task[]} Live task list (mutated in place) */
let TASKS = INITIAL_TASKS.map(t => ({ ...t }));

let nextId        = INITIAL_TASKS.length + 1;
let taskFilter    = 'all';   // 'all' | 'akut' | 'open' | 'done'
let selPrioVal    = 'rutine';
let assignTarget  = null;    // task id awaiting assignment
let deleteTarget  = null;    // task id awaiting delete confirmation

/** Priority sort order */
const PRIO_ORDER = { akut: 0, fremsk: 1, udskr: 2, rutine: 3 };

const PRIO_LABEL   = { akut: 'Akut', fremsk: 'Fremskyndet', udskr: 'Udskrivning', rutine: 'Rutine' };
const PRIO_BADGE   = { akut: 'badge-red', fremsk: 'badge-orange', udskr: 'badge-amber', rutine: 'badge-gray' };

/* ────────────────────────────────────────────
   STATS
──────────────────────────────────────────── */

function updateStats() {
  document.getElementById('st-akut').textContent    = TASKS.filter(t => t.prio === 'akut'  && t.status !== 'done').length;
  document.getElementById('st-done').textContent    = TASKS.filter(t => t.status === 'done').length;
  document.getElementById('st-pending').textContent = TASKS.filter(t => t.status === 'open').length;
  document.getElementById('st-active').textContent  = TASKS.filter(t => t.status === 'taken').length;
}

/* ────────────────────────────────────────────
   TASK LIST RENDERING
──────────────────────────────────────────── */

function getFilteredTasks() {
  let list;
  switch (taskFilter) {
    case 'akut': list = TASKS.filter(t => t.prio === 'akut' && t.status !== 'done'); break;
    case 'open': list = TASKS.filter(t => t.status === 'open'); break;
    case 'done': list = TASKS.filter(t => t.status === 'done'); break;
    default:     list = TASKS.filter(t => t.status !== 'done');
  }
  return list.sort((a, b) => PRIO_ORDER[a.prio] - PRIO_ORDER[b.prio]);
}

function renderPlannerTasks() {
  const list    = document.getElementById('planner-task-list');
  const sorted  = getFilteredTasks();
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

    const row = document.createElement('div');
    row.className = `task-row ${t.prio}${t.status === 'done' ? ' done-row' : ''}`;
    row.innerHTML = `
      <div class="task-dot-col"><div class="prio-dot ${t.prio}"></div></div>
      <div class="task-info-col">
        <div class="task-title-t">${t.dept} · ${t.type}</div>
        <div class="task-meta-row">
          <span class="task-meta-chip">⏱ ${t.deadline}</span>
          <span class="badge ${PRIO_BADGE[t.prio]}">${PRIO_LABEL[t.prio]}</span>
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
  const t = TASKS.find(x => x.id === id);
  if (!t) return;
  t.status   = 'done';
  t.assignee = t.assignee ?? 'Manuel';
  renderPlannerTasks();
  updateStats();
  toast('Opgave færdig', `${t.dept} markeret som færdig.`, 'green');
}

function openDeleteModal(id) {
  deleteTarget = id;
  openModal('modal-delete');
}

function confirmDelete() {
  if (deleteTarget !== null) {
    TASKS = TASKS.filter(x => x.id !== deleteTarget);
    deleteTarget = null;
  }
  closeModal('modal-delete');
  renderPlannerTasks();
  updateStats();
}

function openAssignModal(id) {
  assignTarget = id;
  const t = TASKS.find(x => x.id === id);
  document.getElementById('assign-desc').textContent =
    `Tildel: "${t.type}" på ${t.dept}`;
  openModal('modal-assign');
}

function confirmAssign() {
  const t = TASKS.find(x => x.id === assignTarget);
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

  TASKS.unshift({
    id: nextId++, dept, type, prio,
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

  TASKS.unshift({
    id: nextId++, dept, type: `Akut kald – ${msg}`, prio: 'akut',
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

  STAFF.forEach(s => {
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
