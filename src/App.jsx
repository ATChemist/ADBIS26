import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Button } from "./components/Button";
import { DemoControls } from "./components/DemoControls";
import { EmployeeView } from "./components/EmployeeView";
import { Modal } from "./components/Modal";
import { PlannerView } from "./components/PlannerView";
import { Tabs } from "./components/Tabs";
import { ToastStack } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import {
  NETWORKED_ACTION_TYPES,
  getLatencyForConnectivity,
  initialState,
  reducer,
  selectCurrentEmployee,
  selectDepartmentLoad,
  selectEmployeeActiveTask,
  selectEmployeeNextTasks,
  selectOverdueTasks,
  selectTasksForPlanner
} from "./store/store";
import { ADMIN_REASONS, HELP_REASONS } from "./utils/mappings";

const VIEW_TABS = [
  { id: "employee", label: "Medarbejder" },
  { id: "planner", label: "Planlægger" }
];

function buildToast(tone, title, message) {
  return {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    tone,
    title,
    message
  };
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [clockMs, setClockMs] = useState(Date.now());

  const [helpReason, setHelpReason] = useState(HELP_REASONS[0]);
  const [adminReason, setAdminReason] = useState(ADMIN_REASONS[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const currentEmployee = useMemo(() => selectCurrentEmployee(state), [state]);

  const activeTask = useMemo(() => {
    if (!currentEmployee) {
      return null;
    }

    return selectEmployeeActiveTask(state, currentEmployee.id);
  }, [state, currentEmployee]);

  const nextTasks = useMemo(() => {
    if (!currentEmployee) {
      return [];
    }

    return selectEmployeeNextTasks(state, currentEmployee.id);
  }, [state, currentEmployee]);

  const departmentLoad = useMemo(() => selectDepartmentLoad(state), [state]);

  const plannerTasks = useMemo(() => selectTasksForPlanner(state), [state]);
  const overdueTasks = useMemo(() => selectOverdueTasks(state, clockMs), [state, clockMs]);

  const modalTask = useMemo(() => {
    if (!state.ui.modal?.taskId) {
      return null;
    }

    return state.tasks.find((task) => task.id === state.ui.modal.taskId) ?? null;
  }, [state.ui.modal, state.tasks]);

  const queueCount = state.actionQueue.length;

  const pushToast = useCallback((tone, title, message) => {
    const toast = buildToast(tone, title, message);
    dispatch({ type: "PUSH_TOAST", payload: toast });

    window.setTimeout(() => {
      dispatch({ type: "DISMISS_TOAST", payload: toast.id });
    }, 4200);
  }, []);

  const dispatchWithLatency = useCallback(
    (action, options = {}) => {
      const timeStampedAction = {
        ...action,
        meta: {
          ...(action.meta ?? {}),
          ts: new Date().toISOString()
        }
      };

      const isNetworked = NETWORKED_ACTION_TYPES.has(action.type);

      if (isNetworked && state.connectivity === "offline") {
        dispatch({ type: "QUEUE_ACTION", payload: timeStampedAction });
        pushToast("warning", "Offline", "Handling gemt i lokal kø");
        return;
      }

      if (isNetworked) {
        dispatch({
          type: "SET_LOADING",
          payload: {
            taskId: options.loadingTaskId ?? action.payload?.taskId ?? null,
            label: options.loadingLabel ?? "Opdaterer..."
          }
        });

        window.setTimeout(() => {
          dispatch(timeStampedAction);
          dispatch({ type: "SET_LOADING", payload: null });
          if (options.toast) {
            pushToast(options.toast.tone, options.toast.title, options.toast.message);
          }
        }, getLatencyForConnectivity(state.connectivity));

        return;
      }

      dispatch(timeStampedAction);
      if (options.toast) {
        pushToast(options.toast.tone, options.toast.title, options.toast.message);
      }
    },
    [state.connectivity, pushToast]
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const elementTag = event.target?.tagName;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(elementTag);
      if (isTyping) {
        return;
      }

      if (event.key.toLowerCase() === "g") {
        dispatch({
          type: "SET_VIEW",
          payload: state.view === "employee" ? "planner" : "employee"
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.view]);

  useEffect(() => {
    if (state.connectivity !== "online" || state.actionQueue.length === 0) {
      return undefined;
    }

    const queuedCount = state.actionQueue.length;
    dispatch({
      type: "SET_LOADING",
      payload: {
        taskId: null,
        label: "Synkroniserer handlinger fra offline-kø..."
      }
    });

    const timer = window.setTimeout(() => {
      dispatch({ type: "FLUSH_QUEUE", meta: { ts: new Date().toISOString() } });
      dispatch({ type: "SET_LOADING", payload: null });
      pushToast("success", "Synkroniseret", `${queuedCount} handlinger afviklet`);
    }, getLatencyForConnectivity("online") + 200);

    return () => window.clearTimeout(timer);
  }, [state.connectivity, state.actionQueue.length, pushToast]);

  useEffect(() => {
    if (!state.ui.modal) {
      return;
    }

    if (state.ui.modal.type === "help") {
      setHelpReason(HELP_REASONS[0]);
    }

    if (state.ui.modal.type === "manage-task") {
      setAdminReason(ADMIN_REASONS[0]);
      const taskId = state.ui.modal.taskId;
      const task = state.tasks.find((item) => item.id === taskId);
      const fallbackEmployeeId =
        state.employees.find((employee) => employee.status !== "break")?.id ?? state.employees[0]?.id;
      setSelectedEmployeeId(task?.assignedTo ?? fallbackEmployeeId ?? "");
    }
  }, [state.ui.modal, state.tasks, state.employees]);

  const handleConnectivityChange = (value) => {
    dispatch({ type: "SET_CONNECTIVITY", payload: value, meta: { ts: new Date().toISOString() } });

    if (value === "offline") {
      pushToast("warning", "Offline mode", "Handlinger lægges i kø");
    } else if (value === "degraded") {
      pushToast("warning", "Degraded mode", "Forhøjet latency i handlinger");
    } else {
      pushToast("success", "Online", "Systemforbindelse normal");
    }
  };

  const handlePrimaryAction = (task) => {
    if (!task || !currentEmployee) {
      return;
    }

    if (["in_progress", "help_needed"].includes(task.status)) {
      dispatchWithLatency(
        {
          type: "COMPLETE_TASK",
          payload: {
            taskId: task.id,
            actor: currentEmployee.name
          }
        },
        {
          loadingTaskId: task.id,
          loadingLabel: "Markerer opgave som færdig",
          toast: {
            tone: "success",
            title: "Opgave færdig",
            message: task.title
          }
        }
      );
      return;
    }

    dispatchWithLatency(
      {
        type: "START_TASK",
        payload: {
          taskId: task.id,
          employeeId: currentEmployee.id,
          actor: currentEmployee.name
        }
      },
      {
        loadingTaskId: task.id,
        loadingLabel: "Starter opgave",
        toast: {
          tone: "info",
          title: "Opgave startet",
          message: task.title
        }
      }
    );
  };

  const handlePause = () => {
    if (!currentEmployee || currentEmployee.status === "busy") {
      return;
    }

    const nextStatus = currentEmployee.status === "break" ? "available" : "break";

    dispatchWithLatency(
      {
        type: "SET_EMP_STATUS",
        payload: {
          employeeId: currentEmployee.id,
          status: nextStatus
        }
      },
      {
        toast: {
          tone: "info",
          title: nextStatus === "break" ? "Pause aktiveret" : "Pause afsluttet",
          message: currentEmployee.name
        }
      }
    );
  };

  const openHelpModal = (task) => {
    if (!task || !currentEmployee) {
      return;
    }

    dispatch({
      type: "OPEN_MODAL",
      payload: {
        type: "help",
        taskId: task.id,
        employeeId: currentEmployee.id
      }
    });
  };

  const submitHelpRequest = () => {
    if (!modalTask || !currentEmployee) {
      return;
    }

    dispatchWithLatency(
      {
        type: "REQUEST_HELP",
        payload: {
          taskId: modalTask.id,
          employeeId: currentEmployee.id,
          reason: helpReason,
          actor: currentEmployee.name
        }
      },
      {
        loadingTaskId: modalTask.id,
        loadingLabel: "Sender hjælpekald",
        toast: {
          tone: "warning",
          title: "Hjælpekald sendt",
          message: helpReason
        }
      }
    );

    dispatch({ type: "CLOSE_MODAL" });
  };

  const openTaskModal = (task) => {
    dispatch({
      type: "OPEN_MODAL",
      payload: {
        type: "manage-task",
        taskId: task.id
      }
    });
  };

  const submitTaskAssignment = () => {
    if (!modalTask || !selectedEmployeeId) {
      return;
    }

    const isUnassigned = !modalTask.assignedTo;

    if (isUnassigned) {
      dispatchWithLatency(
        {
          type: "ASSIGN_TASK",
          payload: {
            taskId: modalTask.id,
            employeeId: selectedEmployeeId,
            actor: "Planlægger"
          }
        },
        {
          loadingTaskId: modalTask.id,
          loadingLabel: "Tildeler opgave",
          toast: {
            tone: "success",
            title: "Opgave tildelt",
            message: modalTask.title
          }
        }
      );
      dispatch({ type: "CLOSE_MODAL" });
      return;
    }

    if (modalTask.assignedTo === selectedEmployeeId) {
      return;
    }

    dispatchWithLatency(
      {
        type: "REASSIGN_TASK",
        payload: {
          taskId: modalTask.id,
          toEmployeeId: selectedEmployeeId,
          reason: adminReason,
          actor: "Planlægger"
        }
      },
      {
        loadingTaskId: modalTask.id,
        loadingLabel: "Omfordeler opgave",
        toast: {
          tone: "info",
          title: "Opgave omfordelt",
          message: adminReason
        }
      }
    );

    dispatch({ type: "CLOSE_MODAL" });
  };

  const cancelTask = () => {
    if (!modalTask) {
      return;
    }

    dispatchWithLatency(
      {
        type: "CANCEL_TASK",
        payload: {
          taskId: modalTask.id,
          reason: adminReason,
          actor: "Planlægger"
        }
      },
      {
        loadingTaskId: modalTask.id,
        loadingLabel: "Annullerer opgave",
        toast: {
          tone: "danger",
          title: "Opgave annulleret",
          message: adminReason
        }
      }
    );

    dispatch({ type: "CLOSE_MODAL" });
  };

  const runAutoAssign = () => {
    dispatchWithLatency(
      {
        type: "AUTO_ASSIGN_OVERDUE",
        payload: {}
      },
      {
        loadingLabel: "Auto-tildeler forfaldne opgaver",
        toast: {
          tone: "success",
          title: "Auto-tildeling udført",
          message: "Forfaldne opgaver er fordelt"
        }
      }
    );
  };

  if (!currentEmployee) {
    return null;
  }

  const isTaskManageModal = state.ui.modal?.type === "manage-task";
  const isHelpModal = state.ui.modal?.type === "help";
  const taskIsUnassigned = Boolean(modalTask && !modalTask.assignedTo);
  const taskConfirmLabel = taskIsUnassigned ? "Tildel opgave" : "Gem omfordeling";
  const currentViewLabel = state.view === "employee" ? "Medarbejderflow" : "Planlægger-overblik";
  const currentViewDescription =
    state.view === "employee"
      ? "Fokuser på næste handling med tydelige knapper og reduceret kognitiv belastning."
      : "Styr kapacitet, prioritering og opgaveflow i et samlet kontrolrum.";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1680px] space-y-4 p-3 md:p-6">
        <TopBar
          clockMs={clockMs}
          connectivity={state.connectivity}
          queueCount={queueCount}
          onConnectivityChange={handleConnectivityChange}
        />

        <div className="surface overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-[linear-gradient(115deg,rgba(37,99,235,0.08),transparent_45%)] p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs
                tabs={VIEW_TABS}
                value={state.view}
                onChange={(nextView) => dispatch({ type: "SET_VIEW", payload: nextView })}
                ariaLabel="Skift mellem medarbejder og planlægger"
              />
              <p className="text-caption">Keyboard shortcut: tryk "g" for at skifte view</p>
            </div>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center md:p-5">
            <div>
              <p className="text-caption uppercase tracking-[0.14em]">{currentViewLabel}</p>
              <p className="mt-1 text-sm text-slate-600">{currentViewDescription}</p>
            </div>
            {state.ui.loadingLabel ? (
              <span className="data-pill bg-brand-50 text-brand-700">{state.ui.loadingLabel}</span>
            ) : (
              <span className="data-pill">System responsivt</span>
            )}
          </div>
        </div>

        <DemoControls
          open={state.ui.showDemoControls}
          dayProfile={state.demo.dayProfile}
          taskVolume={state.demo.targetTaskCount}
          onToggle={() => dispatch({ type: "TOGGLE_DEMO_CONTROLS" })}
          onProfileChange={(profile) =>
            dispatch({
              type: "SET_DAY_PROFILE",
              payload: profile,
              meta: { ts: new Date().toISOString() }
            })
          }
          onVolumeChange={(value) => dispatch({ type: "SET_TASK_VOLUME", payload: value })}
          onSpike={() => {
            dispatch({ type: "TRIGGER_ACUTE_SPIKE", meta: { ts: new Date().toISOString() } });
            pushToast("danger", "Akut spike", "Tre nye hasteopgaver tilføjet");
          }}
        />

        {state.view === "employee" ? (
          <EmployeeView
            employee={currentEmployee}
            activeTask={activeTask}
            nextTasks={nextTasks}
            departments={state.departments}
            nowMs={clockMs}
            loadingTaskId={state.ui.loadingTaskId}
            loadingLabel={state.ui.loadingLabel}
            isNextTasksOpen={state.ui.isNextTasksOpen}
            onToggleNextTasks={() => dispatch({ type: "TOGGLE_NEXT_TASKS" })}
            onPrimaryAction={handlePrimaryAction}
            onHelp={openHelpModal}
            onPause={handlePause}
          />
        ) : (
          <PlannerView
            departments={state.departments}
            departmentLoad={departmentLoad}
            employees={state.employees}
            tasks={plannerTasks}
            overdueTasks={overdueTasks}
            filters={state.ui.filters}
            nowMs={clockMs}
            eventLog={state.eventLog}
            onFilterChange={(payload) => dispatch({ type: "SET_FILTERS", payload })}
            onTaskClick={openTaskModal}
            onAutoAssign={runAutoAssign}
          />
        )}
      </div>

      <Modal
        open={isHelpModal}
        title="Brug for hjælp"
        description="Vælg årsag til hjælpekald"
        confirmLabel="Send hjælpekald"
        onConfirm={submitHelpRequest}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
      >
        <label className="space-y-1">
          <span className="text-caption">Årsag</span>
          <select
            aria-label="Vælg årsag til hjælpekald"
            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
            value={helpReason}
            onChange={(event) => setHelpReason(event.target.value)}
          >
            {HELP_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </label>
      </Modal>

      <Modal
        open={isTaskManageModal}
        title="Administrer opgave"
        description="Planlægger kan tildele, omfordele eller annullere"
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        footer={
          <>
            <Button
              variant="secondary"
              aria-label="Luk opgavemodal"
              onClick={() => dispatch({ type: "CLOSE_MODAL" })}
            >
              Luk
            </Button>
            {modalTask?.assignedTo ? (
              <Button variant="danger" aria-label="Annuller opgave" onClick={cancelTask}>
                Annuller opgave
              </Button>
            ) : null}
            <Button
              aria-label={taskConfirmLabel}
              onClick={submitTaskAssignment}
              disabled={!modalTask || !selectedEmployeeId || modalTask.assignedTo === selectedEmployeeId}
            >
              {taskConfirmLabel}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{modalTask?.title}</p>
            <p className="mt-1">Task ID: {modalTask?.id}</p>
          </div>

          <label className="space-y-1">
            <span className="text-caption">Medarbejder</span>
            <select
              aria-label="Vælg medarbejder til opgaven"
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
            >
              {state.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.status})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-caption">Begrundelse</span>
            <select
              aria-label="Vælg begrundelse"
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
              value={adminReason}
              onChange={(event) => setAdminReason(event.target.value)}
            >
              {ADMIN_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>

      <ToastStack
        toasts={state.ui.toasts}
        onDismiss={(id) => dispatch({ type: "DISMISS_TOAST", payload: id })}
      />
    </main>
  );
}
