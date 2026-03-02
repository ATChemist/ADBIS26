import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { APP_ROUTES } from '../routes';
import { BASE_NOW, createInitialStateData } from '../mock/data';
import type {
  AppState,
  CancelTaskInput,
  ChatMessage,
  ClockPreset,
  CreateTaskInput,
  HelpRequest,
  ScreenKey,
  ScreenMode,
  Task,
  ToastItem,
} from './types';

const ONE_SECOND = 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const mockTimes: Record<ClockPreset, { hour: number; minute: number; second: number }> = {
  morgen: { hour: 8, minute: 12, second: 0 },
  'midt-paa-dag': { hour: 11, minute: 40, second: 0 },
  'naer-fyraften': { hour: 15, minute: 20, second: 0 },
};

let idCounter = 1000;

type Action =
  | { type: 'tick' }
  | { type: 'setOffline'; offline: boolean }
  | { type: 'setClockPreset'; preset: ClockPreset }
  | { type: 'setScreenMode'; key: ScreenKey; mode: ScreenMode }
  | { type: 'takeTask'; taskId: string }
  | { type: 'startTask'; taskId: string }
  | { type: 'completeTask'; taskId: string }
  | { type: 'toggleExtraCheckItem'; taskId: string; itemId: string }
  | { type: 'requestHelp'; source: HelpRequest['source']; taskId?: string }
  | { type: 'cancelTask'; input: CancelTaskInput }
  | { type: 'assignTask'; taskId: string; teamId?: string; employeeId?: string; auto?: boolean }
  | { type: 'toggleTaskLock'; taskId: string }
  | {
      type: 'sendChat';
      taskId: string;
      text: string;
      senderRole: ChatMessage['senderRole'];
      senderName: string;
      isTemplate?: boolean;
    }
  | { type: 'createTask'; taskId: string; input: CreateTaskInput }
  | { type: 'pushToast'; toast: ToastItem }
  | { type: 'dismissToast'; toastId: string };

function createInitialScreenModes(): AppState['screenModes'] {
  return APP_ROUTES.reduce<AppState['screenModes']>((acc, route) => {
    acc[route.key] = 'normal';
    return acc;
  }, {});
}

function alignNowToPreset(referenceNow: number, preset: ClockPreset): number {
  const next = new Date(referenceNow);
  const time = mockTimes[preset];
  next.setHours(time.hour, time.minute, time.second, 0);
  return next.getTime();
}

function createInitialState(): AppState {
  const seed = createInitialStateData();
  const now = alignNowToPreset(BASE_NOW, 'morgen');

  return {
    now,
    lastSyncedAt: now,
    offline: false,
    clockPreset: 'morgen',
    screenModes: createInitialScreenModes(),
    departments: seed.departments,
    teams: seed.teams,
    employees: seed.employees,
    tasks: seed.tasks,
    helpRequests: seed.helpRequests,
    chatMessages: seed.chatMessages,
    toasts: [],
    currentBioanalystId: 'bio-03',
    currentRequesterDeptId: 'dep-med',
  };
}

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function patchTask(tasks: Task[], taskId: string, patcher: (task: Task) => Task): Task[] {
  return tasks.map((task) => (task.id === taskId ? patcher(task) : task));
}

function teamForDepartment(state: AppState, departmentId: string): string | undefined {
  return state.teams.find((team) => team.departmentIds.includes(departmentId))?.id;
}

function teamForEmployee(state: AppState, employeeId?: string): string | undefined {
  if (!employeeId) return undefined;
  return state.employees.find((employee) => employee.id === employeeId)?.teamId;
}

function pushToast(toasts: ToastItem[], toast: ToastItem): ToastItem[] {
  return [...toasts, toast].slice(-5);
}

