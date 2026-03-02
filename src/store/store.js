import { createSeedData } from "../data/seed";
import { DAY_PROFILES, PRIORITY_META } from "../utils/mappings";
import { isOlderThanMinutes, randomLatency } from "../utils/time";

const seed = createSeedData();
const OVERDUE_LIMIT_MINUTES = 15;

export const NETWORKED_ACTION_TYPES = new Set([
  "ASSIGN_TASK",
  "START_TASK",
  "COMPLETE_TASK",
  "REQUEST_HELP",
  "SET_EMP_STATUS",
  "CANCEL_TASK",
  "REASSIGN_TASK",
  "AUTO_ASSIGN_OVERDUE"
]);

export const initialState = {
  ...seed,
  view: "employee",
  connectivity: "online",
  actionQueue: [],
  ui: {
    loadingTaskId: null,
    loadingLabel: "",
    showDemoControls: true,
    isNextTasksOpen: true,
    modal: null,
    filters: {
      department: "all",
      priority: "all",
      status: "all",
      query: ""
    },
    toasts: []
  },
  demo: {
    dayProfile: "normal",
    targetTaskCount: 14
  }
};

function nowIso(action) {
  return action.meta?.ts ?? new Date().toISOString();
}

function eventId() {
  return `evt-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
}

function taskIdFromSequence(tasks) {
  const max = tasks.reduce((acc, task) => {
    const [, suffix = "0"] = task.id.split("-");
    return Math.max(acc, Number.parseInt(suffix, 10) || 0);
  }, 0);

  return `task-${String(max + 1).padStart(3, "0")}`;
}

function createTaskFactory(tasks) {
  const firstId = taskIdFromSequence(tasks);
  let counter = Number.parseInt(firstId.split("-")[1], 10) || 1;

  return function nextTaskId() {
    const next = `task-${String(counter).padStart(3, "0")}`;
    counter += 1;
    return next;
  };
}

function appendEvent(state, partialEvent) {
  const nextEvent = {
    id: eventId(),
    ...partialEvent
  };

  return {
    ...state,
    eventLog: [nextEvent, ...state.eventLog].slice(0, 60)
  };
}

function updateEmployeeTasks(employees, employeeId, updater) {
  return employees.map((employee) => {
    if (employee.id !== employeeId) {
      return employee;
    }

    return updater(employee);
  });
}

function removeTaskFromEmployee(employee, taskId) {
  return {
    ...employee,
    assignedTaskIds: employee.assignedTaskIds.filter((id) => id !== taskId)
  };
}

function addTaskToEmployee(employee, taskId) {
  if (employee.assignedTaskIds.includes(taskId)) {
    return employee;
  }

  return {
    ...employee,
    assignedTaskIds: [...employee.assignedTaskIds, taskId]
  };
}

function recalcEmployeeAvailability(employee, tasks, ts) {
  const hasOpenTasks = tasks.some(
    (task) =>
      task.assignedTo === employee.id &&
      ["assigned", "in_progress", "help_needed"].includes(task.status)
  );

  if (hasOpenTasks) {
    return {
      ...employee,
      status: "busy",
      lastActiveAt: ts
    };
  }

  return {
    ...employee,
    status: "available",
    lastActiveAt: ts
  };
}

function applyActionInternal(state, action) {
  const ts = nowIso(action);

  switch (action.type) {
    case "ASSIGN_TASK": {
      const { taskId, employeeId, actor = "Planlægger" } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      let employees = state.employees;
      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              assignedTo: employeeId,
              assignedAt: ts,
              status: "assigned"
            }
          : item
      );

      if (task.assignedTo && task.assignedTo !== employeeId) {
        employees = updateEmployeeTasks(employees, task.assignedTo, (employee) => {
          const nextEmployee = removeTaskFromEmployee(employee, taskId);
          return recalcEmployeeAvailability(nextEmployee, tasks, ts);
        });
      }

      employees = updateEmployeeTasks(employees, employeeId, (employee) => ({
        ...addTaskToEmployee(employee, taskId),
        status: "busy",
        lastActiveAt: ts
      }));

      return appendEvent(
        {
          ...state,
          employees,
          tasks
        },
        {
          ts,
          type: "TASK_ASSIGNED",
          actor,
          taskId,
          details: `Opgave tildelt medarbejder ${employeeId}`
        }
      );
    }

    case "START_TASK": {
      const { taskId, employeeId, actor = "Medarbejder" } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      const resolvedEmployeeId = employeeId ?? task.assignedTo;
      if (!resolvedEmployeeId) {
        return state;
      }

      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              assignedTo: resolvedEmployeeId,
              assignedAt: item.assignedAt ?? ts,
              startedAt: ts,
              status: "in_progress"
            }
          : item
      );

      const employees = updateEmployeeTasks(state.employees, resolvedEmployeeId, (employee) => ({
        ...addTaskToEmployee(employee, taskId),
        status: "busy",
        lastActiveAt: ts
      }));

      return appendEvent(
        {
          ...state,
          employees,
          tasks
        },
        {
          ts,
          type: "TASK_STARTED",
          actor,
          taskId,
          details: "Opgave påbegyndt"
        }
      );
    }

    case "COMPLETE_TASK": {
      const { taskId, actor = "Medarbejder" } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      const employeeId = task.assignedTo;
      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: "done",
              completedAt: ts
            }
          : item
      );

      let employees = state.employees;

      if (employeeId) {
        employees = updateEmployeeTasks(employees, employeeId, (employee) => {
          const nextEmployee = removeTaskFromEmployee(employee, taskId);
          return recalcEmployeeAvailability(nextEmployee, tasks, ts);
        });
      }

      return appendEvent(
        {
          ...state,
          employees,
          tasks
        },
        {
          ts,
          type: "TASK_COMPLETED",
          actor,
          taskId,
          details: "Opgave markeret færdig"
        }
      );
    }

    case "REQUEST_HELP": {
      const { taskId, employeeId, reason, actor = "Medarbejder" } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: "help_needed"
            }
          : item
      );

      const employees = updateEmployeeTasks(
        state.employees,
        employeeId ?? task.assignedTo,
        (employee) => ({
          ...employee,
          status: "busy",
          lastActiveAt: ts
        })
      );

      return appendEvent(
        {
          ...state,
          tasks,
          employees
        },
        {
          ts,
          type: "HELP_REQUESTED",
          actor,
          taskId,
          details: `Årsag: ${reason}`
        }
      );
    }

    case "SET_EMP_STATUS": {
      const { employeeId, status } = action.payload;
      const employee = state.employees.find((item) => item.id === employeeId);
      if (!employee) {
        return state;
      }

      return appendEvent(
        {
          ...state,
          employees: state.employees.map((item) =>
            item.id === employeeId
              ? {
                  ...item,
                  status,
                  lastActiveAt: ts
                }
              : item
          )
        },
        {
          ts,
          type: "EMPLOYEE_STATUS",
          actor: employee.name,
          details: `Status sat til ${status}`
        }
      );
    }

    case "CANCEL_TASK": {
      const { taskId, reason, actor = "Planlægger" } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: "cancelled",
              completedAt: ts
            }
          : item
      );

      let employees = state.employees;
      if (task.assignedTo) {
        employees = updateEmployeeTasks(employees, task.assignedTo, (employee) => {
          const nextEmployee = removeTaskFromEmployee(employee, taskId);
          return recalcEmployeeAvailability(nextEmployee, tasks, ts);
        });
      }

      return appendEvent(
        {
          ...state,
          tasks,
          employees
        },
        {
          ts,
          type: "TASK_CANCELLED",
          actor,
          taskId,
          details: `Annulleret: ${reason}`
        }
      );
    }

    case "REASSIGN_TASK": {
      const {
        taskId,
        toEmployeeId,
        reason,
        actor = "Planlægger"
      } = action.payload;
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return state;
      }

      const tasks = state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              assignedTo: toEmployeeId,
              assignedAt: ts,
              startedAt: null,
              status: "assigned"
            }
          : item
      );

      let employees = state.employees;

      if (task.assignedTo && task.assignedTo !== toEmployeeId) {
        employees = updateEmployeeTasks(employees, task.assignedTo, (employee) => {
          const nextEmployee = removeTaskFromEmployee(employee, taskId);
          return recalcEmployeeAvailability(nextEmployee, tasks, ts);
        });
      }

      employees = updateEmployeeTasks(employees, toEmployeeId, (employee) => ({
        ...addTaskToEmployee(employee, taskId),
        status: "busy",
        lastActiveAt: ts
      }));

      return appendEvent(
        {
          ...state,
          tasks,
          employees
        },
        {
          ts,
          type: "TASK_REASSIGNED",
          actor,
          taskId,
          details: `Omfordelt: ${reason}`
        }
      );
    }

    case "AUTO_ASSIGN_OVERDUE": {
      const overdueTasks = state.tasks.filter(
        (task) => task.status === "new" && isOlderThanMinutes(task.createdAt, OVERDUE_LIMIT_MINUTES)
      );

      if (overdueTasks.length === 0) {
        return state;
      }

      const eligibleEmployees = state.employees
        .filter((employee) => employee.status !== "break")
        .sort((a, b) => a.assignedTaskIds.length - b.assignedTaskIds.length);

      if (eligibleEmployees.length === 0) {
        return appendEvent(state, {
          ts,
          type: "AUTO_ASSIGN_SKIPPED",
          actor: "System",
          details: "Ingen tilgængelige medarbejdere"
        });
      }

      let employeeIndex = 0;
      let nextState = state;

      overdueTasks.forEach((task) => {
        const employee = eligibleEmployees[employeeIndex % eligibleEmployees.length];
        employeeIndex += 1;

        nextState = applyActionInternal(nextState, {
          type: "ASSIGN_TASK",
          payload: {
            taskId: task.id,
            employeeId: employee.id,
            actor: "Auto-tildeling"
          },
          meta: {
            ts
          }
        });
      });

      return appendEvent(nextState, {
        ts,
        type: "AUTO_ASSIGN_OVERDUE",
        actor: "System",
        details: `${overdueTasks.length} opgaver auto-tildelt`
      });
    }

    default:
      return state;
  }
}

function createGeneratedTask(state, nextTaskId, partial = {}) {
  const departments = state.departments;
  const department =
    partial.department ?? departments[Math.floor(Math.random() * departments.length)].id;
  const taskId = nextTaskId();
  const now = new Date();
  const createdAt = partial.createdAt ?? now.toISOString();

  return {
    id: taskId,
    title: partial.title ?? `Ny opgave ${taskId}`,
    department,
    priority: partial.priority ?? "ok",
    status: "new",
    assignedTo: null,
    assignedAt: null,
    startedAt: null,
    completedAt: null,
    createdAt,
    dueAt:
      partial.dueAt ??
      new Date(now.getTime() + (20 + Math.floor(Math.random() * 20)) * 60000).toISOString()
  };
}

function setTaskVolume(state, targetCount, profileLabel = "Demo") {
  const activeTasks = state.tasks.filter((task) => !["done", "cancelled"].includes(task.status));
  const delta = targetCount - activeTasks.length;

  if (delta === 0) {
    return state;
  }

  if (delta > 0) {
    const nextTaskId = createTaskFactory(state.tasks);
    const generated = Array.from({ length: delta }, (_, index) =>
      createGeneratedTask(state, nextTaskId, {
        title: `${profileLabel} · Opgave ${index + 1}`,
        priority: index % 4 === 0 ? "warn" : "ok"
      })
    );

    return {
      ...state,
      tasks: [...state.tasks, ...generated]
    };
  }

  const removableIds = state.tasks
    .filter((task) => task.status === "new")
    .slice(0, Math.abs(delta))
    .map((task) => task.id);

  if (removableIds.length === 0) {
    return state;
  }

  return {
    ...state,
    tasks: state.tasks.filter((task) => !removableIds.includes(task.id))
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return {
        ...state,
        view: action.payload
      };

    case "SET_CONNECTIVITY": {
      const connectivity = action.payload;
      return appendEvent(
        {
          ...state,
          connectivity
        },
        {
          ts: nowIso(action),
          type: "CONNECTIVITY",
          actor: "System",
          details: `System status: ${connectivity}`
        }
      );
    }

    case "QUEUE_ACTION":
      return {
        ...state,
        actionQueue: [
          ...state.actionQueue,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            action: action.payload
          }
        ]
      };

    case "FLUSH_QUEUE": {
      if (state.actionQueue.length === 0) {
        return state;
      }

      const flushedState = state.actionQueue.reduce((acc, queued) => {
        return applyActionInternal(acc, queued.action);
      }, state);

      return appendEvent(
        {
          ...flushedState,
          actionQueue: []
        },
        {
          ts: nowIso(action),
          type: "QUEUE_FLUSHED",
          actor: "System",
          details: `${state.actionQueue.length} handlinger synkroniseret`
        }
      );
    }

    case "SET_LOADING":
      return {
        ...state,
        ui: {
          ...state.ui,
          loadingTaskId: action.payload?.taskId ?? null,
          loadingLabel: action.payload?.label ?? ""
        }
      };

    case "PUSH_TOAST":
      return {
        ...state,
        ui: {
          ...state.ui,
          toasts: [...state.ui.toasts, action.payload]
        }
      };

    case "DISMISS_TOAST":
      return {
        ...state,
        ui: {
          ...state.ui,
          toasts: state.ui.toasts.filter((toast) => toast.id !== action.payload)
        }
      };

    case "OPEN_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          modal: action.payload
        }
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          modal: null
        }
      };

    case "SET_FILTERS":
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: {
            ...state.ui.filters,
            ...action.payload
          }
        }
      };

    case "TOGGLE_DEMO_CONTROLS":
      return {
        ...state,
        ui: {
          ...state.ui,
          showDemoControls: !state.ui.showDemoControls
        }
      };

    case "TOGGLE_NEXT_TASKS":
      return {
        ...state,
        ui: {
          ...state.ui,
          isNextTasksOpen: !state.ui.isNextTasksOpen
        }
      };

    case "SET_DAY_PROFILE": {
      const profile = action.payload;
      const nextProfile = DAY_PROFILES[profile] ? profile : "normal";
      const minimum = DAY_PROFILES[nextProfile].minTasks;
      const nextState = setTaskVolume(state, Math.max(state.demo.targetTaskCount, minimum), DAY_PROFILES[nextProfile].label);

      return appendEvent(
        {
          ...nextState,
          demo: {
            ...nextState.demo,
            dayProfile: nextProfile,
            targetTaskCount: Math.max(nextState.demo.targetTaskCount, minimum)
          }
        },
        {
          ts: nowIso(action),
          type: "DEMO_PROFILE",
          actor: "Demo",
          details: `Profil ændret til ${DAY_PROFILES[nextProfile].label}`
        }
      );
    }

    case "SET_TASK_VOLUME": {
      const target = Math.max(6, Math.min(30, Number(action.payload) || 6));
      const nextState = setTaskVolume(state, target, DAY_PROFILES[state.demo.dayProfile].label);
      return {
        ...nextState,
        demo: {
          ...nextState.demo,
          targetTaskCount: target
        }
      };
    }

    case "TRIGGER_ACUTE_SPIKE": {
      const nextTaskId = createTaskFactory(state.tasks);
      const acuteTasks = [
        createGeneratedTask(state, nextTaskId, {
          title: "Akut spike · triage 1",
          department: "dep-akut",
          priority: "crit",
          dueAt: new Date(Date.now() + 6 * 60000).toISOString()
        }),
        createGeneratedTask(state, nextTaskId, {
          title: "Akut spike · triage 2",
          department: "dep-akut",
          priority: "crit",
          dueAt: new Date(Date.now() + 8 * 60000).toISOString()
        }),
        createGeneratedTask(state, nextTaskId, {
          title: "Akut spike · triage 3",
          department: "dep-akut",
          priority: "warn",
          dueAt: new Date(Date.now() + 10 * 60000).toISOString()
        })
      ];

      return appendEvent(
        {
          ...state,
          tasks: [...acuteTasks, ...state.tasks]
        },
        {
          ts: nowIso(action),
          type: "ACUTE_SPIKE",
          actor: "Demo",
          details: "Akut belastning simuleret"
        }
      );
    }

    default:
      if (NETWORKED_ACTION_TYPES.has(action.type)) {
        return applyActionInternal(state, action);
      }
      return state;
  }
}

export function getLatencyForConnectivity(connectivity) {
  if (connectivity === "degraded") {
    return randomLatency(450, 850);
  }

  return randomLatency(300, 600);
}

export function selectCurrentEmployee(state) {
  return state.employees.find((employee) => employee.id === state.currentEmployeeId) ?? null;
}

export function selectEmployeeActiveTask(state, employeeId) {
  return (
    state.tasks.find(
      (task) =>
        task.assignedTo === employeeId &&
        ["assigned", "in_progress", "help_needed"].includes(task.status)
    ) ?? null
  );
}

export function selectEmployeeNextTasks(state, employeeId) {
  const employee = state.employees.find((item) => item.id === employeeId);
  if (!employee) {
    return [];
  }

  const primaryTaskIds = new Set(employee.assignedTaskIds);
  const assigned = state.tasks.filter(
    (task) =>
      task.assignedTo === employeeId &&
      ["assigned", "in_progress", "help_needed"].includes(task.status)
  );

  const pooled = state.tasks.filter((task) => {
    if (task.status !== "new") {
      return false;
    }

    return !primaryTaskIds.has(task.id);
  });

  return [...assigned, ...pooled].slice(0, 6);
}

export function selectOverdueTasks(state, nowMs = Date.now()) {
  return state.tasks.filter(
    (task) =>
      task.status === "new" &&
      isOlderThanMinutes(task.createdAt, OVERDUE_LIMIT_MINUTES, nowMs)
  );
}

export function selectDepartmentLoad(state) {
  return state.departments.map((department) => {
    const tasks = state.tasks.filter(
      (task) =>
        task.department === department.id && !["done", "cancelled"].includes(task.status)
    );

    const criticalCount = tasks.filter((task) => task.priority === "crit").length;

    let status = "ok";
    if (tasks.length >= 6 || criticalCount >= 2) {
      status = "crit";
    } else if (tasks.length >= 4 || criticalCount >= 1) {
      status = "warn";
    }

    return {
      ...department,
      taskCount: tasks.length,
      criticalCount,
      status
    };
  });
}

export function selectTasksForPlanner(state) {
  const { department, priority, status, query } = state.ui.filters;
  const normalizedQuery = query.trim().toLowerCase();

  return state.tasks.filter((task) => {
    if (task.status === "done" || task.status === "cancelled") {
      return false;
    }

    if (department !== "all" && task.department !== department) {
      return false;
    }

    if (priority !== "all" && task.priority !== priority) {
      return false;
    }

    if (status !== "all" && task.status !== status) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const assignee = state.employees.find((employee) => employee.id === task.assignedTo);
    const inTaskTitle = task.title.toLowerCase().includes(normalizedQuery);
    const inAssignee = assignee?.name.toLowerCase().includes(normalizedQuery);

    return Boolean(inTaskTitle || inAssignee);
  });
}

export function resolvePriorityLabel(priority) {
  return PRIORITY_META[priority]?.label ?? "Ukendt";
}
