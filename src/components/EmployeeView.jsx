import { ChevronDown, ChevronUp, Hand, PauseCircle, Play, SquareCheckBig } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";
import { TaskCard } from "./TaskCard";
import { EMPLOYEE_STATUS_META } from "../utils/mappings";

export function EmployeeView({
  employee,
  activeTask,
  nextTasks,
  departments,
  nowMs,
  loadingTaskId,
  loadingLabel,
  isNextTasksOpen,
  onToggleNextTasks,
  onPrimaryAction,
  onHelp,
  onPause
}) {
  const employeeStatus = EMPLOYEE_STATUS_META[employee.status] ?? EMPLOYEE_STATUS_META.available;
  const departmentLookup = new Map(departments.map((department) => [department.id, department.name]));

  const focusTask = activeTask ?? nextTasks[0] ?? null;
  const primaryLabel =
    focusTask && ["in_progress", "help_needed"].includes(focusTask.status)
      ? "Markér færdig"
      : "Start opgave";

  const canPause = employee.status !== "busy";
  const pauseLabel = employee.status === "break" ? "Afslut pause" : "Pause";
  const criticalCount = nextTasks.filter((task) => task.priority === "crit").length;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-4">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-[linear-gradient(130deg,rgba(37,99,235,0.08),transparent_58%)] p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-caption uppercase tracking-[0.14em]">Medarbejder</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                  {employee.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{employee.role}</p>
              </div>
              <Badge tone={employeeStatus.tone}>{employeeStatus.label}</Badge>
            </div>
          </div>
          <div className="grid gap-2 p-4 text-xs text-slate-600 md:grid-cols-3 md:p-5">
            <div className="surface-soft p-3">
              <p className="text-caption">Åbne opgaver</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{nextTasks.length}</p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-caption">Kritiske opgaver</p>
              <p className="mt-1 text-lg font-semibold text-danger-700">{criticalCount}</p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-caption">Anbefalet handling</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {focusTask ? primaryLabel : "Afvent ny opgave"}
              </p>
            </div>
          </div>
        </Card>

        <Card
          title={activeTask ? "Aktiv opgave" : "Næste opgave"}
          subtitle={loadingLabel && loadingTaskId ? loadingLabel : "Klar næste handling med ét klik"}
        >
          {loadingTaskId && focusTask && loadingTaskId === focusTask.id ? (
            <SkeletonLoader rows={4} />
          ) : focusTask ? (
            <TaskCard
              task={focusTask}
              departmentName={departmentLookup.get(focusTask.department) ?? "Ukendt afdeling"}
              assigneeName={employee.name}
              nowMs={nowMs}
              compact={false}
            />
          ) : (
            <EmptyState title="Ingen opgaver" description="Du har ingen åbne opgaver lige nu." />
          )}
        </Card>

        <Card
          title="Næste opgaver"
          subtitle={`${nextTasks.length} i kø`}
          actions={
            <Button
              variant="tertiary"
              size="sm"
              aria-label={isNextTasksOpen ? "Skjul næste opgaver" : "Vis næste opgaver"}
              onClick={onToggleNextTasks}
            >
              {isNextTasksOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          }
        >
          {isNextTasksOpen ? (
            <div className="space-y-2">
              {nextTasks.slice(0, 6).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  departmentName={departmentLookup.get(task.department) ?? "Ukendt afdeling"}
                  assigneeName={task.assignedTo ? employee.name : null}
                  nowMs={nowMs}
                  compact
                />
              ))}
              {nextTasks.length === 0 ? (
                <EmptyState
                  title="Ingen kommende opgaver"
                  description="Der er ikke flere opgaver i din kø."
                />
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
        <Card
          title="Hurtige handlinger"
          subtitle="Maks 2-3 handlinger pr. skærm"
          className="bg-white/95"
        >
          <div className="grid gap-2">
            <Button
              aria-label={primaryLabel}
              icon={primaryLabel === "Start opgave" ? Play : SquareCheckBig}
              loading={Boolean(loadingTaskId)}
              onClick={() => onPrimaryAction(focusTask)}
              disabled={!focusTask || employee.status === "break"}
              className="w-full"
            >
              {primaryLabel}
            </Button>
            <Button
              variant="secondary"
              icon={Hand}
              aria-label="Brug for hjælp"
              onClick={() => onHelp(focusTask)}
              disabled={!focusTask || Boolean(loadingTaskId) || employee.status === "break"}
              className="w-full"
            >
              Brug for hjælp
            </Button>
            <Button
              variant="tertiary"
              icon={PauseCircle}
              aria-label={pauseLabel}
              onClick={onPause}
              disabled={!canPause || Boolean(loadingTaskId)}
              className="w-full"
            >
              {pauseLabel}
            </Button>
          </div>
        </Card>

        <Card title="Guidance" subtitle="Forudsigeligt flow i travle perioder" className="bg-slate-50/90">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="surface-soft px-3 py-2">1. Start højeste prioritet først.</li>
            <li className="surface-soft px-3 py-2">2. Bed om hjælp ved kapacitetspres.</li>
            <li className="surface-soft px-3 py-2">3. Brug pause kun når køen er stabil.</li>
          </ul>
        </Card>
      </aside>
    </section>
  );
}
