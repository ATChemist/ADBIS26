import { Card, CardContent, CardHeader } from "./ui/Card";
import { EmptyState } from "./EmptyState";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({
  title,
  tasks,
  departments,
  employees,
  nowMs,
  overdueTaskIds,
  onTaskClick,
  className
}) {
  const departmentLookup = new Map(departments.map((department) => [department.id, department.name]));
  const employeeLookup = new Map(employees.map((employee) => [employee.id, employee.name]));

  return (
    <Card className={className}>
      <CardHeader className="px-4 py-3">
        <div>
          <p className="eyebrow">Flow</p>
          <h4 className="mt-1 text-sm font-semibold text-app-text">{title}</h4>
        </div>
        <span className="data-pill">{tasks.length}</span>
      </CardHeader>
      <CardContent className="max-h-[540px] space-y-2 overflow-y-auto px-4 py-3">
        {tasks.length === 0 ? (
          <EmptyState title="Ingen opgaver" description="Kolonnen er tom." />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              nowMs={nowMs}
              departmentName={departmentLookup.get(task.department) ?? "Ukendt afdeling"}
              assigneeName={task.assignedTo ? employeeLookup.get(task.assignedTo) : null}
              overdue={overdueTaskIds.has(task.id)}
              onClick={() => onTaskClick(task)}
              compact
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
