import type { AppState, ChatMessage, Department, Employee, ExtraCheckItem, HelpRequest, Task, Team } from '../models/types';

export const BASE_NOW = new Date('2026-02-26T08:12:00').getTime();
const FIFTEEN_MIN = 15 * 60 * 1000;

export const departments: Department[] = [
  { id: 'dep-akut', name: 'Akutmodtagelsen', area: 'Nord', phoneLabel: 'Fælles akutlinje' },
  { id: 'dep-kir', name: 'Kirurgisk Afsnit', area: 'Nord', phoneLabel: 'Kirurgisk vagtlinje' },
  { id: 'dep-med', name: 'Medicinsk Afsnit', area: 'Syd', phoneLabel: 'Medicinsk vagtlinje' },
  { id: 'dep-hjerte', name: 'Hjerteklinik', area: 'Syd', phoneLabel: 'Hjerte vagtlinje' },
  { id: 'dep-orto', name: 'Ortopædkirurgi', area: 'Vest', phoneLabel: 'Orto vagtlinje' },
  { id: 'dep-boern', name: 'Børnemodtagelse', area: 'Vest', phoneLabel: 'Børne vagtlinje' },
];

export const teams: Team[] = [
  { id: 'team-nord', name: 'Team Nord', departmentIds: ['dep-akut', 'dep-kir'] },
  { id: 'team-syd', name: 'Team Syd', departmentIds: ['dep-med', 'dep-hjerte'] },
  { id: 'team-vest', name: 'Team Vest', departmentIds: ['dep-orto', 'dep-boern'] },
  { id: 'team-akut', name: 'Akut Team', departmentIds: ['dep-akut', 'dep-boern'] },
];

export const employees: Employee[] = [
  { id: 'bio-01', name: 'Anna Madsen', initials: 'AM', teamId: 'team-nord', onShift: true },
  { id: 'bio-02', name: 'Jonas Friis', initials: 'JF', teamId: 'team-nord', onShift: true },
  { id: 'bio-03', name: 'Sara Holm', initials: 'SH', teamId: 'team-nord', onShift: true },
  { id: 'bio-04', name: 'Mikkel Bro', initials: 'MB', teamId: 'team-syd', onShift: true },
  { id: 'bio-05', name: 'Lene Voss', initials: 'LV', teamId: 'team-syd', onShift: true },
  { id: 'bio-06', name: 'Nadia Bach', initials: 'NB', teamId: 'team-syd', onShift: true },
  { id: 'bio-07', name: 'Peter Wulff', initials: 'PW', teamId: 'team-vest', onShift: true },
  { id: 'bio-08', name: 'Iben Mørk', initials: 'IM', teamId: 'team-vest', onShift: true },
  { id: 'bio-09', name: 'Tobias Lund', initials: 'TL', teamId: 'team-vest', onShift: true },
  { id: 'bio-10', name: 'Emil Skov', initials: 'ES', teamId: 'team-akut', onShift: true },
  { id: 'bio-11', name: 'Rikke Due', initials: 'RD', teamId: 'team-akut', onShift: true },
  { id: 'bio-12', name: 'Mona Birk', initials: 'MB', teamId: 'team-akut', onShift: true },
  { id: 'bio-13', name: 'Oskar Hviid', initials: 'OH', teamId: 'team-nord', onShift: true },
  { id: 'bio-14', name: 'Karin Abel', initials: 'KA', teamId: 'team-syd', onShift: true },
  { id: 'bio-15', name: 'Sofie Tang', initials: 'ST', teamId: 'team-vest', onShift: true },
  { id: 'bio-16', name: 'Rasmus Pihl', initials: 'RP', teamId: 'team-nord', onShift: true },
  { id: 'bio-17', name: 'Lea Grau', initials: 'LG', teamId: 'team-syd', onShift: true },
  { id: 'bio-18', name: 'Henrik Bo', initials: 'HB', teamId: 'team-vest', onShift: true },
];

interface TaskSeed {
  patientName: string;
  patientId: string;
  requestedByDeptId: string;
  departmentId: string;
  location: string;
  type: Task['type'];
  priority: Task['priority'];
  createdMinutesAgo: number;
  status: Task['status'];
  assignedTeamId?: string;
  assignedEmployeeId?: string;
  updatedMinutesAgo?: number;
}

