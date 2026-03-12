import { Clock3, CircleDotDashed, Hospital, User } from "lucide-react";
import { Badge } from "./ui/Badge";
import { PRIORITY_META, TASK_STATUS_META } from "../utils/mappings";
import { formatDateTime, formatRelative } from "../utils/time";
import { cn } from "../utils/cn";

export function TaskCard({
  task,
  departmentName,
  assigneeName,
  overdue = false,
  nowMs,
  compact = false,
  onClick,
  disabled
}) {
  const priority = PRIORITY_META[task.priority] ?? PRIORITY_META.ok;
  const status = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.new;

  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        },
        "aria-label": `Åbn opgave ${task.title}`
      }
    : {};

  if (compact) {
    return (
      <article
        {...interactiveProps}
        className={cn(
          "surface-subtle rounded-xl px-3 py-3",
          onClick ? "cursor-pointer transition hover:border-app-primary/30 hover:bg-white" : "",
          disabled ? "opacity-50" : "",
          overdue ? "border-amber-300 bg-amber-50/50" : ""
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app-text">{task.title}</p>
            <p className="mt-1 truncate text-xs text-app-muted">
              {departmentName} · {assigneeName ?? "Ikke tildelt"}
            </p>
          </div>
          <Badge kind="priority" tone={priority.tone}>{priority.label}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="data-pill">Deadline {formatDateTime(task.dueAt)}</span>
          {overdue ? <span className="data-pill border-amber-200 bg-amber-50 text-amber-700">Over 15 min</span> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      {...interactiveProps}
      className={cn(
        "surface-subtle rounded-2xl px-4 py-4",
        onClick ? "cursor-pointer transition hover:border-app-primary/30 hover:bg-white" : "",
        disabled ? "opacity-50" : "",
        overdue ? "border-amber-300 bg-amber-50/50" : ""
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-base font-semibold text-app-text">{task.title}</p>
        <Badge kind="priority" tone={priority.tone}>{priority.label}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge kind="status" tone={status.tone}>{status.label}</Badge>
        {overdue ? <Badge kind="status" tone="warning">Over 15 min</Badge> : null}
      </div>

      <div className="mt-4 grid gap-2 text-sm text-app-muted md:grid-cols-2">
        <p className="flex items-center gap-1.5">
          <Hospital className="h-4 w-4" aria-hidden="true" />
          {departmentName}
        </p>
        <p className="flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          Deadline: {formatDateTime(task.dueAt)}
        </p>
        <p className="flex items-center gap-1.5">
          <CircleDotDashed className="h-4 w-4" aria-hidden="true" />
          Tildelt: {formatRelative(task.assignedAt ?? task.createdAt, nowMs)}
        </p>
        <p className="flex items-center gap-1.5">
          <User className="h-4 w-4" aria-hidden="true" />
          {assigneeName ?? "Ikke tildelt"}
        </p>
      </div>
    </article>
  );
}