function autoAssignWaitingTasks(state: AppState): AppState {
  let changed = false;
  const tasks = state.tasks.map((task) => {
    if (task.status !== 'venter') return task;
    if (task.autoAssignDeadlineAt > state.now) return task;

    changed = true;
    const assignedTeamId = task.priority === 'akut' ? 'team-akut' : teamForDepartment(state, task.departmentId);
    return {
      ...task,
      status: 'tildelt',
      assignedTeamId,
      autoAssigned: true,
      updatedAt: state.now,
    } satisfies Task;
  });

  return changed ? { ...state, tasks } : state;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'tick': {
      const nextNow = state.now + ONE_SECOND;
      const ticked: AppState = {
        ...state,
        now: nextNow,
        lastSyncedAt: state.offline ? state.lastSyncedAt : nextNow,
      };
      return autoAssignWaitingTasks(ticked);
    }
    case 'setOffline':
      return {
        ...state,
        offline: action.offline,
        lastSyncedAt: state.now,
      };
    case 'setClockPreset': {
      const nextNow = alignNowToPreset(state.now, action.preset);
      const nextState = {
        ...state,
        now: nextNow,
        clockPreset: action.preset,
        lastSyncedAt: state.offline ? state.lastSyncedAt : nextNow,
      };
      return autoAssignWaitingTasks(nextState);
    }
    case 'setScreenMode':
      return {
        ...state,
        screenModes: {
          ...state.screenModes,
          [action.key]: action.mode,
        },
      };
    case 'takeTask':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => ({
          ...task,
          status: 'tildelt',
          assignedTeamId: teamForEmployee(state, state.currentBioanalystId) ?? task.assignedTeamId,
          assignedEmployeeId: state.currentBioanalystId,
          updatedAt: state.now,
          autoAssigned: task.autoAssigned ?? false,
        })),
      };
    case 'startTask':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => ({
          ...task,
          status: 'igang',
          assignedTeamId: teamForEmployee(state, state.currentBioanalystId) ?? task.assignedTeamId,
          assignedEmployeeId: state.currentBioanalystId,
          updatedAt: state.now,
        })),
      };
    case 'completeTask':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => ({
          ...task,
          status: 'faerdig',
          updatedAt: state.now,
        })),
      };
    case 'toggleExtraCheckItem':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => {
          const items = task.extraCheckItems.map((item) =>
            item.id === action.itemId ? { ...item, done: !item.done } : item,
          );
          return {
            ...task,
            extraCheckItems: items,
            extraCheckCompleted: items.every((item) => item.done),
            updatedAt: state.now,
          };
        }),
      };
    case 'requestHelp': {
      const help: HelpRequest = {
        id: nextId('help'),
        employeeId: state.currentBioanalystId,
        createdAt: state.now,
        source: action.source,
        taskId: action.taskId,
      };
      return {
        ...state,
        helpRequests: [help, ...state.helpRequests].slice(0, 20),
      };
    }
    case 'cancelTask':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.input.taskId, (task) => {
          const keepTeam = task.lockedToTeam && task.assignedTeamId;
          return {
            ...task,
            status: keepTeam ? 'tildelt' : 'venter',
            assignedEmployeeId: undefined,
            assignedTeamId: keepTeam ? task.assignedTeamId : undefined,
            updatedAt: state.now,
            cancellationReasonCode: action.input.reasonCode,
            cancellationReasonNote: action.input.reasonNote,
            cancellationRequestedAt: state.now,
            cancellationContactPlanner: action.input.contactedPlanner,
          } satisfies Task;
        }),
      };
    case 'assignTask':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => {
          const resolvedTeamId = action.teamId ?? teamForEmployee(state, action.employeeId) ?? task.assignedTeamId;
          return {
            ...task,
            assignedTeamId: resolvedTeamId,
            assignedEmployeeId: action.employeeId,
            status: task.status === 'faerdig' ? 'faerdig' : 'tildelt',
            autoAssigned: action.auto ?? task.autoAssigned,
            updatedAt: state.now,
          } satisfies Task;
        }),
      };
    case 'toggleTaskLock':
      return {
        ...state,
        tasks: patchTask(state.tasks, action.taskId, (task) => ({
          ...task,
          lockedToTeam: !task.lockedToTeam,
          updatedAt: state.now,
        })),
      };
    case 'sendChat': {
      const message: ChatMessage = {
        id: nextId('msg'),
        taskId: action.taskId,
        senderRole: action.senderRole,
        senderName: action.senderName,
        text: action.text,
        createdAt: state.now,
        isTemplate: action.isTemplate,
      };
      return {
        ...state,
        chatMessages: [...state.chatMessages, message],
      };
    }
    case 'createTask': {
      const currentStandardCount = state.tasks.filter((task) => task.priority === 'standard').length;
      const willRequireExtraCheck =
        action.input.priority === 'standard' && (currentStandardCount + 1) % 5 === 0;
      const newTask: Task = {
        id: action.taskId,
        patientName: action.input.patientName || 'Ukendt patient',
        patientId: action.input.patientId,
        requestedByDeptId: action.input.departmentId,
        departmentId: action.input.departmentId,
        location: action.input.location,
        type: action.input.type,
        priority: action.input.priority,
        status: 'venter',
        createdAt: state.now,
        updatedAt: state.now,
        assignedTeamId: undefined,
        assignedEmployeeId: undefined,
        autoAssignDeadlineAt: state.now + FIFTEEN_MINUTES,
        autoAssigned: false,
        lockedToTeam: false,
        requiresExtraCheck: willRequireExtraCheck,
        extraCheckCompleted: false,
        extraCheckItems: [
          { id: 'id-match', label: 'Bekræft patient-ID', done: false },
          { id: 'label-check', label: 'Bekræft mærkning før prøvetagning', done: false },
          { id: 'double-confirm', label: 'Ekstra kontrol udført', done: false },
        ],
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
      };
    }
    case 'pushToast':
      return {
        ...state,
        toasts: pushToast(state.toasts, action.toast),
      };
    case 'dismissToast':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      };
    default:
      return state;
  }
}

const StateContext = createContext<AppState | undefined>(undefined);
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: 'tick' });
    }, ONE_SECOND);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const stateValue = useMemo(() => state, [state]);

  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

export function useAppDispatch(): Dispatch<Action> {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return context;
}

export function createToastPayload(
  tone: ToastItem['tone'],
  title: string,
  message?: string,
): ToastItem {
  return {
    id: nextId('toast'),
    tone,
    title,
    message,
  };
}

export function createTaskId(): string {
  return nextId('task');
}

export type AppAction = Action;
