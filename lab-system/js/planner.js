/**
 * planner.js  –  Planner page: task management & rendering
 * LabSystem · Hillerød Hospital
 */

'use strict';

/* ────────────────────────────────────────────
   STATE
──────────────────────────────────────────── */

/** @type {Task[]} Live task list (mutated in place) */
let TASKS = INITIAL_TASKS.map(t => ({ ...t }));

let nextId        = INITIAL_TASKS.length + 1;
let taskFilter    = 'all';   // 'all' | 'akut' | 'open' | 'done' | 'escalated'
let selPrioVal    = 'rutine';
let assignTarget  = null;    // task id awaiting assignment
let deleteTarget  = null;    // task id awaiting delete confirmation
let pendingAkutDept = null;  // dept stored while confirmation modal is open
let pendingAkutMsg  = null;  // message stored while confirmation modal is open
let assignMode      = 'single'; // 'single' | 'group'
let remainingPatients = 197;

/** Priority sort order */
const PRIO_ORDER = { akut: 0, fremsk: 1, udskr: 2, rutine: 3 };

const PRIO_LABEL   = { akut: 'Akut', fremsk: 'Fremskyndet', udskr: 'Udskrivning', rutine: 'Rutine' };
const PRIO_BADGE   = { akut: 'badge-red', fremsk: 'badge-orange', udskr: 'badge-amber', rutine: 'badge-gray' };

/* ────────────────────────────────────────────
   STATS
──────────────────────────────────────────── */

function updateStats() {
  const doneCount = TASKS.filter(t => t.status === 'done').length;
  document.getElementById('st-akut').textContent    = TASKS.filter(t => t.prio === 'akut'  && t.status !== 'done').length;
  document.getElementById('st-done').textContent    = doneCount;
  document.getElementById('st-pending').textContent = TASKS.filter(t => t.status === 'open').length;
  document.getElementById('st-active').textContent  = TASKS.filter(t => t.status === 'taken').length;

  const remaining = Math.max(0, 197 - doneCount);
  remainingPatients = remaining;
  const stPatients = document.getElementById('st-patients');
  if (stPatients) stPatients.textContent = remaining;
  const hdr = document.getElementById('patient-count-hdr');
  if (hdr) hdr.textContent = remaining + ' patienter i dag ▾';
  const wpc = document.getElementById('worker-patient-count');
  if (wpc) wpc.textContent = remaining;
}

function openDeptBreakdown(category) {
  const titleEl = document.getElementById('dept-breakdown-title');
  const descEl  = document.getElementById('dept-breakdown-desc');
  const listEl  = document.getElementById('dept-breakdown-list');

  const doneCount = TASKS.filter(t => t.status === 'done').length;
  const remaining = Math.max(0, 197 - doneCount);

  const doneByDept = {};
  TASKS.filter(t => t.status === 'done').forEach(t => {
    const dk = t.dept;
    doneByDept[dk] = (doneByDept[dk] || 0) + 1;
  });

  let rows = [];

  if (category === 'patients') {
    titleEl.textContent = 'Patienter i dag — ' + remaining + ' resterende';
    descEl.textContent  = 'Fordelt pr. afdeling (efter færdige prøver trukket fra)';
    rows = DEPT_PATIENTS.map(d => {
      const done = doneByDept[d.dept] || 0;
      return { dept: d.dept, count: Math.max(0, d.count - done) };
    });
  } else {
    const filterFn = {
      akut:    t => t.prio === 'akut' && t.status !== 'done',
      active:  t => t.status === 'taken',
      done:    t => t.status === 'done',
      pending: t => t.status === 'open',
    }[category];
    const labels = {
      akut: 'Akutte opgaver', active: 'Igangværende opgaver',
      done: 'Færdige opgaver', pending: 'Afventende opgaver',
    };
    titleEl.textContent = labels[category] || 'Fordeling';
    descEl.textContent  = 'Fordelt pr. afdeling';

    const byDept = {};
    TASKS.filter(filterFn).forEach(t => {
      byDept[t.dept] = (byDept[t.dept] || 0) + 1;
    });
    rows = Object.entries(byDept).map(([dept, count]) => ({ dept, count }));
  }

  rows.sort((a, b) => b.count - a.count);

  listEl.innerHTML = rows.length === 0
    ? '<div class="assign-group-empty">Ingen data</div>'
    : rows.map(r => `
        <div class="dept-breakdown-row">
          <span class="dept-breakdown-name">${r.dept}</span>
          <span class="dept-breakdown-count">${r.count}</span>
        </div>`).join('');

  openModal('modal-dept-breakdown');
}

/* ────────────────────────────────────────────
   TASK LIST RENDERING
──────────────────────────────────────────── */

