import { ChevronDown, ChevronUp, Hand, PauseCircle, Play, SquareCheckBig } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SkeletonLoader } from "./SkeletonLoader";
import { TaskCard } from "./TaskCard";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { ListRow } from "./ui/ListRow";
import { SectionTitle } from "./ui/SectionTitle";
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

  return (
    <section className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Medarbejder"
          title={employee.name}
          subtitle="Næste opgave er din primære handling"
          actions={<Badge kind="status" tone={employeeStatus.tone}>{employeeStatus.label}</Badge>}
        />

        <Card className="overflow-hidden shadow-md">
          <CardHeader className="bg-[linear-gradient(110deg,rgba(37,99,235,0.12),transparent_55%)]">
            <div>
              <p className="eyebrow">Hero</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">
                {activeTask ? "Aktiv opgave" : "Næste opgave"}
              </h3>
              <p className="mt-1 text-sm text-app-muted">
                {loadingLabel && loadingTaskId ? loadingLabel : "Færdiggør denne før du går videre"}
              </p>
            </div>
            <Button
              aria-label={primaryLabel}
              icon={primaryLabel === "Start opgave" ? Play : SquareCheckBig}
              loading={Boolean(loadingTaskId)}
              onClick={() => onPrimaryAction(focusTask)}
              disabled={!focusTask || employee.status === "break"}
              size="lg"
            >
              {primaryLabel}
            </Button>
          </CardHeader>
          <CardContent>
            {loadingTaskId && focusTask && loadingTaskId === focusTask.id ? (
              <SkeletonLoader rows={4} />
            ) : focusTask ? (
              <TaskCard
                task={focusTask}
                departmentName={departmentLookup.get(focusTask.department) ?? "Ukendt afdeling"}
                assigneeName={employee.name}
                nowMs={nowMs}
              />
            ) : (
              <EmptyState title="Ingen opgaver" description="Du har ingen åbne opgaver lige nu." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              eyebrow="Sekundær"
              title="Næste opgaver"
              subtitle={`${nextTasks.length} i kø`}
              actions={
                <Button
                  variant="ghost"
                  size="md"
                  aria-label={isNextTasksOpen ? "Skjul næste opgaver" : "Vis næste opgaver"}
                  icon={isNextTasksOpen ? ChevronUp : ChevronDown}
                  onClick={onToggleNextTasks}
                >
                  {isNextTasksOpen ? "Skjul" : "Vis"}
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {isNextTasksOpen ? (
              nextTasks.length > 0 ? (
                nextTasks.slice(0, 6).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    departmentName={departmentLookup.get(task.department) ?? "Ukendt afdeling"}
                    assigneeName={task.assignedTo ? employee.name : null}
                    nowMs={nowMs}
                    compact
                  />
                ))
              ) : (
                <EmptyState
                  title="Ingen kommende opgaver"
                  description="Der er ikke flere opgaver i din kø."
                />
              )
            ) : null}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader>
            <SectionTitle
              eyebrow="Handlinger"
              title="Hurtige handlinger"
              subtitle="Min. klik under tidspres"
            />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="secondary"
              size="lg"
              icon={Hand}
              aria-label="Brug for hjælp"
              onClick={() => onHelp(focusTask)}
              disabled={!focusTask || Boolean(loadingTaskId) || employee.status === "break"}
              className="w-full"
            >
              Brug for hjælp
            </Button>
            <Button
              variant="ghost"
              size="lg"
              icon={PauseCircle}
              aria-label={pauseLabel}
              onClick={onPause}
              disabled={!canPause || Boolean(loadingTaskId)}
              className="w-full"
            >
              {pauseLabel}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle
              eyebrow="Guidance"
              title="Standardforløb"
              subtitle="Foldbar reference"
            />
          </CardHeader>
          <CardContent>
            <details open className="group">
              <summary className="cursor-pointer text-sm font-semibold text-app-text">Vis trin</summary>
              <div className="mt-2 space-y-2">
                <ListRow title="1. Start prioriteret opgave" />
                <ListRow title="2. Udfør prøvetagning" />
                <ListRow title="3. Færdigmeld eller bed om hjælp" />
              </div>
            </details>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}
