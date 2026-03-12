import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, Sparkles } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { SectionTile } from "./SectionTile";
import { Badge } from "./ui/Badge";
import { Banner } from "./ui/Banner";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { ListRow } from "./ui/ListRow";
import { SectionTitle } from "./ui/SectionTitle";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const overdueSet = new Set(overdueTasks.map((task) => task.id));
  const notStartedTasks = tasks.filter((task) => ["new", "assigned"].includes(task.status));
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const waitingHelpTasks = tasks.filter((task) => task.status === "help_needed");

  const criticalCount = tasks.filter((task) => task.priority === "crit").length;
  const unassignedCount = tasks.filter((task) => task.status === "new").length;
  const activeEmployeeCount = useMemo(
    () => employees.filter((employee) => employee.status !== "break").length,
    [employees]
  );

  const resetFilters = () => {
    onFilterChange({
      department: "all",
      priority: "all",
      status: "all",
      query: ""
    });
  };

  return (
    <section className="space-y-6">
      <SectionTitle
        eyebrow="Planlægger"
        title="Control room"
        subtitle="Prioriter opgaver, monitorér teamet og håndtér undtagelser"
        actions={
          <div className="flex items-center gap-2">
            <Badge kind="status" tone={criticalCount > 0 ? "danger" : "success"}>
              Kritiske: {criticalCount}
            </Badge>
            <Badge kind="status" tone={unassignedCount > 3 ? "warning" : "neutral"}>
              Ikke tildelt: {unassignedCount}
            </Badge>
          </div>
        }
      />

      {overdueTasks.length > 0 ? (
        <Banner
          tone="warn"
          title={`${overdueTasks.length} opgaver kræver handling`}
          description="Semitvungen regel: Opgaver over 15 min bør auto-tildeles nu."
          actions={
            <Button
              size="md"
              aria-label="Auto-tildel alle forfaldne opgaver"
              icon={Sparkles}
              onClick={onAutoAssign}
            >
              Auto-tildel nu
            </Button>
          }
        />
      ) : null}

      <Card>
        <CardHeader>
          <SectionTitle
            eyebrow="Filters"
            title="Filtrering"
            subtitle="Hold kontrolrummet fokuseret"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" aria-label="Nulstil filtre" onClick={resetFilters}>
                  Nulstil
                </Button>
                <Button
                  variant="ghost"
                  aria-label={filtersOpen ? "Skjul filtre" : "Vis filtre"}
                  icon={filtersOpen ? ChevronUp : ChevronDown}
                  onClick={() => setFiltersOpen((prev) => !prev)}
                >
                  {filtersOpen ? "Skjul" : "Vis"}
                </Button>
              </div>
            }
          />
        </CardHeader>

        {filtersOpen ? (
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr]">
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

              <div className="space-y-3">
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
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-app-muted"
                    aria-hidden="true"
                  />
                  <input
                    aria-label="Søg opgaver eller medarbejdere"
                    className="min-h-11 w-full rounded-xl border border-app-border bg-white pl-9 pr-3 text-sm text-app-text"
                    placeholder="Søg på opgavetitel eller medarbejder"
                    value={filters.query}
                    onChange={(event) => onFilterChange({ query: event.target.value })}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.75fr_0.45fr]">
        <div className="space-y-4">
          <SectionTitle eyebrow="Primær zone" title="Opgaveflow" subtitle="Flowet fylder mest for hurtig triage" />
          {tasks.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-app-muted">Ingen opgaver matcher filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <KanbanColumn
                title="Ikke startet"
                tasks={notStartedTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
              />
              <KanbanColumn
                title="I gang"
                tasks={inProgressTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
              />
              <KanbanColumn
                title="Afventer hjælp"
                tasks={waitingHelpTasks}
                departments={departments}
                employees={employees}
                overdueTaskIds={overdueSet}
                nowMs={nowMs}
                onTaskClick={onTaskClick}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SectionTitle
            eyebrow="Sekundær zone"
            title="Medarbejdere"
            subtitle={`Aktive nu: ${activeEmployeeCount}`}
          />
          <Card>
            <CardContent className="space-y-2">
              {employees.map((employee) => {
                const status = EMPLOYEE_STATUS_META[employee.status] ?? EMPLOYEE_STATUS_META.available;
                return (
                  <ListRow
                    key={employee.id}
                    title={employee.name}
                    subtitle={`Sidst aktiv ${formatRelative(employee.lastActiveAt, nowMs)}`}
                    trailing={<Badge kind="status" tone={status.tone}>{status.label}</Badge>}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <SectionTitle eyebrow="Alerts" title="Handlinger" subtitle="Kompakt sidepanel" />

          <Card>
            <CardContent className="space-y-2">
              <ListRow title="Forfaldne opgaver" trailing={<span className="data-pill">{overdueTasks.length}</span>} />
              <ListRow title="Afventer hjælp" trailing={<span className="data-pill">{waitingHelpTasks.length}</span>} />
              <ListRow title="Uden tildeling" trailing={<span className="data-pill">{unassignedCount}</span>} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <SectionTitle
                eyebrow="Afsnit"
                title="Belastning"
                actions={
                  <Button
                    variant="ghost"
                    aria-label={sectionsOpen ? "Skjul afsnit" : "Vis afsnit"}
                    icon={sectionsOpen ? ChevronUp : ChevronDown}
                    onClick={() => setSectionsOpen((prev) => !prev)}
                  >
                    {sectionsOpen ? "Skjul" : "Vis"}
                  </Button>
                }
              />
            </CardHeader>
            {sectionsOpen ? (
              <CardContent className="space-y-2">
                {departmentLoad.map((section) => (
                  <SectionTile key={section.id} section={section} />
                ))}
              </CardContent>
            ) : null}
          </Card>

          <Card>
            <CardHeader className="py-4">
              <SectionTitle eyebrow="Audit" title="Recent activity" />
            </CardHeader>
            <CardContent className="space-y-2">
              {eventLog.slice(0, 6).map((event) => (
                <ListRow
                  key={event.id}
                  title={event.type}
                  subtitle={`${event.actor}${event.taskId ? ` · ${event.taskId}` : ""}`}
                  trailing={<span className="data-pill">{formatRelative(event.ts, nowMs)}</span>}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="eyebrow">{title}</p>
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
      className={`min-h-11 rounded-full border px-3 text-xs font-semibold transition ${
        active
          ? "border-app-primary/35 bg-app-primary/10 text-app-primary"
          : "border-app-border bg-white text-app-muted hover:border-app-primary/20 hover:text-app-text"
      }`}
    >
      {label}
    </button>
  );
}