const taskSeeds: TaskSeed[] = [
  {
    patientName: 'Karen Jensen',
    patientId: 'P-1001',
    requestedByDeptId: 'dep-med',
    departmentId: 'dep-med',
    location: 'Stue 12A',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 6,
    status: 'venter',
  },
  {
    patientName: 'Omar Ali',
    patientId: 'P-1002',
    requestedByDeptId: 'dep-akut',
    departmentId: 'dep-akut',
    location: 'Rum 3',
    type: 'ekg',
    priority: 'akut',
    createdMinutesAgo: 3,
    status: 'venter',
  },
  {
    patientName: 'Grete Poulsen',
    patientId: 'P-1003',
    requestedByDeptId: 'dep-kir',
    departmentId: 'dep-kir',
    location: 'Stue 8',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 17,
    status: 'venter',
  },
  {
    patientName: 'Mads Toft',
    patientId: 'P-1004',
    requestedByDeptId: 'dep-hjerte',
    departmentId: 'dep-hjerte',
    location: 'Hjerte 2',
    type: 'ekg',
    priority: 'standard',
    createdMinutesAgo: 11,
    status: 'tildelt',
    assignedTeamId: 'team-syd',
    assignedEmployeeId: 'bio-04',
    updatedMinutesAgo: 10,
  },
  {
    patientName: 'Eva Nørby',
    patientId: 'P-1005',
    requestedByDeptId: 'dep-orto',
    departmentId: 'dep-orto',
    location: 'Stue 1',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 14,
    status: 'tildelt',
    assignedTeamId: 'team-vest',
    assignedEmployeeId: 'bio-07',
    updatedMinutesAgo: 9,
  },
  {
    patientName: 'Jon Petersen',
    patientId: 'P-1006',
    requestedByDeptId: 'dep-med',
    departmentId: 'dep-med',
    location: 'Stue 14',
    type: 'andet',
    priority: 'standard',
    createdMinutesAgo: 20,
    status: 'igang',
    assignedTeamId: 'team-nord',
    assignedEmployeeId: 'bio-03',
    updatedMinutesAgo: 4,
  },
  {
    patientName: 'Mia Stage',
    patientId: 'P-1007',
    requestedByDeptId: 'dep-boern',
    departmentId: 'dep-boern',
    location: 'Børne 5',
    type: 'blodprove',
    priority: 'akut',
    createdMinutesAgo: 1,
    status: 'venter',
  },
  {
    patientName: 'Niels Gade',
    patientId: 'P-1008',
    requestedByDeptId: 'dep-kir',
    departmentId: 'dep-kir',
    location: 'Stue 2',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 8,
    status: 'tildelt',
    assignedTeamId: 'team-nord',
    assignedEmployeeId: 'bio-03',
    updatedMinutesAgo: 7,
  },
  {
    patientName: 'Lars Vibe',
    patientId: 'P-1009',
    requestedByDeptId: 'dep-hjerte',
    departmentId: 'dep-hjerte',
    location: 'Hjerte 7',
    type: 'ekg',
    priority: 'akut',
    createdMinutesAgo: 9,
    status: 'tildelt',
    assignedTeamId: 'team-akut',
    assignedEmployeeId: 'bio-10',
    updatedMinutesAgo: 6,
  },
  {
    patientName: 'Asta Winther',
    patientId: 'P-1010',
    requestedByDeptId: 'dep-med',
    departmentId: 'dep-med',
    location: 'Stue 5',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 13,
    status: 'venter',
  },
  {
    patientName: 'Rolf Krag',
    patientId: 'P-1011',
    requestedByDeptId: 'dep-kir',
    departmentId: 'dep-kir',
    location: 'Stue 15',
    type: 'andet',
    priority: 'standard',
    createdMinutesAgo: 24,
    status: 'faerdig',
    assignedTeamId: 'team-nord',
    assignedEmployeeId: 'bio-02',
    updatedMinutesAgo: 2,
  },
  {
    patientName: 'Ulla Svane',
    patientId: 'P-1012',
    requestedByDeptId: 'dep-akut',
    departmentId: 'dep-akut',
    location: 'Akut 4',
    type: 'blodprove',
    priority: 'akut',
    createdMinutesAgo: 16,
    status: 'venter',
  },
  {
    patientName: 'Freja Møller',
    patientId: 'P-1013',
    requestedByDeptId: 'dep-orto',
    departmentId: 'dep-orto',
    location: 'Stue 22',
    type: 'ekg',
    priority: 'standard',
    createdMinutesAgo: 5,
    status: 'venter',
  },
  {
    patientName: 'Poul Vang',
    patientId: 'P-1014',
    requestedByDeptId: 'dep-boern',
    departmentId: 'dep-boern',
    location: 'Børne 3',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 7,
    status: 'venter',
  },
  {
    patientName: 'Rita Fogh',
    patientId: 'P-1015',
    requestedByDeptId: 'dep-med',
    departmentId: 'dep-med',
    location: 'Stue 10',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 22,
    status: 'tildelt',
    assignedTeamId: 'team-syd',
    assignedEmployeeId: 'bio-05',
    updatedMinutesAgo: 18,
  },
  {
    patientName: 'Kim Bach',
    patientId: 'P-1016',
    requestedByDeptId: 'dep-akut',
    departmentId: 'dep-akut',
    location: 'Akut 1',
    type: 'ekg',
    priority: 'akut',
    createdMinutesAgo: 12,
    status: 'igang',
    assignedTeamId: 'team-akut',
    assignedEmployeeId: 'bio-11',
    updatedMinutesAgo: 3,
  },
  {
    patientName: 'Bente Dahl',
    patientId: 'P-1017',
    requestedByDeptId: 'dep-hjerte',
    departmentId: 'dep-hjerte',
    location: 'Hjerte 5',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 10,
    status: 'venter',
  },
  {
    patientName: 'Aron Klein',
    patientId: 'P-1018',
    requestedByDeptId: 'dep-med',
    departmentId: 'dep-med',
    location: 'Stue 19',
    type: 'andet',
    priority: 'standard',
    createdMinutesAgo: 4,
    status: 'venter',
  },
  {
    patientName: 'Nora Ploug',
    patientId: 'P-1019',
    requestedByDeptId: 'dep-kir',
    departmentId: 'dep-kir',
    location: 'Stue 11',
    type: 'blodprove',
    priority: 'standard',
    createdMinutesAgo: 18,
    status: 'venter',
  },
  {
    patientName: 'Tage Holm',
    patientId: 'P-1020',
    requestedByDeptId: 'dep-boern',
    departmentId: 'dep-boern',
    location: 'Børne 2',
    type: 'blodprove',
    priority: 'akut',
    createdMinutesAgo: 2,
    status: 'venter',
  },
];

