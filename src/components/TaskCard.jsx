import { Clock3, CircleDotDashed, Hospital, User } from "lucide-react";
import { Badge } from "./Badge";
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
          "rounded-xl border bg-white px-3 py-2.5 transition",
          onClick ? "cursor-pointer hover:border-brand-300 hover:shadow-panel" : "",
          disabled ? "opacity-50" : "",
          overdue ? "border-warning-600 ring-1 ring-warning-600/40" : "border-slate-200"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {departmentName} · {assigneeName ?? "Ikke tildelt"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge tone={priority.tone}>{priority.label}</Badge>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
          <span className="data-pill">Deadline {formatDateTime(task.dueAt)}</span>
          <span className="data-pill">{formatRelative(task.assignedAt ?? task.createdAt, nowMs)}</span>
          {overdue ? <span className="data-pill border-warning-200 bg-warning-50 text-warning-700">Over 15 min</span> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      {...interactiveProps}
      className={cn(
        "rounded-xl border bg-white p-3 transition",
        onClick ? "cursor-pointer hover:border-brand-300 hover:shadow-panel" : "",
        disabled ? "opacity-50" : "",
        overdue ? "border-warning-600 ring-1 ring-warning-600/40" : "border-slate-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{task.title}</p>
        <Badge tone={priority.tone}>{priority.label}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone={status.tone}>{status.label}</Badge>
        {overdue ? <Badge tone="warning">Over 15 min</Badge> : null}
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
        <p className="flex items-center gap-1.5">
          <Hospital className="h-3.5 w-3.5" aria-hidden="true" />
          {departmentName}
        </p>
        <p className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Deadline: {formatDateTime(task.dueAt)}
        </p>
        <p className="flex items-center gap-1.5">
          <CircleDotDashed className="h-3.5 w-3.5" aria-hidden="true" />
          Tildelt: {formatRelative(task.assignedAt ?? task.createdAt, nowMs)}
        </p>
        <p className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          {assigneeName ?? "Ikke tildelt"}
        </p>
      </div>
    </article>
  );
}
