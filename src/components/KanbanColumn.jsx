import { Card } from "./Card";
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
    <Card title={title} subtitle={`${tasks.length} opgaver`} className={`h-full ${className ?? ""}`}>
      <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <EmptyState title="Ingen opgaver" description="Kolonnen er tom lige nu." />
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
            />
          ))
        )}
      </div>
    </Card>
  );
}