function getFilteredTasks() {
  let list;
  switch (taskFilter) {
    case 'akut':      list = TASKS.filter(t => t.prio === 'akut' && t.status !== 'done'); break;
    case 'open':      list = TASKS.filter(t => t.status === 'open'); break;
    case 'done':      list = TASKS.filter(t => t.status === 'done'); break;
    case 'escalated': list = TASKS.filter(t => t.status === 'open' && minutesOpen(t) > 15); break;
    default:          list = TASKS.filter(t => t.status !== 'done');
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

    // Feature 5: escalation badge for open tasks > 15 min
    const escalated = t.status === 'open' && minutesOpen(t) > 15;
    const escalationBadge = escalated
      ? `<span class="badge badge-amber">⏳ Afventer længe</span>` : '';

    const row = document.createElement('div');
    row.className = `task-row ${t.prio}${t.status === 'done' ? ' done-row' : ''}`;
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
  const t = TASKS.find(x => x.id === id);
  if (!t) return;

  // Optimistic UI — visually mark done immediately
  const prevStatus   = t.status;
  const prevAssignee = t.assignee;
  const prevCompletedAt = t.completedAt;
  t.status      = 'done';
  t.assignee    = t.assignee ?? 'Manuel';
  t.completedAt = new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  t.durationMin = null;
  renderPlannerTasks();
  updateStats();
  renderActivityLog();

  // Deferred commit with undo window (5 sec)
  let committed = false;
  const undoTimer = setTimeout(() => { committed = true; }, 5000);

  toast(
    'Opgave markeret færdig',
    `${t.dept} · ${t.type}`,
    'green',
    () => {
      // Undo: revert if not yet committed
      if (!committed) {
        clearTimeout(undoTimer);
        t.status      = prevStatus;
        t.assignee    = prevAssignee;
        t.completedAt = prevCompletedAt;
        t.durationMin = null;
        renderPlannerTasks();
        updateStats();
        renderActivityLog();
        toast('Fortryd udført', 'Opgaven er gendannet.', 'blue');
      }
    }
  );
}

function openDeleteModal(id) {
  deleteTarget = id;
  openModal('modal-delete');
}

function confirmDelete() {
  const id = deleteTarget;
  if (id === null) { closeModal('modal-delete'); return; }

  const idx  = TASKS.findIndex(x => x.id === id);
  const snap = idx !== -1 ? { ...TASKS[idx] } : null;

  // Optimistic removal
  if (idx !== -1) TASKS.splice(idx, 1);
  deleteTarget = null;
  closeModal('modal-delete');
  renderPlannerTasks();
  updateStats();
  renderActivityLog();

  if (!snap) return;

  let committed = false;
  const undoTimer = setTimeout(() => { committed = true; }, 5000);

  toast(
    'Opgave slettet',
    `${snap.dept} · ${snap.type}`,
    'amber',
    () => {
      if (!committed) {
        clearTimeout(undoTimer);
        // Re-insert at original position (or end)
        const insertAt = Math.min(idx, TASKS.length);
        TASKS.splice(insertAt, 0, snap);
        renderPlannerTasks();
        updateStats();
        renderActivityLog();
        toast('Fortryd udført', 'Opgaven er gendannet.', 'blue');
      }
    }
  );
}

function openGroupAssignModal() {
  assignTarget = null;
  assignMode = 'group';
  document.getElementById('assign-title').textContent = 'Gruppetildeling';
  document.getElementById('assign-desc').textContent  = 'Tildel alle opgaver i en afdeling til én prøvetager.';
  document.getElementById('assign-tab-single').classList.remove('active');
  document.getElementById('assign-tab-group').classList.add('active');
  document.getElementById('assign-single-body').style.display = 'none';
  document.getElementById('assign-group-body').style.display  = '';
  const sel = document.getElementById('assign-group-worker');
  sel.innerHTML = '';
  STAFF.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    const stateLabel = s.state === 'busy' ? ' (optaget 🔴)' : s.state === 'break' ? ' (pause 🟡)' : '';
    opt.textContent = s.name + stateLabel;
    sel.appendChild(opt);
  });
  renderGroupTasks();
  openModal('modal-assign');
}

