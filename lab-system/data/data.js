/**
 * data.js  –  Mock data for LabSystem prototype
 * Hillerød · Klinisk Biokemisk Laboratorium
 *
 * TODO: Replace with real API calls (e.g. fetch('/api/tasks'), fetch('/api/staff'))
 */

'use strict';

/**
 * @typedef {Object} StaffMember
 * @property {number} id
 * @property {string} name
 * @property {string} initials
 * @property {string} avClass      - CSS class for avatar colour
 * @property {string} dept         - Current department / location
 * @property {'free'|'busy'|'break'} state
 * @property {string[]} competences - Department codes this person can service
 */

/** @type {StaffMember[]} */
const STAFF = [
  { id: 1, name: 'Sofia A.',  initials: 'SA', avClass: 'av-violet', dept: '0141 – Kirurgisk',   state: 'busy',  competences: ['0141','0312','0830','0724','0915'] },
  { id: 2, name: 'Marcus K.', initials: 'MK', avClass: 'av-blue',   dept: '0610 – Ortopæd',    state: 'free',  competences: ['0610','0915','0830'] },
  { id: 3, name: 'Lena T.',   initials: 'LT', avClass: 'av-teal',   dept: '0915 – Medicinsk',  state: 'busy',  competences: ['0915','0141','0440','0520'] },
  { id: 4, name: 'Jonas P.',  initials: 'JP', avClass: 'av-amber',  dept: 'Ledig',             state: 'free',  competences: ['0141','0312','0610','0724','0830','0915'] },
  { id: 5, name: 'Rania N.',  initials: 'RN', avClass: 'av-rose',   dept: '0724 – Lunge',      state: 'busy',  competences: ['0724','0830','0312'] },
  { id: 6, name: 'Emil B.',   initials: 'EB', avClass: 'av-lime',   dept: 'Pause',             state: 'break', competences: ['0141','0915'] },
];

/**
 * @typedef {Object} Task
 * @property {number}  id
 * @property {string}  dept
 * @property {string}  type
 * @property {'akut'|'fremsk'|'udskr'|'rutine'} prio
 * @property {string}  deadline
 * @property {string}  note
 * @property {'open'|'taken'|'done'} status
 * @property {string|null} assignee
 * @property {string}  time       - HH:MM when the task was created
 */

/** @type {Task[]} */
const INITIAL_TASKS = [
  { id: 1, dept: '0312 – Intensiv',           type: 'Blodprøve – akut',          prio: 'akut',   deadline: 'Øjeblikkeligt', note: 'Patient i kritisk tilstand',              status: 'open',  assignee: null,        time: '08:02' },
  { id: 2, dept: '0141 – Kirurgisk',           type: 'Blodprøve – rutine',         prio: 'fremsk', deadline: 'Inden 30 min',  note: 'Operation kl. 10 – haster',              status: 'taken', assignee: 'Sofia A.',  time: '07:45' },
  { id: 3, dept: '0520 – Børneafdeling',       type: 'Blodprøve – rutine',         prio: 'rutine', deadline: 'Inden kl. 12',  note: '',                                        status: 'open',  assignee: null,        time: '07:50' },
  { id: 4, dept: '0830 – Akutafdeling',        type: 'Svær patient (ekstra hjælp)', prio: 'akut',  deadline: 'Inden 15 min',  note: 'Svære vener – erfaren prøvetager',        status: 'open',  assignee: null,        time: '08:10' },
  { id: 5, dept: '0915 – Medicinsk',           type: 'Blodprøve – rutine',         prio: 'rutine', deadline: 'Inden kl. 12',  note: '',                                        status: 'taken', assignee: 'Lena T.',   time: '07:55' },
  { id: 6, dept: '0440 – Psykiatrisk',         type: 'Blodprøve – rutine',         prio: 'udskr',  deadline: 'Inden kl. 16',  note: 'Udskrives i dag',                         status: 'open',  assignee: null,        time: '08:05' },
  { id: 7, dept: '0724 – Lunge / Infektiøs',  type: 'Blodprøve – akut',           prio: 'akut',   deadline: 'Inden 15 min',  note: 'Isolationspatient – brug værnemidler',    status: 'open',  assignee: null,        time: '08:12' },
  { id: 8, dept: '0610 – Ortopædkirurgisk',    type: 'Urinprøve',                  prio: 'rutine', deadline: 'Inden kl. 12',  note: '',                                        status: 'done',  assignee: 'Marcus K.', time: '07:40' },
];

/**
 * Planner user accounts (prototype — replace with real auth)
 * @type {{ name: string, initials: string, avClass: string }[]}
 */
const PLANNER_USERS = [
  { name: 'Camilla D. Nielsen',    initials: 'CD', avClass: 'av-blue' },
  { name: 'Anette J. Vestergaard', initials: 'AJ', avClass: 'av-teal' },
];

/**
 * Worker user accounts (prototype — replace with real auth)
 * Maps to STAFF entries by first name
 * @type {{ name: string }[]}
 */
const WORKER_USERS = [
  { name: 'Sofia A.'  },
  { name: 'Marcus K.' },
  { name: 'Lena T.'   },
  { name: 'Jonas P.'  },
  { name: 'Rania N.'  },
];
