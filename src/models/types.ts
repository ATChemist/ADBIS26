export type TaskPriority = 'akut' | 'standard';
export type TaskStatus = 'venter' | 'tildelt' | 'igang' | 'faerdig' | 'afmeldt';
export type TaskType = 'blodprove' | 'ekg' | 'andet';
export type ScreenMode = 'normal' | 'loading' | 'empty' | 'error';
export type ClockPreset = 'morgen' | 'midt-paa-dag' | 'naer-fyraften';
export type ScreenKey =
  | 'home'
  | 'bio.dashboard'
  | 'bio.tasks'
  | 'bio.detail'
  | 'bio.cancel'
  | 'planner.overview'
  | 'planner.assign'
  | 'planner.chat'
  | 'requester.create'
  | 'requester.confirm'
  | 'requester.status';

export interface Department {
  id: string;
  name: string;
  area: string;
  phoneLabel: string;
}

export interface Team {
  id: string;
  name: string;
  departmentIds: string[];
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  teamId: string;
  onShift: boolean;
}

export interface ExtraCheckItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;
  patientName: string;
  patientId: string;
  requestedByDeptId: string;
  departmentId: string;
  location: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  assignedTeamId?: string;
  assignedEmployeeId?: string;
  autoAssignDeadlineAt: number;
  autoAssigned?: boolean;
  lockedToTeam?: boolean;
  requiresExtraCheck: boolean;
  extraCheckCompleted: boolean;
  extraCheckItems: ExtraCheckItem[];
  cancellationReasonCode?: string;
  cancellationReasonNote?: string;
  cancellationRequestedAt?: number;
  cancellationContactPlanner?: boolean;
}

export interface HelpRequest {
  id: string;
  employeeId: string;
  createdAt: number;
  source: 'dashboard' | 'detail';
  taskId?: string;
}

export interface ChatMessage {
  id: string;
  taskId: string;
  senderRole: 'bioanalytiker' | 'planlaegger' | 'rekvirent';
  senderName: string;
  text: string;
  createdAt: number;
  isTemplate?: boolean;
}

export interface ToastItem {
  id: string;
  tone: 'success' | 'info' | 'warn' | 'error';
  title: string;
  message?: string;
}

export interface ScreenModes {
  [key: string]: ScreenMode;
}

export interface AppState {
  now: number;
  lastSyncedAt: number;
  offline: boolean;
  clockPreset: ClockPreset;
  screenModes: ScreenModes;
  departments: Department[];
  teams: Team[];
  employees: Employee[];
  tasks: Task[];
  helpRequests: HelpRequest[];
  chatMessages: ChatMessage[];
  toasts: ToastItem[];
  currentBioanalystId: string;
  currentRequesterDeptId: string;
}

export interface CreateTaskInput {
  departmentId: string;
  type: TaskType;
  priority: TaskPriority;
  patientId: string;
  patientName: string;
  location: string;
}

export interface CancelTaskInput {
  taskId: string;
  reasonCode: string;
  reasonNote?: string;
  confirmedLateCancel?: boolean;
  contactedPlanner?: boolean;
}
