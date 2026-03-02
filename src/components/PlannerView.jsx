import { Search, Siren, Sparkles } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { KanbanColumn } from "./KanbanColumn";
import { SectionTile } from "./SectionTile";
import { EMPLOYEE_STATUS_META, PRIORITY_META } from "../utils/mappings";
import { formatRelative } from "../utils/time";

const statusFilters = [
  { id: "all", label: "Alle" },
  { id: "new", label: "Ikke startet" },
  { id: "assigned", label: "Tildelt" },
  { id: "in_progress", label: "I gang" },
  { id: "help_needed", label: "Afventer hjælp" }
];

export function PlannerView({
  departments,
  departmentLoad,
  employees,
  tasks,
  overdueTasks,
  filters,
  nowMs,
  eventLog,
  onFilterChange,
  onTaskClick,
  onAutoAssign
}) {
  const overdueSet = new Set(overdueTasks.map((task) => task.id));
  const notStartedTasks = tasks.filter((task) => ["new", "assigned"].includes(task.status));
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const waitingHelpTasks = tasks.filter((task) => task.status === "help_needed");

  const helpCount = waitingHelpTasks.length;
  const criticalCount = tasks.filter((task) => task.priority === "crit").length;
  const unassignedCount = tasks.filter((task) => task.status === "new").length;

  const resetFilters = () => {
    onFilterChange({
      department: "all",
      priority: "all",
      status: "all",
      query: ""
    });
  };

  return (
    <section className="space-y-4">
      {overdueTasks.length > 0 ? (
        <div className="surface border-warning-600/30 bg-warning-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-warning-700">
              <Siren className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-semibold">
                {overdueTasks.length} opgaver kræver handling (over 15 minutter)
              </p>
            </div>
            <Button
              size="sm"
              aria-label="Auto-tildel alle forfaldne opgaver"
              icon={Sparkles}
              onClick={onAutoAssign}
            >
              Auto-tildel nu
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Aktive opgaver" value={tasks.length} tone="neutral" />
        <KpiCard label="Afventer hjælp" value={helpCount} tone={helpCount > 0 ? "danger" : "neutral"} />
        <KpiCard label="Ikke tildelt" value={unassignedCount} tone={unassignedCount > 3 ? "warning" : "neutral"} />
        <KpiCard label="Kritiske" value={criticalCount} tone={criticalCount > 0 ? "danger" : "success"} />
      </div>

      <Card
        title="Filtrering"
        subtitle="Fokuser hurtigt på afdeling, prioritet og status"
        actions={
          <Button variant="secondary" size="sm" aria-label="Nulstil filtre" onClick={resetFilters}>
            Nulstil
          </Button>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.4fr]">
          <FilterBlock title="Afdeling">
            <FilterChip
              active={filters.department === "all"}
              label="Alle"
              onClick={() => onFilterChange({ department: "all" })}
            />
            {departments.map((department) => (
              <FilterChip
                key={department.id}
                active={filters.department === department.id}
                label={department.name}
                onClick={() => onFilterChange({ department: department.id })}
              />
            ))}
          </FilterBlock>

          <FilterBlock title="Prioritet">
            <FilterChip
              active={filters.priority === "all"}
              label="Alle"
              onClick={() => onFilterChange({ priority: "all" })}
            />
            {Object.entries(PRIORITY_META).map(([id, meta]) => (
              <FilterChip
                key={id}
                active={filters.priority === id}
                label={meta.label}
                onClick={() => onFilterChange({ priority: id })}
              />
            ))}
          </FilterBlock>

          <div className="space-y-2">
            <FilterBlock title="Status">
              {statusFilters.map((statusFilter) => (
                <FilterChip
                  key={statusFilter.id}
                  active={filters.status === statusFilter.id}
                  label={statusFilter.label}
                  onClick={() => onFilterChange({ status: statusFilter.id })}
                />
              ))}
            </FilterBlock>
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                aria-label="Søg opgaver eller medarbejdere"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm"
                placeholder="Søg på opgavetitel eller medarbejder"
                value={filters.query}
                onChange={(event) => onFilterChange({ query: event.target.value })}
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr_1.65fr]">
        <Card title="Afsnit" subtitle="Belastning og kritikalitet" className="xl:min-h-[620px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {departmentLoad.map((section) => (
              <SectionTile key={section.id} section={section} />
            ))}
          </div>
        </Card>

        <Card title="Medarbejdere" subtitle="Status og aktivitetskø" className="xl:min-h-[620px]">
          <div className="space-y-2">
            {employees.map((employee) => {
              const status = EMPLOYEE_STATUS_META[employee.status] ?? EMPLOYEE_STATUS_META.available;
              return (
                <article
                  key={employee.id}
                  className="surface-quiet rounded-xl px-3 py-2.5 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="data-pill">Aktiv: {formatRelative(employee.lastActiveAt, nowMs)}</span>
                    <span className="data-pill">Kø: {employee.assignedTaskIds.length}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>

        <Card title="Opgaveflow" subtitle="Ikke startet, i gang, afventer hjælp" className="xl:min-h-[620px]">
          {tasks.length === 0 ? (
            <EmptyState
              title="Ingen opgaver matcher filter"
              description="Justér filtre eller nulstil for at se alle opgaver."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              <KanbanColumn
                title="Ikke startet"
                tasks={notStartedTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
                className="bg-slate-50/55"
              />
              <KanbanColumn
                title="I gang"
                tasks={inProgressTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
                className="bg-brand-50/35"
              />
              <KanbanColumn
                title="Afventer hjælp"
                tasks={waitingHelpTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
                className="bg-warning-50/35"
              />
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent activity" subtitle="Audit log">
        {eventLog.length === 0 ? (
          <EmptyState title="Ingen aktivitet endnu" description="Handlinger logges her." />
        ) : (
          <ul className="space-y-2">
            {eventLog.slice(0, 8).map((event) => (
              <li
                key={event.id}
                className="surface-quiet rounded-xl px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{event.type}</p>
                  <span className="data-pill">{formatRelative(event.ts, nowMs)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {event.actor} {event.taskId ? `· ${event.taskId}` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">{event.details}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-caption">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      aria-label={`Filter ${label}`}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function KpiCard({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "danger"
      ? "text-danger-700"
      : tone === "warning"
      ? "text-warning-700"
      : tone === "success"
      ? "text-success-700"
      : "text-slate-900";

  return (
    <article className="surface-soft p-3.5">
      <p className="text-caption">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
    </article>
  );
}