function openAssignModal(id) {
  assignTarget = id;
  assignMode = 'single';
  document.getElementById('assign-tab-single').classList.add('active');
  document.getElementById('assign-tab-group').classList.remove('active');
  document.getElementById('assign-single-body').style.display = '';
  document.getElementById('assign-group-body').style.display  = 'none';
  document.getElementById('assign-confirm-btn').textContent = 'Tildel opgave';
  const t = TASKS.find(x => x.id === id);
  document.getElementById('assign-desc').textContent =
    `Tildel: "${t.type}" på ${t.dept}`;

  // Build dynamic staff options with state indicators
  const sel = document.getElementById('assign-select');
  sel.innerHTML = '';
  STAFF.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    const stateLabel = s.state === 'busy'  ? ' (optaget 🔴)'
                     : s.state === 'break' ? ' (pause 🟡)'
                     : '';
    opt.textContent = s.name + stateLabel;
    opt.dataset.state = s.state;
    sel.appendChild(opt);
  });

  // Warning on change
  const warning = document.getElementById('assign-warning');
  const updateWarning = () => {
    const chosen = sel.options[sel.selectedIndex];
    if (chosen?.dataset.state === 'busy') {
      warning.textContent = '⚠️ Denne prøvetager er allerede i gang med en opgave.';
      warning.style.display = 'block';
    } else if (chosen?.dataset.state === 'break') {
      warning.textContent = '⚠️ Denne prøvetager er på pause.';
      warning.style.display = 'block';
    } else {
      warning.style.display = 'none';
    }
  };
  sel.onchange = updateWarning;
  updateWarning(); // run once on open

  openModal('modal-assign');
}

/* ────────────────────────────────────────────
   ESCALATION HELPER (Feature 5)
──────────────────────────────────────────── */

/** Returns minutes since task.time (HH:MM), assuming same day. */
function minutesOpen(task) {
  if (!task.time) return 0;
  const [hh, mm] = task.time.split(':').map(Number);
  const now = new Date();
  const taskMin = hh * 60 + mm;
  const nowMin  = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, nowMin - taskMin);
}

function confirmAssign() {
  if (assignMode === 'group') {
    confirmGroupAssign();
    return;
  }
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

function setAssignMode(mode) {
  assignMode = mode;
  document.getElementById('assign-tab-single').classList.toggle('active', mode === 'single');
  document.getElementById('assign-tab-group').classList.toggle('active', mode === 'group');
  document.getElementById('assign-single-body').style.display = mode === 'single' ? '' : 'none';
  document.getElementById('assign-group-body').style.display  = mode === 'group'  ? '' : 'none';

  if (mode === 'group') {
    const sel = document.getElementById('assign-group-worker');
    sel.innerHTML = '';
    STAFF.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      const stateLabel = s.state === 'busy' ? ' (optaget 🔴)' : s.state === 'break' ? ' (pause 🟡)' : '';
      opt.textContent = s.name + stateLabel;
      sel.appendChild(opt);
    });
    renderGroupTasks();
  }
  updateAssignButtonLabel();
}

function renderGroupTasks() {
  const dept = document.getElementById('assign-group-dept').value;
  const listEl = document.getElementById('assign-group-task-list');
  const tasks = TASKS.filter(t => t.status === 'open' && t.dept === dept);

  if (tasks.length === 0) {
    listEl.innerHTML = '<div class="assign-group-empty">Ingen åbne opgaver i denne afdeling</div>';
  } else {
    listEl.innerHTML = tasks.map(t => `
      <label class="assign-group-task-item">
        <input type="checkbox" checked data-task-id="${t.id}" onchange="updateAssignButtonLabel()">
        <span>${t.type} · ${PRIO_LABEL[t.prio]} · ${t.deadline}</span>
      </label>`).join('');
  }
  updateAssignButtonLabel();
}

function updateAssignButtonLabel() {
  const btn = document.getElementById('assign-confirm-btn');
  if (assignMode === 'single') {
    btn.textContent = 'Tildel opgave';
    return;
  }
  const checked = document.querySelectorAll('#assign-group-task-list input[type="checkbox"]:checked');
  const worker = document.getElementById('assign-group-worker')?.value || '–';
  btn.textContent = `Tildel ${checked.length} opgaver til ${worker}`;
}

function confirmGroupAssign() {
  const worker = document.getElementById('assign-group-worker').value;
  const checkedEls = document.querySelectorAll('#assign-group-task-list input[type="checkbox"]:checked');
  let count = 0;
  checkedEls.forEach(cb => {
    const id = Number(cb.dataset.taskId);
    const t = TASKS.find(x => x.id === id);
    if (t && t.status === 'open') {
      t.assignee = worker;
      t.status = 'taken';
      count++;
    }
  });
  closeModal('modal-assign');
  renderPlannerTasks();
  updateStats();
  if (count > 0) {
    toast('Gruppetildeling gennemført', `${count} opgaver tildelt til ${worker}.`, 'blue');
  }
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

  TASKS.unshift({
    id: nextId++, dept, type, prio: selPrioVal,
    deadline, note, status: assignee ? 'taken' : 'open', assignee, time,
  });

  // Reset form
  document.getElementById('nt-note').value    = '';
  document.getElementById('nt-assign').value  = '';
  selPrio(document.querySelector('.prio-pill.p-rutine'), 'rutine');

  renderPlannerTasks();
  updateStats();
  renderActivityLog();

  toast(
    selPrioVal === 'akut' ? 'Akut opgave oprettet' : 'Opgave oprettet',
    `${dept} · ${deadline}`,
    selPrioVal === 'akut' ? 'red' : 'green',
  );
}

