import { Badge } from '../ui/Badge';
import { priorityLabel, statusLabel } from '../../../models/selectors';
import type { TaskPriority, TaskStatus } from '../../../models/types';

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone =
    status === 'faerdig'
      ? 'ok'
      : status === 'igang'
        ? 'brand'
        : status === 'venter'
          ? 'warn'
          : status === 'afmeldt'
            ? 'danger'
            : 'info';
  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={priority === 'akut' ? 'danger' : 'neutral'}>{priorityLabel(priority)}</Badge>;
}