function baseExtraCheckItems(): ExtraCheckItem[] {
  return [
    { id: 'id-match', label: 'Bekræft patient-ID', done: false },
    { id: 'label-check', label: 'Bekræft mærkning før prøvetagning', done: false },
    { id: 'double-confirm', label: 'Ekstra kontrol udført', done: false },
  ];
}

function defaultTeamForDepartment(departmentId: string, priority: Task['priority']): string {
  if (priority === 'akut') return 'team-akut';
  const team = teams.find((candidate) => candidate.departmentIds.includes(departmentId));
  return team?.id ?? 'team-nord';
}

function buildTasks(): Task[] {
  let standardCounter = 0;

  return taskSeeds.map((seed, index) => {
    const createdAt = BASE_NOW - seed.createdMinutesAgo * 60_000;
    const updatedAt = BASE_NOW - (seed.updatedMinutesAgo ?? seed.createdMinutesAgo) * 60_000;
    const isStandard = seed.priority === 'standard';
    if (isStandard) standardCounter += 1;
    const requiresExtraCheck = isStandard && standardCounter % 5 === 0;
    const autoAssignDeadlineAt = createdAt + FIFTEEN_MIN;

    return {
      id: `task-${String(index + 1).padStart(3, '0')}`,
      patientName: seed.patientName,
      patientId: seed.patientId,
      requestedByDeptId: seed.requestedByDeptId,
      departmentId: seed.departmentId,
      location: seed.location,
      type: seed.type,
      priority: seed.priority,
      status: seed.status,
      createdAt,
      updatedAt,
      assignedTeamId: seed.assignedTeamId ?? (seed.status !== 'venter' ? defaultTeamForDepartment(seed.departmentId, seed.priority) : undefined),
      assignedEmployeeId: seed.assignedEmployeeId,
      autoAssignDeadlineAt,
      autoAssigned: seed.status !== 'venter' && seed.assignedTeamId == null,
      lockedToTeam: false,
      requiresExtraCheck,
      extraCheckCompleted: false,
      extraCheckItems: baseExtraCheckItems(),
    } satisfies Task;
  });
}

const helpRequests: HelpRequest[] = [
  {
    id: 'help-001',
    employeeId: 'bio-08',
    createdAt: BASE_NOW - 4 * 60_000,
    source: 'dashboard',
  },
];

const chatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    taskId: 'task-002',
    senderRole: 'rekvirent',
    senderName: 'Akutmodtagelsen',
    text: 'Patient er klar nu i Rum 3.',
    createdAt: BASE_NOW - 2 * 60_000,
  },
  {
    id: 'msg-002',
    taskId: 'task-002',
    senderRole: 'planlaegger',
    senderName: 'Koordinator Anne',
    text: 'Akut Team er orienteret.',
    createdAt: BASE_NOW - 90 * 1000,
    isTemplate: true,
  },
  {
    id: 'msg-003',
    taskId: 'task-008',
    senderRole: 'bioanalytiker',
    senderName: 'Sara Holm',
    text: 'På vej til stue 2.',
    createdAt: BASE_NOW - 3 * 60_000,
    isTemplate: true,
  },
];

export function createInitialStateData(): Pick<
  AppState,
  'departments' | 'teams' | 'employees' | 'tasks' | 'helpRequests' | 'chatMessages'
> {
  return {
    departments,
    teams,
    employees,
    tasks: buildTasks(),
    helpRequests,
    chatMessages,
  };
}