function scrollToCreate() {
  document.getElementById('create-section')
    .scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ────────────────────────────────────────────
   AKUT KALD
──────────────────────────────────────────── */

function confirmAkutKald() {
  const dept = document.getElementById('akut-dept').value;
  const msg  = document.getElementById('akut-msg').value.trim();
  pendingAkutDept = dept;
  pendingAkutMsg  = msg;
  document.getElementById('akut-confirm-desc').textContent =
    `Afdeling: ${dept} · Besked: "${msg}" — Dette sender en notifikation til alle aktive prøvetagere.`;
  closeModal('modal-akut');
  openModal('modal-akut-confirm');
}

function fireAkutKald() {
  const dept = pendingAkutDept;
  const msg  = pendingAkutMsg;
  pendingAkutDept = null;
  pendingAkutMsg  = null;

  if (!dept) return;

  const now  = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  TASKS.unshift({
    id: nextId++, dept, type: `Akut kald – ${msg}`, prio: 'akut',
    deadline: 'Øjeblikkeligt', note: 'Notifikation sendt til alle prøvetagere',
    status: 'open', assignee: null, time,
  });

  closeModal('modal-akut-confirm');
  renderPlannerTasks();
  updateStats();
  toast('Akut kald sendt', `${dept} · Alle prøvetagere notificeret`, 'red');

  showWorkerAkutModal(dept, msg, TASKS[0].id);
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
    const shortName = s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1]?.[0] ?? '') + '.';
    const activeTask = TASKS.find(t => t.status === 'taken' && t.assignee === shortName);
    const taskLine = activeTask
      ? `<div class="staff-task-line">📍 ${activeTask.dept} · ${activeTask.type}</div>`
      : s.state === 'free'
        ? `<div class="staff-task-line" style="color:var(--gray-300);">Ingen aktiv opgave</div>`
        : '';

    const row = document.createElement('div');
    row.className = 'staff-row';
    row.innerHTML = `
      <div class="staff-av ${s.avClass}">${s.initials}</div>
      <div class="staff-info">
        <div class="staff-name">${s.name}</div>
        <div class="staff-dept">${s.dept}</div>
        ${taskLine}
      </div>
      <span class="badge ${STATE_CLS[s.state]}" style="font-size:.6875rem;">${STATE_LABEL[s.state]}</span>`;
    list.appendChild(row);
  });
}

/* ────────────────────────────────────────────
   AKTIVITETSLOG
──────────────────────────────────────────── */

function renderActivityLog() {
  const logList = document.getElementById('activity-log-list');
  const summary = document.getElementById('activity-summary');
  if (!logList || !summary) return;

  const done = TASKS
    .filter(t => t.status === 'done')
    .sort((a, b) => {
      if (!a.completedAt && !b.completedAt) return 0;
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return b.completedAt.localeCompare(a.completedAt);
    });

  if (done.length === 0) {
    logList.innerHTML = '<div class="activity-empty">Ingen færdige opgaver endnu i dag.</div>';
    summary.textContent = '0 opgaver færdige';
    return;
  }

  logList.innerHTML = '';
  done.forEach(t => {
    const row = document.createElement('div');
    row.className = `activity-row${t.prio === 'akut' ? ' akut' : ''}`;
    row.innerHTML = `
      <div class="activity-time">${t.completedAt ?? '–'}</div>
      <div class="activity-info">
        <div class="activity-title">${t.assignee ?? '–'} · ${t.dept}</div>
        <div class="activity-sub">${t.type} · ${PRIO_LABEL[t.prio]}</div>
      </div>
      <div class="activity-duration">${t.durationMin != null ? t.durationMin + ' min' : '–'}</div>`;
    logList.appendChild(row);
  });

  const akutCount = done.filter(t => t.prio === 'akut').length;
  const withDuration = done.filter(t => t.durationMin != null);
  const avgMin = withDuration.length
    ? (withDuration.reduce((s, t) => s + t.durationMin, 0) / withDuration.length).toFixed(1)
    : null;
  summary.textContent =
    `${done.length} opgaver færdige · ${akutCount} akutte` +
    (avgMin !== null ? ` · Gns. ${avgMin} min` : '');
}
