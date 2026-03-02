import type { ReactNode } from 'react';
import type { AppState, Task } from '../../../models/types';
import { getDepartmentById, getAutoAssignCountdownMs, typeLabel } from '../../../models/selectors';
import { formatCountdown, minutesAgo } from '../../../utils/format';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { PriorityBadge, TaskStatusBadge } from './StatusBadge';

interface TaskCardProps {
  task: Task;
  state: AppState;
  actions?: ReactNode;
  onClick?: () => void;
  compact?: boolean;
  showAutoAssign?: boolean;
}

export function TaskCard({ task, state, actions, onClick, compact = false, showAutoAssign = true }: TaskCardProps) {
  const department = getDepartmentById(state, task.departmentId);
  const countdown = getAutoAssignCountdownMs(task, state.now);
  const isUrgent = task.priority === 'akut';

  return (
    <Card className={isUrgent ? 'border-red-200' : undefined}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-950">{task.patientName}</p>
            <p className="text-sm text-slate-600">
              {task.patientId} · {task.location}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <PriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        <dl className={compact ? 'grid grid-cols-2 gap-2 text-sm' : 'grid grid-cols-2 gap-3 text-sm sm:grid-cols-4'}>
          <div>
            <dt className="text-xs text-slate-500">Afdeling</dt>
            <dd className="font-semibold text-slate-900">{department?.name ?? 'Ukendt'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Type</dt>
            <dd className="font-semibold text-slate-900">{typeLabel(task.type)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Oprettet</dt>
            <dd className="font-semibold text-slate-900">{minutesAgo(task.createdAt, state.now)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Team</dt>
            <dd className="font-semibold text-slate-900">{task.assignedTeamId ? task.assignedTeamId.replace('team-', 'Team ') : 'Ikke tildelt'}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {task.requiresExtraCheck && task.priority !== 'akut' ? (
              <Badge tone="info">Ekstra tjek kræves</Badge>
            ) : null}
            {task.autoAssigned ? <Badge tone="brand">Auto-tildelt</Badge> : null}
            {showAutoAssign && countdown !== null ? (
              <Badge tone={countdown === 0 ? 'danger' : 'warn'}>
                Auto-tildeles om {formatCountdown(countdown)}
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {onClick ? (
              <button
                type="button"
                onClick={onClick}
                className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Åbn
              </button>
            ) : null}
            {actions}
          </div>
        </div>
      </div>
    </Card>
  );
}
