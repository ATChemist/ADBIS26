import type { AppState, Employee, Task, TaskPriority, TaskStatus } from './types';

export function getDepartmentById(state: AppState, departmentId: string) {
  return state.departments.find((department) => department.id === departmentId);
}

export function getTeamById(state: AppState, teamId?: string) {
  if (!teamId) return undefined;
  return state.teams.find((team) => team.id === teamId);
}

export function getEmployeeById(state: AppState, employeeId?: string) {
  if (!employeeId) return undefined;
  return state.employees.find((employee) => employee.id === employeeId);
}

export function getCurrentBioanalyst(state: AppState): Employee {
  return state.employees.find((employee) => employee.id === state.currentBioanalystId) ?? state.employees[0];
}

export function getCurrentBioTeamId(state: AppState): string {
  return getCurrentBioanalyst(state).teamId;
}

export function getMyTasks(state: AppState): Task[] {
  return state.tasks
    .filter((task) => task.assignedEmployeeId === state.currentBioanalystId && task.status !== 'faerdig' && task.status !== 'afmeldt')
    .sort(sortTasksByPriority);
}

export function getTeamTasks(state: AppState): Task[] {
  const teamId = getCurrentBioTeamId(state);
  return state.tasks
    .filter(
      (task) =>
        task.assignedTeamId === teamId && task.status !== 'faerdig' && task.status !== 'afmeldt',
    )
    .sort(sortTasksByPriority);
}

export function getAcuteTasks(state: AppState): Task[] {
  return state.tasks
    .filter((task) => task.priority === 'akut' && task.status !== 'faerdig' && task.status !== 'afmeldt')
    .sort(sortTasksByPriority);
}

export function getOpenTasks(state: AppState): Task[] {
  return state.tasks.filter((task) => task.status !== 'faerdig' && task.status !== 'afmeldt');
}

export function countOpenTasks(state: AppState): number {
  return getOpenTasks(state).length;
}

export function countAcuteOpenTasks(state: AppState): number {
  return getOpenTasks(state).filter((task) => task.priority === 'akut').length;
}

export function getTasksByRequesterDept(state: AppState): Task[] {
  return state.tasks
    .filter((task) => task.requestedByDeptId === state.currentRequesterDeptId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getTaskById(state: AppState, taskId?: string): Task | undefined {
  if (!taskId) return undefined;
  return state.tasks.find((task) => task.id === taskId);
}

export function getTaskMessages(state: AppState, taskId?: string) {
  if (!taskId) return [];
  return state.chatMessages
    .filter((message) => message.taskId === taskId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getActiveHelpRequests(state: AppState) {
  return [...state.helpRequests].sort((a, b) => b.createdAt - a.createdAt);
}

export interface DepartmentLoad {
  departmentId: string;
  openCount: number;
  acuteCount: number;
  avgWaitMinutes: number;
  pressureLevel: 'lav' | 'middel' | 'høj';
}

export function getDepartmentLoads(state: AppState): DepartmentLoad[] {
  return state.departments.map((department) => {
    const tasks = state.tasks.filter(
      (task) => task.departmentId === department.id && task.status !== 'faerdig' && task.status !== 'afmeldt',
    );
    const openCount = tasks.length;
    const acuteCount = tasks.filter((task) => task.priority === 'akut').length;
    const avgWaitMinutes = openCount
      ? Math.round(tasks.reduce((sum, task) => sum + (state.now - task.createdAt) / 60_000, 0) / openCount)
      : 0;
    const pressureLevel: DepartmentLoad['pressureLevel'] =
      acuteCount >= 2 || avgWaitMinutes >= 15 || openCount >= 4
        ? 'høj'
        : acuteCount === 1 || avgWaitMinutes >= 8 || openCount >= 2
          ? 'middel'
          : 'lav';

    return {
      departmentId: department.id,
      openCount,
      acuteCount,
      avgWaitMinutes,
      pressureLevel,
    };
  });
}

export function getMorningRoundProgress(state: AppState) {
  const start = new Date(state.now);
  start.setHours(7, 30, 0, 0);
  const end = new Date(state.now);
  end.setHours(9, 0, 0, 0);
  const total = end.getTime() - start.getTime();
  const elapsed = Math.min(Math.max(0, state.now - start.getTime()), total);
  return {
    elapsed,
    total,
    percent: total > 0 ? Math.round((elapsed / total) * 100) : 0,
    isLate: state.now > end.getTime(),
  };
}

export function getAutoAssignCountdownMs(task: Task, now: number): number | null {
  if (task.status !== 'venter') return null;
  return Math.max(0, task.autoAssignDeadlineAt - now);
}

export function getQueueTasksForPlanner(state: AppState): Task[] {
  return state.tasks
    .filter((task) => task.status === 'venter')
    .sort(sortTasksByPriority);
}

export function getTasksForTeam(state: AppState, teamId: string): Task[] {
  return state.tasks
    .filter(
      (task) => task.assignedTeamId === teamId && task.status !== 'faerdig' && task.status !== 'afmeldt',
    )
    .sort(sortTasksByPriority);
}

export function getTasksForEmployee(state: AppState, employeeId: string): Task[] {
  return state.tasks
    .filter(
      (task) => task.assignedEmployeeId === employeeId && task.status !== 'faerdig' && task.status !== 'afmeldt',
    )
    .sort(sortTasksByPriority);
}

export function statusLabel(status: TaskStatus): string {
  switch (status) {
    case 'venter':
      return 'Venter';
    case 'tildelt':
      return 'Tildelt';
    case 'igang':
      return 'I gang';
    case 'faerdig':
      return 'Færdig';
    case 'afmeldt':
      return 'Afmeldt';
    default:
      return status;
  }
}

export function priorityLabel(priority: TaskPriority): string {
  return priority === 'akut' ? 'Akut' : 'Standard';
}

export function typeLabel(type: Task['type']): string {
  switch (type) {
    case 'blodprove':
      return 'Blodprøve';
    case 'ekg':
      return 'EKG';
    case 'andet':
      return 'Andet';
    default:
      return type;
  }
}

function sortTasksByPriority(a: Task, b: Task): number {
  const urgencyScore = (task: Task) => {
    const statusWeight = task.status === 'igang' ? 0 : task.status === 'tildelt' ? 1 : 2;
    const priorityWeight = task.priority === 'akut' ? 1000 : 0;
    return priorityWeight - statusWeight * 10 - task.createdAt / 100000000;
  };
  return urgencyScore(b) - urgencyScore(a);
}
